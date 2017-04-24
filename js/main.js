$(document).ready(function(){
  initMap();
  printMap();
});

$(function() {
   $(window).keypress(function(e) {
       var key = e.which;
       //alert("key " + key + " pressed");
       if(key == 119){//up pressed
         movePlayer("up");
       }else if(key == 97){//left pressed
         movePlayer("left");
       }else if(key == 100){//right Pressed
         movePlayer("right");
       }else if(key == 115){//down pressed
         movePlayer("down");
       }else if(key==32){//space pressed, get item
         getItem();
       }
   });
});

var map;

//state
var currentPos = [4, 0];
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

function getItem(){
  var x = currentPos[0];
  var y = currentPos[1];
  if(map[x][y] == "W"){
    map[x][y] = "0";//replace with nothing
    wood++; //add 1 wood to inventory
    addMessage("Got 1 Wood");
    printMap();//reprint the map
  }else if(map[x][y] == "0"){
    addMessage("No Item to get");
  }
}

function movePlayer(dir){
  unPrintPlayer();
  if(dir == "up"){
    if(currentPos[1] == 0){
      addMessage("Can't go up now");
    }else{
      currentPos[1]--;
    }
  }else if(dir == "left"){
    if(currentPos[0] == 0){
      addMessage("Can't go left now");
    }else{
      currentPos[0]--;
    }
  }else if(dir == "right"){
    if(currentPos[0] >= map.length-1){
      addMessage("Can't go right now");
    }else{
      currentPos[0]++;
    }
  }else if(dir == "down"){
    if(currentPos[1] >= map[0].length-1){
      addMessage("Can't go down now");
    }else{
      currentPos[1]++;
    }
  }
  
  printPlayer();
}

function unPrintPlayer(){
  var canvas = document.getElementById('mapCanvas');
  var ctx = canvas.getContext('2d');
  var height = canvas.height/map[0].length;
  var width = canvas.width/map.length;
  var color = getColorFromMapPosition(currentPos[0], currentPos[1]);
  
  ctx.fillStyle = color;
  ctx.fillRect(currentPos[0]*width, currentPos[1]*height, width, height);
}

//only prints the player without reprinting map
function printPlayer(){
  var canvas = document.getElementById('mapCanvas');
  var ctx = canvas.getContext('2d');
  var height = canvas.height/map[0].length;
  var width = canvas.width/map.length;
  ctx.fillStyle = 'blue';
  ctx.fillRect(currentPos[0]*width, currentPos[1]*height, width, height);

}

function getColorFromMapPosition(x, y){
  if(map[x][y] == '0'){
    return 'white';
  }else if(map[x][y] == 'W'){
    return 'brown'
  }
}

function printMap(){
  var canvas = document.getElementById('mapCanvas');
  var ctx = canvas.getContext('2d');
  var height = canvas.height/map[0].length;
  var width = canvas.width/map.length;
  for(var i = 0; i < map.length; i++){
    for(var j = 0; j < map[i].length; j++){
      ctx.fillStyle = getColorFromMapPosition(i, j);
      ctx.fillRect(i*width, j*height, width, height);
    }
  }

  //draw player
  printPlayer();
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

