import * as storage from '../tools/storage.js';
import * as error from '../exception/error.js';
import * as crypto from '../tools/crypto.js';
import * as popup from '../popup.js';
import {showInfo, showError, showPopupError, showPopupInfo} from './info.js';
import { fillGeneratorsList } from './generator.js';

function get_meta_data() {
    const version = 1; //Jack's Mails accoutn file version
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    return {
        version: version,
        creation: formattedTime
    };
}
async function get_json() {
    const masterPswHash = await storage.read('masterPswHash');
    const connectionDuration = await storage.read('connectionDuration');
    const emails = await storage.read('emails');
    const logs = await storage.read('logs');
    const psw_generators = await storage.read('psw_generators');
    const metadata = get_meta_data();
    const jsonData = {
        metadata: metadata,
        masterPswHash: masterPswHash,
        connectionDuration: connectionDuration,
        emails: emails,
        logs: logs,
        psw_generators: psw_generators
    };
    return jsonData;
}

export async function export_account(password, givenFileName) {
    if(await crypto.validPassword(password) === false){
        throw new error.Error('Your current password is invalid.', true);
    }
    const jsonObject = await get_json();
    var filename;
    if(givenFileName === '') {
        filename = 'jack-mail-data.json';
    }
    else {
        filename = givenFileName + '.json';
    }

    const jsonStr = JSON.stringify(jsonObject, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


async function read_json_file(jsonfile) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsText(jsonfile);
        reader.onload = function(event) {
            try {
                const jsonData = JSON.parse(event.target.result);
                resolve(jsonData);
            } catch (e) {
                reject(new error.Error('Error reading account file.', true));
            }
        };
        reader.onerror = function() {
            reject(new error.Error('Account file is unreadable.', true));
        };
    });
}

export async function import_account(jsonfile, password, keepCurrPsw) {
    const json = await read_json_file(jsonfile);
    //Check if these required values exists
    if (!(json.metadata && json.metadata.version && json.masterPswHash)) {
        throw new error.Error('Account file is corrupted.', true);
    }
    const version = json.metadata.version;
    if(version !== 1) { // If, in a future version of Jack's Mails, the file account won't be the same 
        throw new error.Error("This account file version is not supported. Please udpate Jack's Mails to import this account.", true);
    }
    const masterPswHash = json.masterPswHash;
    const connectionDuration = json.connectionDuration ?? 3; // 3 mins is default value
    const emails = json.emails ?? []; //Empty list by default
    const logs = json.logs ?? [];
    const psw_generators = json.psw_generators ?? [];

    if(!(await crypto.isValidHash(password, masterPswHash))) {
        throw new error.Error('Invalid password. Unable to decrypt the file.', true);
    }

    if(keepCurrPsw) {
        const currentKey = await crypto.getDerivedKey();
        try {
            const otherKey = await crypto.generateDerivedKey(password);
            var newEmails = [];
            var newLogs = [];
            for(const element of emails) {
                const email = await crypto.decryptWithAES(element.email, otherKey);
                const newEncryption = await crypto.encryptWithAES(email, currentKey);
                const newElement = {
                    id: element.id,
                    email: newEncryption
                };
                newEmails.push(newElement);
            }
            for(const element of logs) {
                const title = await crypto.decryptWithAES(element.content.title, otherKey);
                const url = await crypto.decryptWithAES(element.content.url, otherKey);
                const username = await crypto.decryptWithAES(element.content.username, otherKey);
                const password = await crypto.decryptWithAES(element.content.password, otherKey);
                const description = await crypto.decryptWithAES(element.content.description, otherKey);

                const newTitle = await crypto.encryptWithAES(title, currentKey);
                const newUrl = await crypto.encryptWithAES(url, currentKey);
                const newUsername = await crypto.encryptWithAES(username, currentKey);
                const newPassword = await crypto.encryptWithAES(password, currentKey);
                const newDescription = await crypto.encryptWithAES(description, currentKey);

                const newElement = {
                    id: element.id,
                    content: {
                        title: newTitle,
                        url: newUrl,
                        username: newUsername,
                        password: newPassword,
                        description: newDescription
                    }
                };
                newLogs.push(newElement);
            }
        }
        catch(e) {
            throw new error.Error('Unable to decrypt account file. It may be corrupted.', true);
        }
        await storage.store({ connectionDuration: connectionDuration});
        await storage.store({ emails: newEmails });
        await storage.store({ logs: newLogs });
        await storage.store({ psw_generators: psw_generators});
    }

    else {
        await storage.store({ masterPswHash: masterPswHash});
        await storage.store({ connectionDuration: connectionDuration});
        await storage.store({ emails: emails});
        await storage.store({ logs: logs });
        await storage.store({ psw_generators: psw_generators});
        const newKey = await crypto.generateDerivedKey(password);
        await crypto.storeDerivedKey(newKey);
    }
}




