import * as tools from './tools.js';
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function onPeriod(ms){
  var counter = 0;
  while(true) {
    if(!tools.isLogged()){
      window.location.href = '../html/login.html';
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

//log verification before loading the page
if(!tools.isLogged()){
  window.location.href = '../html/login.html';
}


document.addEventListener("DOMContentLoaded", function() {
  onPeriod(1000);
});