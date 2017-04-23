var fireLighting = false;

function lightFire(){
  //alert("lighting fire");
  if(fireLighting == false){
    activateButton(20, "lightFireProgress", "Light Fire");
  }
}

function activateButton(interval, buttonID, text) {
  var elem = document.getElementById(buttonID);   
  var width = 10;
  var id = setInterval(frame, interval);
  elem.style.width = width;
  fireLighting = true;
  function frame() {
    if (width >= 100) {
      clearInterval(id);
      fireLighting = false;
    } else {
      width++; 
      elem.style.width = width + '%'; 
      elem.innerHTML = text;
    }
  }
}

