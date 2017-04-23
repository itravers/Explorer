var fireLighting = false;

function addMessage(msg){
  //if there are more than 20 messages already, remove the last one
  if($('#msgList li').length >= 25){
    $('#msgList li').first().remove();
  }

  $('#msgList').prepend("<li>"+msg+"</li>");
}

function lightFire(){
  //alert("lighting fire");
  if(fireLighting == false){
    activateButton(2, "lightFireProgress", "Light Fire");
    addMessage("Fire Started");
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

