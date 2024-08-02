import * as error from '../exception/error.js';
import * as request from '../manager/manager_request.js';

export function showInfo(message){
  const infoLabel = document.getElementById('info');
  infoLabel.innerHTML = message;
  infoLabel.className = 'text-info';
}

export function showError(e){
  if(!(e instanceof error.Error)){
    return;
  }
  const message = error.errorToString(e);
  const infoLabel = document.getElementById('info');
  infoLabel.innerHTML = message;
  infoLabel.className = 'text-warning';
}

function showPopupError(e){
  if(!(e instanceof error.Error)){
    return;
  }
  const message = error.errorToString(e);
  const infoLabel = document.getElementById('info-popup');
  infoLabel.innerHTML = message;
}



function getTrContent(address){ 
  var codeHTML = `
    <td>
      <div class="container">
        <div class="row">
          <div class="col-10">
            <div class="d-flex align-items-center">
              <div class="mx-2">
                <div id="address-div" class="text-center" style=" max-width: 250px; overflow-x: auto; vertical-align:middle;" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Go to mailbox">
                    <p class="text-info" style="white-space: nowrap; vertical-align:middle;">${address}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-1">
            <div class="d-flex align-items-center justify-content-center">
              <div class="d-flex justify-content-center text-center">
                <button id="copy-button" class="btn transparent-button" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Copy email address to clipboard">
                  <img src="../svg-images/copy.svg" alt="Delete Icon" style="width: 20px; height: 20px;">
                </button> 
                <button id="delete-button" class="btn transparent-button" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Delete">
                  <img src="../svg-images/delete.svg" alt="Delete Icon" style="width: 20px; height: 20px;">
                </button>                
              </div>
            </div>
          </div>
        </div>
      </div>
    </td>`;
  return codeHTML;


}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    throw new error.Error('Error copying to clipboard.', true);
  }
}

export async function fillAddressList(){
  try{
    const emails = await request.makeRequest('emails', 'get', { decrypted: true });
    const tab = document.querySelector('#tab-body');
    tab.innerHTML = ''; 
    if(emails.length === 0){
      tab.innerHTML = '<p class="lead text-center">Nothing here. </br> Click the add button to add a temporary email address !</p>';
    }
    else{
      for(const email of emails) {
        const trElement = document.createElement('tr');
        trElement.innerHTML = getTrContent(email.email.address);
        const addressDiv = trElement.querySelector('#address-div');
        addressDiv.style.cursor = 'pointer';
        addressDiv.addEventListener('click', function(){
          const url = browser.runtime.getURL('../../html/mailBox.html') + '?emailId=' + encodeURIComponent(email.id);
          browser.tabs.create({ url });
        });
        const copyButton = trElement.querySelector('#copy-button');
        const deleteButton = trElement.querySelector('#delete-button');
        copyButton.addEventListener('click', async function(){
          try{
            copyToClipboard(email.email.address);
            showInfo('Copied !')
          }
          catch(error){
            showError(error);
          }
        });
        deleteButton.addEventListener('click', async function(){
          try{
            await request.makeRequest('emails', 'delete', { id: email.id, total: true });
            fillAddressList();
          }
          catch(error){
            showError(error);
          }
        });
        tab.appendChild(trElement);
      }
    }
  }
  catch(error){
    showError(error);
  }

}



document.addEventListener("DOMContentLoaded", function() {
    fillAddressList();
    const logOutButton = document.getElementById('log-out');
    logOutButton.addEventListener("click", async function(event){
      try {
        await request.makeRequest('logout', null, null);
        window.location.href = "/html/login.html";
      }
      catch(e) {
        showError(e);
      }
    });
    const settingsButton = document.getElementById('settings');
    settingsButton.addEventListener("click", function(){
      const url = browser.runtime.getURL('../../html/settings.html');
      browser.tabs.create({ url });
    });
    const aboutButton = document.getElementById('about');
    aboutButton.addEventListener("click", function(){
      const url = browser.runtime.getURL('../../html/about.html');
      browser.tabs.create({ url });
    });
    const passwordButton = document.getElementById('password-button');
    passwordButton.addEventListener("click", function(){
      const url = browser.runtime.getURL('../../html/passwords.html');
      browser.tabs.create({ url });
    });
});