$(document).ready(function(){
  $.get("maps/map1.txt", function(data){
  var oneLineMap = data;
 // alert("length: " + oneLineMap.length);
  //alert(oneLineMap);
  map = new Array();
  var subArray = new Array();
  for(var i = 0; i< oneLineMap.length; i++){
    if(oneLineMap[i] == '\n'){
      map.push(subArray);
      subArray = new Array();
  //    console.log(i+" newLine");
    }else{
      subArray.push(oneLineMap[i]);
    }
    //console.log(oneLineMap[i]);
  }
  console.log("map loaded");
  initMap();
  printMap();
});
 // initMap();
  //printMap();
  $('#healthInventory').text("Health  : " + health);
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
var siteMap; //tells us which coordinates of the map are visible
var currentPos = [0, 0];
var fireState = 0;
var movesSinceLastFireStateChange = 0;
var fireLighting = false;

//inventory
var health = 100000;
var wood = 10000;
var water = 10000;
var sand = 10000;
var glass = 10000;
var rock = 10000;

//items
var rockHammer = 0;

//skills
var telescopeLevel = 50;
var siteDistance = (telescopeLevel*2)+1;

function initMap(){
  //init siteMap to be the size of map, with every value set to 0 (not visible)
  siteMap = new Array();
  var subArray = new Array();
  for(var i = 0; i < map.length; i++){
    subArray = new Array();
    for(var j = 0; j< map[i].length; j++){
      subArray.push(0);
    }
    siteMap.push(subArray);
  } 


  printFireState(fireState);
}

function printFireState(state){
  var message;
  switch(state){
    case 0:
      message = "The Fire is Out!";
      break;
    case 1:
      message = "The Fire is Barely Burning.";
      break;
    case 2:
      message = "The Fire is Burning.";
      break;
    case 3:
      message = "The Fire is Roasting!";
      break;
    case 4:
      message = "The Fire is Fully Stoked!";
      break;
  }
  addMessage(message);
}

function getItem(){
  var x = currentPos[0];
  var y = currentPos[1];
  if(map[x][y] == "W"){
    map[x][y] = "0";//replace with nothing
    wood++; //add 1 wood to inventory
    $("#woodInventory").text("Wood    : " + wood);
    addMessage("Got 1 Wood");
    printMap();//reprint the map
  }else if(map[x][y] == "A"){
    map[x][y] = "0";
    water=water+10;
    $("#waterInventory").text("Water   : " + water);
    addMessage("Got 10 Water");
    printMap();
  }else if(map[x][y] == "S"){//got sand
    map[x][y] = "0";
    sand++;
    $("#sandInventory").text("Sand     : " + sand);
    addMessage("Got 1 Sand");
    printMap();
  }else if(map[x][y] == 'R'){//got rock
    map[x][y] = "0";
    rock++;
    $("#rockInventory").text("Rock    : " + rock);
    addMessage("Got 1 Rock");
    printMap();
  }else if(map[x][y] == 's'){//trying to get stone walk way
    addMessage("Can't get Walkway!");
  }else if(map[x][y] == "0"){
    addMessage("No Item to get");
  }

  //update Buttons when inventory is adequate

  //makeGlassButton should only show if we have some sand
  if(sand > 0){
    $('#makeGlassButton').show();
  }

  //placeStoneWalkButton should only show if we have some rocks and rockHammer has been crafted
  if(rock > 0 && rockHammer == 1){
    $('#placeStoneWalkButton').show();
  }

  //if we have rocks and wood and no rockhammer
  if(rock > 0 && wood > 0 && rockHammer != 1){
    $('#createRockHammerButton').show();
  }

  //show that rock hammer has been crafted in inventory if rockHammer = 1
  if(rockHammer == 1){
    $('#rockHammerInventory').text("Rock Hammer : Crafted");
  }

}

function movePlayer(dir){
  unPrintPlayer();
  var success = false;
  if(dir == "up"){
    if(currentPos[0] == 0){
      addMessage("Can't go up now");
    }else{
      currentPos[0]--;
      success = true;
    }
  }else if(dir == "left"){
    if(currentPos[1] == 0){
      addMessage("Can't go left now");
    }else{
      currentPos[1]--;
      success = true;
    }
  }else if(dir == "right"){
    if(currentPos[1] >= map.length-1){
      addMessage("Can't go right now");
    }else{
      currentPos[1]++;
      success = true;
    }
  }else if(dir == "down"){
    if(currentPos[0] >= map[0].length-1){
      addMessage("Can't go down now");
    }else{
      currentPos[0]++;
      success = true;
    }
  }
  
  //printPlayer(); 
  //printMap instead of printPlayer as printPlayer left weird lines, when squares are really small
  printMap();

    
 
  //player succeeds in move
  if(success == true){
    //if we are moving onto a stoneWalkWay 's' we won't decrease water or increase movesSinceLastFireStateChange
    var x = currentPos[0];
    var y = currentPos[1];
    if(map[x][y] != 's'){  
      //increase movesSinceLastFireStateChange
      movesSinceLastFireStateChange++;
      //check water, if exists remove 1
      if(water > 0){
        water--;
        $('#waterInventory').text("Water    : " + water);
      }else{//there is no water left, remove 1 health from player 
        //health--;
        //$('#healthInventory').text("Health    : " + health);
        injurePlayer();
        addMessage("You are thirsty.");
      }
    }else{//we are moving onto a stoneWalkway 's'
      //don't change movesSinceLastFireChange
      //don't change Water
      //we don't actually need to do anything in this else
    }

    //if the fire is out, take 1 health every time the player moves
    if(fireState == 0){
      //health--;
      //$('#healthInventory').text("Health    : " + health);
      injurePlayer();
      addMessage("You're Freezing!");
    }

    //decrease fire state if movesSinceLastFireStateChange > 10;
    if(movesSinceLastFireStateChange > 20){
      if(fireState > 0){
        fireState--;
        movesSinceLastFireStateChange = 0;
        printFireState(fireState);
      }
    }

    if(health <= 0){
      health = 0;
      $('#healthInventory').text("Health    : " + health);
      killPlayer();
    }
  }
}

/* Removes 1 health from player
   Flashes red on the screen to let
   player know they are being injured
*/
function injurePlayer(){
  health--
  $('#healthInventory').text("Health    : " + health);
  //flash red on map
  var canvas = document.getElementById('mapCanvas');
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'red';
  ctx.fillRect(0,0, canvas.width, canvas.height);
  setTimeout(function(){
    printMap();
  }, 10);
}

function killPlayer(){
  addMessage("You Died!!!");
  alert("You Died!!!");
  location.reload();
}

function unPrintPlayer(){
  var canvas = document.getElementById('mapCanvas');
  var ctx = canvas.getContext('2d');
  var height = (canvas.height)/map[0].length;
  var width = (canvas.width)/map.length;
  var color = getColorFromMapPosition(currentPos[1], currentPos[0]);
 
  ctx.fillStyle = color;
  ctx.fillRect(currentPos[1]*width, currentPos[0]*height, width, height);
}

//only prints the player without reprinting map
function printPlayer(){
  var canvas = document.getElementById('mapCanvas');
  var ctx = canvas.getContext('2d');
  var height = canvas.height/map[0].length;
  var width = canvas.width/map.length;
  ctx.fillStyle = 'red';
  ctx.fillRect(currentPos[1]*width, currentPos[0]*height, width, height);

 

}

function getColorFromMapPosition(x, y){
  if(map[x][y] == '0'){
    return 'white';
  }else if(map[x][y] == 'W'){
    return '#663300'
  }else if(map[x][y] == 'A'){
    return '#79BDEA';
  }else if(map[x][y] == 'S'){
    return '#c2b280';
  }else if(map[x][y] == 'R'){
    return '#aaa7a4';
  }else if(map[x][y] == 's'){
    return '#565656';
  }
}

//Returns the distance between two points
function getDistance(x1, y1, x2, y2){
  var returnVal = ((x2-x1)*(x2-x1))+((y2-y1)*(y2-y1));
  returnVal = Math.sqrt(returnVal);
  return returnVal;
}

function printMap(){
  var canvas = document.getElementById('mapCanvas');
  var ctx = canvas.getContext('2d');
  var height = canvas.height/map[0].length;
  var width = canvas.width/map.length;
  var currentX = currentPos[1];
  var currentY = currentPos[0];
  //first we blank the map
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for(var i = 0; i < map.length; i++){
    for(var j = 0; j < map[i].length; j++){
      var mapPosX = j;
      var mapPosY = i;
      if((getDistance(mapPosX, mapPosY, currentX, currentY) <= siteDistance) || siteMap[j][i] == 1){
        ctx.fillStyle = getColorFromMapPosition(i, j);
        ctx.fillRect(j*width, i*height, width+1, height+1);
        //make this location visible in siteMap
        siteMap[j][i] = 1;
      }else{
        ctx.fillStyle = 'black';
        ctx.fillRect(j*width, i*height, width+1, height+1);
      }
    }
  }

  //draw player
  printPlayer();
}

function addMessage(msg){
  //if there are more than 20 messages already, remove the last one
  if($('#msgList li').length >= 25){
    $('#msgList li').last().remove();
  }

  $('#msgList').prepend("<li>"+msg+"</li>");
}

/* Places a stone walkway at players current location on map
   IF: Nothing else is at location
   IF: Player has enough rocks in inventory
   movePlayer will not take water, or decrease fireState
   if player is moving from a Stone Walkway
*/ 
function placeStoneWalk(){
  var x = currentPos[0];
  var y = currentPos[1];
  var rocksNeeded = 5;
  if(rockHammer == 1){
    if(rock >= rocksNeeded){
      if(map[x][y] == '0'){
        activateButton(2, "placeStoneWalkProgress", "Place Stone Walkway");
        map[x][y] = 's';
        printMap();
        rock = rock - rocksNeeded;
        $('#rockInventory').text("Rocks : " + rock);
      }else{
        addMessage("Location Isn't Empty!");
      }
    }else{
      addMessage("Need " +rocksNeeded+ " Rocks!");
    }
  }else{
    addMessage("Need a Rock Hammer!");
  }
}

/* Creates a rock hammer and adds it to players inventory
   IF: Player has enough rocks
    &: Player has enough wood
*/
function createRockHammer(){
  var rocksNeeded = 25;
  var woodNeeded = 50;
  
  if(rock >= rocksNeeded){
    if(wood >= woodNeeded){
      if(rockHammer == 0){
         rock = rock - rocksNeeded;
         wood = wood - woodNeeded;
         rockHammer = 1;
         activateButton(2, "createRockHammerProgress", "Create Rock Hammer");
         $('#rockHammerInventory').text("Rock Hammer : Crafted");
         $('#rockInventory').text("Rocks : " + rock);
         $('#woodInventory').text("Wood  : " + wood);
 
         //if we have rocks, and since we just crafted a rock hammer, placeStoneWalkButton becomes visibile
         $('#placeStoneWalkButton').show();
      }else{
        addMessage("You've already crafted a Rock Hammer");
      }
    }else{
      addMessage("Need " +woodNeeded+ " Wood!");
    }
  }else{
    addMessage("Need " +rocksNeeded+ " Rocks!");
  }

}

/* Called when the user clicks Make Glass button
   checks if there is enough sand
   checks if the fire is fully stoked
   if so, add glass to the users inventory
   removes 10 sand
   decreases fire to barely burning.
*/
function makeGlass(){
  var sandNeeded = 10;
  if(sand >= sandNeeded){
    if(fireState == 4){
      glass++;
      sand = sand - sandNeeded;
      fireState = 0;
      addMessage("Made 1 Glass");
      $('#glassInventory').text("Glass    : " + glass);
      $('#sandInventory').text("Sand    : " + sand);
      activateButton(2, "makeGlassProgress", "Make Glass");
    }else{
      addMessage("Fire isn't Hot Enough!");
    }
  }else{
    addMessage("Need " +sandNeeded+ " Sand!");
  }

  //if we have glass, and we have wood, the upgradeTelescope button should show
  if(glass > 0 && wood > 0){
    $('#upgradeTelescopeButton').show();
  }
}

/* Called when user clicks Upgrade Telescope button
   Checks if there is enough wood
   Checks if there is enough glass
   If so: removes (telescopeLevel+1)*2 glass
          removes (telescopeLevel+1)*10 wood
          adds 1 telescopeLevel
          increases siteDistance
*/
function upgradeTelescope(){
  var woodNeeded = ((telescopeLevel+1) * 10);
  var glassNeeded = ((telescopeLevel+1) * 2);
  if(wood >= woodNeeded){
    if(glass >= glassNeeded){
      glass = glass - glassNeeded;
      wood = wood - woodNeeded;
      telescopeLevel++
      siteDistance = (telescopeLevel * 2) + 1;
      $('#telescopeInventory').text("Tele :   " + telescopeLevel);
      $('#glassInventory').text("Glass :   " + glass);
      $('#woodInventory').text("Wood :   " + wood);
      activateButton(2, "upgradeTelescopeProgress", "Upgrade Telescope");
      printMap(); 
    }else{
      addMessage("Need "+ glassNeeded+ " Glass!");
    }
  }else{
    addMessage("Need " +woodNeeded+ " Wood!");
  }
}


/* Called when user clicks StokeFire Button
   Checks if there is wood and updates the fires state.
*/
function lightFire(){
  //alert("lighting fire");
  if(wood >= 1){
    if(fireLighting == false){
      activateButton(2, "lightFireProgress", "Stoke Fire");
      if(fireState == 0)addMessage("Fire Started");//only say fire started when fire is started
      wood--;
      $("#woodInventory").text("Wood   : " + wood);
      if(fireState < 4){
        fireState++;
        movesSinceLastFireStateChange = 0;
        printFireState(fireState);
      }else{
        addMessage("You're wasting wood!");
      }
    }
  }else{
    addMessage("Not Enough Wood");
  }
}

function activateButton(interval, buttonID, text) {
  var elem = document.getElementById(buttonID);   
  var width = 10;
  var id = setInterval(frame, interval);
  elem.innerHTML = "";//get rid of text while going
  elem.style.width = width;
  if(buttonID == 'lightFireProgress')fireLighting = true;
  function frame() {
    if (width >= 100) {
      clearInterval(id);
      elem.innerHTML = text;//bring back text once done
      //if is createRockHammerProgress, we want to hide createRockHammerButton now
      if(buttonID == 'createRockHammerProgress')  $('#createRockHammerButton').hide();
      if(buttonID == 'lightFireProgress')fireLighting = false;
    } else {
      width++; 
      elem.style.width = width + '%'; 
      //elem.innerHTML = text;
    }
  }
}

