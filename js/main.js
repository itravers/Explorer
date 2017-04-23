$(document).ready(function(){
  initMap();
  printMap();
});

var map;

//state
var currentPos = [0, 0];
var fireLighting = false;

//inventory
var wood = 0;

function initMap(){
  map = [
['0', '0', '0', '0', '0'],
['0', 'W', '0', '0', '0'],
['0', '0', '0', '0', '0'],
['0', '0', '0', '0', '0'],
['0', '0', 'W', '0', '0']
];

}

function printMap(){
  var canvas = document.getElementById('mapCanvas');
  var ctx = canvas.getContext('2d');
  var height = canvas.height/map[0].length;
  var width = canvas.width/map.length;
  for(var i = 0; i < map.length; i++){
    for(var j = 0; j < map[i].length; j++){
      if(map[i][j] == '0'){
        ctx.fillStyle = 'green';
      }else if(map[i][j] == 'W'){
        ctx.fillStyle = 'brown';
      }
      ctx.fillRect(i*width, j*height, width, height);

    }
  }

  //draw player
  ctx.fillStyle = 'blue';
  ctx.fillRect(currentPos[0]*width, currentPos[1]*height, width, height);
}

function addMessage(msg){
  //if there are more than 20 messages already, remove the last one
  if($('#msgList li').length >= 25){
    $('#msgList li').first().remove();
  }

  $('#msgList').prepend("<li>"+msg+"</li>");
}

function lightFire(){
  //alert("lighting fire");
  if(wood >= 1){
    if(fireLighting == false){
      activateButton(2, "lightFireProgress", "Light Fire");
      addMessage("Fire Started");
      wood--;
    }
  }else{
    addMessage("Not Enough Wood");
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

