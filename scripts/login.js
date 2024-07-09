import * as tools from './login_tools.js';
import * as error from './exception/error.js';

function showError(e){
  if(!(e instanceof error.Error)){
    return;
  }
  const message = error.errorToString(e);
  const infoLabel = document.getElementById('info');
  infoLabel.innerHTML = message;
}

document.addEventListener("DOMContentLoaded", async function() {
  try{
    if(await tools.isFirstLogin()) {
      window.location.href = "/html/firstConnection.html";
    }
    const isLogged = await tools.isLogged();
    if(isLogged) {
      window.location.href = "/html/emails.html";
    }
    var form = document.getElementById("login-form");
    form.addEventListener("submit", async function(event) {
      event.preventDefault();
      var password = document.getElementById("password").value;
      if(await tools.login(password)){
        window.location.href = "/html/emails.html";
      }
      else{
        const infoLabel = document.getElementById('info');
        infoLabel.innerText = 'Login failed.';
      }
    });
  }
  catch(error){
    showError(error);
  }

});