//ACTION LISTENERS 

function passwordConfirmPopupContent() {
    return `
      <p class="lead">Confirm your password</p>
      <p style="font-size:0.9em;">This file will be protected by your current master password.</p>
      <form id="confirm-psw-form">
          <div class="m-1">
            <input placeholder="Enter your password" type="password" id="confirm-psw-input" autocomplete="off" class="form-control dark-input d-block mx-auto" style="width: 80%;">
            <button type="submit" class="confirm-button mt-2 d-block mx-auto" style="width: 80%;">Export</button>
          </div>
      </form>
      <p id="popup-info" class="mt-2" style="font-size: 0.8em;"></p>
    `;
}

async function askForPasswordConfirm() {
    popup.initClosePopupEvent();
    popup.fillPopupContent(passwordConfirmPopupContent());
    popup.setPopupSize(300, 300);
    popup.openPopup();
    const popupContent = document.getElementById('popup-content');
    const confirmPswForm = popupContent.querySelector('#confirm-psw-form');
    const confirmPswInput = popupContent.querySelector('#confirm-psw-input');

    return new Promise((resolve, reject) => {
        confirmPswForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const givenPsw = confirmPswInput.value;
            try {
                if (await crypto.validPassword(givenPsw) === false) {
                    showPopupInfo('Invalid password.', true);
                    confirmPswInput.value = '';
                } else {
                    popup.closePopup();
                    resolve(givenPsw);
                }
            } catch (e) {
                reject(e);
            }
        });
    });
}

function confirmFilePswContent() {
    return `
    <p class="lead">Import data</p>
    <p class="text-warning" style="font-size: 0.9em;">Your current data will be deleted and replaced with the data from the imported file.</p>
    <form id="confirm-file-psw-form">
        <div class="m-1">
          <input required placeholder="File's password" type="password" id="confirm-file-psw-input" autocomplete="off" class="form-control dark-input d-block mx-auto" style="width: 80%;">
          <button type="submit" class="confirm-button mt-2 d-block mx-auto" style="width: 80%;">Import</button>
        </div>
    </form>
    <p id="popup-info" class="mt-2" style="font-size: 0.8em;"></p>
  `;
}

async function confirmFilePsw() {
    popup.initClosePopupEvent();
    popup.fillPopupContent(confirmFilePswContent());
    popup.setPopupSize(300, 300);
    popup.openPopup();
    const popupContent = document.getElementById('popup-content');
    const confirmFilePswForm = popupContent.querySelector('#confirm-file-psw-form');
    const confirmFilePswInput = popupContent.querySelector('#confirm-file-psw-input');

    return new Promise((resolve, reject) => {
        confirmFilePswForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const givenPsw = confirmFilePswInput.value;
            resolve(givenPsw);
            popup.closePopup();
        });
    });
}


document.addEventListener('DOMContentLoaded', function() {
    const importAccountButton = document.getElementById('import-account');
    importAccountButton.addEventListener('click', async function(){
        const importAccountFile = document.getElementById('import-account-file');
        const keepCurrPsw = document.getElementById('import-keep-psw');
        if(importAccountFile.files.length === 0) {
            showError(new error.Error('Please select an account file to import.', true));
            return;
        }
        try {
            const file = importAccountFile.files[0];
            const filePassword = await confirmFilePsw();
            await import_account(file,filePassword, keepCurrPsw.checked);
            fillGeneratorsList();

            showInfo('Account imported with success !');
        }
        catch(e) {
            showError(e);
        }
    });

    const exportDataButton = document.getElementById('export-account');
    exportDataButton.addEventListener('click', async function(){
        try{
            const password = await askForPasswordConfirm(); 
            const fileName = document.getElementById('export-file-name').value;
            await export_account(password, fileName);
        }
        catch(e) {
            showError(new error.Error('Unexpected error while exporting your account.', true));
        }
    });
});