import * as tools from '../tools.js';

document.addEventListener("DOMContentLoaded", function() {
    document.addEventListener('click', function(event){
        const id = event.explicitOriginalTarget.id;
        if(id !== null){
            if(id === 'log-out'){
                return;
            }
        }
        tools.storeLastLogin();
    });
  });