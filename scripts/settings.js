import * as tools from './tools.js';


async function changePassword(oldPsw, newPsw, newPswConfirm){
    try{
        if(newPsw !== newPswConfirm){
            //error
        }
        if(!tools.validPassword(oldPsw)){
            //error
        }
        await tools.reEncryptAllData(newPsw);
        await tools.storeHashedPassword(newPsw);
    }
    catch(error){
        //error
    }

}



document.addEventListener('DOMContentLoaded', function() {
    const changePswForm = document.getElementById('change-password');
    changePswForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const oldPsw = document.getElementById('old-psw');
        const newPsw = document.getElementById('new-psw');
        const newPswConfirm = document.getElementById('new-psw-confirm');
        changePassword(oldPsw.value, newPsw.value, newPswConfirm.value);
    });
    const changeConnexionDurationForm = document.getElementById('change-connexion-duration');
    changeConnexionDurationForm.addEventListener('submit', function(event){
        event.preventDefault();
        const connexionDurationSelect = document.getElementById('connexion-duration-value');
        tools.storeConnexionDuration(connexionDurationSelect.value);
    });
    const loadDataButton = document.getElementById('load-data');
    loadDataButton.addEventListener('click', function(){
        const loadDataFile = document.getElementById('load-data-file');
        const pswCheckInput = document.getElementById('psw-check');
        //TODO
    });
    const exportDataButton = document.getElementById('export-data');
    newEncryptionKeyButton.addEventListener('click', function(){
        const pswCheckInput = document.getElementById('psw-check');
        //TODO
    });


});