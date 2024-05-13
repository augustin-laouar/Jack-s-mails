import * as tools from '../tools.js';
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function onPeriod(ms){
  var counter = 0;
  while(true) {
    if(tools.isFirstLogin()){
      window.location.href = '../html/firstConnection.html';
    }
    else{
      if(!tools.isLogged()){
        window.location.href = '../html/login.html';
        tools.logout();
      }
    }
   if(document.getElementById('info').innerHTML !== '')
      counter ++;
  
    if(counter == 5){ 
      document.getElementById('info').innerHTML = '';
      counter = 0;
    }
    await wait(ms);
  }

}

async function checkLogin() {
  if (!tools.isLogged()) {
    const firstCon = await tools.isFirstLogin();
    console.log(firstCon);
    if (firstCon) {
      window.location.href = '../html/firstConnection.html';
    } else {
      if (!tools.isLogged()) {
        window.location.href = '../html/login.html';
        tools.logout();
      }
    }
  }
}

checkLogin();
document.addEventListener("DOMContentLoaded", function() {
  onPeriod(1000);
});