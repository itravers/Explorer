/* 2dArray The map that will be loaded from file and displayed to user. */
var map;

/* 2dArray that Cooresponds with the map.
   Each area that has already been seen by player
   will be marked with a 1. When we print map we will
   know that player has already seen these coordinates
   so we will go head and display that part of the map*/
var siteMap;

/* State Variables - Keeps track of stuff in the game. */

/* Keep Track of the players current position.*/
var currentPos = [0, 0];

/* Keeps track of the fires current state:
   0: The Fire is Out
   1: The fire is barely burning
   2: The fire is burning
   3: The fire is roasting
   4: The fire is fully stoked */
var fireState = 0;

/* Keeps track of the amount of moves the player has made
   since the last time the fire's state has changed
   This only increments if the player is NOT moving
   onto a stone pathway.
   This is used to decrease the state of the fire as the
   player moves around. */
var movesSinceLastFireStateChange = 0;

/* Keeps track if the fire is currently being stroked,
   so we can't press the Stroke Fire button repeatedly at once
*/
var fireLighting = false;

/* Keep track of the players inventory. */
var health = 100;  /* The amount of heath the player has left. */
var wood = 0;      /* The wood the player has left. */
var water = 0;     /* The water the player has left. */
var sand = 0;      /* The sand the player has left. */
var glass = 0;     /* The glass the player has left. */
var rock = 0;      /* The rocks the player has left. */
var ironOre = 0;   /* The ironOre the player has left. */
var iron = 0;      /* The iron the player has left. */

/* Keep track of the permanent items the player has in inventory.
   0: Player does not have item
   1: Player does have item */
var rockHammer = 0;
var ironAx = 0;
var bucket = 0;

/* Keep track of the players skill stats. */
var telescopeLevel = 0;                       /* The Level the player has gotten there telescoping to.*/
var siteDistance = (telescopeLevel*2)+1;      /* The distance away from player they are able to see. */


/* Called when the page is loaded
   1. Create a map
   2. Print that map
*/
$(document).ready(function(){
  initMap();
  printMap();
});


/* Listen for key presses*/
$(function() {
   $(window).keypress(function(e) {
       var key = e.which;
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


/* Loads the map from file
    Initializes the siteMap to all 0's
    Prints Initial player health under inventory list
*/
function initMap(){
  //load map from file, synchronously
  $.ajax({
    url : "maps/map1.txt",
    type : "get",
    async: false,
    success : function(data){
      var oneLineMap = data;
      map = new Array();
      var subArray = new Array();
      for(var i = 0; i< oneLineMap.length; i++){
        if(oneLineMap[i] == '\n'){
          map.push(subArray);
          subArray = new Array();
        }else{
          subArray.push(oneLineMap[i]);
        }
      }
    },
    error : function(){ 
      console.log("Could not load Map.");
    }
  });

  //print initial inventory
  $('#healthInventory').text("Health  : " + health);

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
  printFireState(fireState); //Print the state of the fire to the player messages.
}


/* Prints state of the fire (string) to player messages
   based on fireState (int) */
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
  addMessage(message);//Print to player message.
}


/* Called when player attempts to get an item.
   Examines what is on the map at the players current location
   and decides if player is able to get something from that location
   if he is that item is added to inventory.
   We also update the visibility of several button when player tries
   to get an item */
function getItem(){
  //get the players current position in x,y
  var x = currentPos[0];
  var y = currentPos[1];

  if(map[x][y] == "W"){ //There is wood at players current location
    map[x][y] = "0"; //Replace wood with nothing

    //if we have an iron ax, we get 10 wood at once, else we only get 1 wood at a time
    if(ironAx == 1){
      wood = wood + 10;
      addMessage("Got 10 Wood!");
    }else{
      wood++;
      addMessage("Got 1 Wood!");
    }

    $("#woodInventory").text("Wood    : " + wood); //Update wood in inventory list
    printMap(); //Reprint the Map

  }else if(map[x][y] == "A"){ //There is water at players current location. (A for aqua)
    map[x][y] = "0"; //Replace water with nothing

    if(bucket == 1){ //if we have a bucket, collect 20 water at once, else collect 5
      water=water+20;
      addMessage("Got 20 Water");
    }else{
      water=water+5;
      addMessage("Got 5 Water");
    }

    $("#waterInventory").text("Water   : " + water); //Update water in inventory list
    printMap(); //Reprint the Map

  }else if(map[x][y] == "S"){ //There is sand at the players current location
    map[x][y] = "0"; //Replace Sand with Nothing

    sand++;
    addMessage("Got 1 Sand");

    $("#sandInventory").text("Sand     : " + sand); //Update sand in inventory list
    printMap(); //Reprint the Map

  }else if(map[x][y] == 'R'){ //There is rock at the players current location
    map[x][y] = "0"; //Replace rock with nothing.

    rock++;
    addMessage("Got 1 Rock");

    $("#rockInventory").text("Rock    : " + rock); //Update rock in inventory list
    printMap(); //Reprint the Map

  }else if(map[x][y] == 'I'){ //There is iron at players current location

    if(rockHammer == 1){ //must have rock hammer to get Iron Ore
      map[x][y] = "0"; //Replace Iron Ore with nothing

      ironOre++;
      addMessage("Got 1 Iron Ore");

      $('#ironOreInventory').text("Iron Ore : " + ironOre); //Update Iron Ore in inventory list
      printMap(); //Reprint the Map

    }else{ //Player does not have Rock hammer, and wasn't able to get ironOre
      addMessage("Need Rock Hammer to get Iron Ore");

    }

  }else if(map[x][y] == 's'){ //There is a Stone Walkway at players current location
    addMessage("Can't get Walkway!");

  }else if(map[x][y] == "0"){ //There is nothing at the players current location
    addMessage("No Item to get");

  }

  //update Buttons when inventory is adequate to show that button
  updateButtons();
}


/* Updates visibility of button if there is adequate 
   inventory levels to show those buttons. */
function updateButtons(){
  //makeGlassButton should only show if we have some sand
  if(sand > 0){
    $('#makeGlassButton').show();
  }

  //placeStoneWalkButton should only show if we have some rocks and rockHammer has been crafted
  if(rock > 0 && rockHammer == 1){
    $('#placeStoneWalkButton').show();
  }

  //if we have rocks and wood and no rockhammer show the createRockHammerButton
  if(rock > 0 && wood > 0 && rockHammer != 1){
    $('#createRockHammerButton').show();
  }

  //show that rock hammer has been crafted in inventory if rockHammer = 1
  if(rockHammer == 1){
    $('#rockHammerInventory').text("Rock Hammer : Crafted");
  }

  //If we have some iron ore, show the smelt ore button
  if(ironOre > 0){
    $('#smeltOreButton').show();
  }
}

/* Moves player from current position to new position
   based on dir (string).
   If player tries to move off of map, we don't let him. */
function movePlayer(dir){
  unPrintPlayer(); //Remove Player's Piece from map

  var success = false; //Used to judge the success of our move

  if(dir == "up"){ //Player tries to move up

    if(currentPos[0] == 0){
      addMessage("Can't go up now"); //Player is already at top of map
    }else{
      currentPos[0]--; //Player moves up successfully.
      success = true;
    }

  }else if(dir == "left"){ //Player tries to move left

    if(currentPos[1] == 0){
      addMessage("Can't go left now"); //Player is already completely to the left of map
    }else{
      currentPos[1]--; //Player moves left successfully
      success = true;
    }

  }else if(dir == "right"){ //Player tries to move right

    if(currentPos[1] >= map.length-1){
      addMessage("Can't go right now"); //Player is already completely right of map.
    }else{
      currentPos[1]++; //Player moves right successfully
      success = true;
    }

  }else if(dir == "down"){ //Player tries to move down

    if(currentPos[0] >= map[0].length-1){
      addMessage("Can't go down now"); //Player is already at bottom of map.
    }else{
      currentPos[0]++; //Player moves down successfully.
      success = true;
    }
  }
  
  printMap(); //Reprint the Map after player moved

  /* Player succedded in moving.
     We check if player is moving onto a Stone Walk Way,
     If they ARE NOT: We remove 1 water, and add 1 to movesSinceLastFireStateChange 
     If Player has no water, we remove 1 health
     If fireState is 0, we remove 1 health 
     If movesSinceLastFireStateChange is > 20, we decrease the state of the fire
     If players health is gone, we kill player */
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
        injurePlayer();
        addMessage("You are thirsty.");
      }
    }

    //if the fire is out, take 1 health every time the player moves
    if(fireState == 0){
      injurePlayer();
      addMessage("You're Freezing!");
    }

    //decrease fire state and reset movesSinceLastStateChange
    if(movesSinceLastFireStateChange > 20){
      if(fireState > 0){
        fireState--;
        movesSinceLastFireStateChange = 0;
        printFireState(fireState);
      }
    }
    //Check player health, and kill player if needed
    if(health <= 0){
      health = 0;
      $('#healthInventory').text("Health    : " + health);
      killPlayer();
    }
  }
}


/* Removes 1 health from player
   Flashes red on the screen to let
   player know they are being injured */
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

/** Kill the player, and reset the game. */
function killPlayer(){
  addMessage("You Died!!!");
  alert("You Died, Death is Permenant!");
  location.reload();
}

/* Remove the players piece from the map.
   Finds what should be printed on the map
   and prints that instead. */
function unPrintPlayer(){
  var canvas = document.getElementById('mapCanvas');
  var ctx = canvas.getContext('2d');
  var height = (canvas.height)/map[0].length;
  var width = (canvas.width)/map.length;
  var color = getColorFromMapPosition(currentPos[1], currentPos[0]);
 
  ctx.fillStyle = color;
  ctx.fillRect(currentPos[1]*width, currentPos[0]*height, width, height);
}


/* Prints the player piece on the map. */
function printPlayer(){
  var canvas = document.getElementById('mapCanvas');
  var ctx = canvas.getContext('2d');
  var height = canvas.height/map[0].length;
  var width = canvas.width/map.length;
  ctx.fillStyle = 'red';
  ctx.fillRect(currentPos[1]*width, currentPos[0]*height, width, height);
}


/* Returns a specific HEX COLOR based on what is
   located at a certain position on the map. */
function getColorFromMapPosition(x, y){
  if(map[x][y] == '0'){
    return 'white';
  }else if(map[x][y] == 'W'){//wood
    return '#663300'
  }else if(map[x][y] == 'A'){//water
    return '#79BDEA';
  }else if(map[x][y] == 'S'){//sand
    return '#c2b280';
  }else if(map[x][y] == 'R'){//rock
    return '#aaa7a4';
  }else if(map[x][y] == 's'){//stone Walk way
    return '#565656';
  }else if(map[x][y] == 'I'){//ironOre
    return '#c6c131';
  }
}


/* Returns the distance between two coordinates on the map.
   Uses the pythagorean theorem. */
function getDistance(x1, y1, x2, y2){
  var returnVal = ((x2-x1)*(x2-x1))+((y2-y1)*(y2-y1));
  returnVal = Math.sqrt(returnVal);
  return returnVal;
}

/* Prints the map as an HTML5 canvas */
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
  
  //Loop through the map and print a specific color at each coordinate
  for(var i = 0; i < map.length; i++){
    for(var j = 0; j < map[i].length; j++){
      var mapPosX = j;
      var mapPosY = i;
      
      /* Check how far away from player this coordinate is, only print it if it is within siteDistance
         or if player has already seen it before. Mark everything we print as seen. */
      if((getDistance(mapPosX, mapPosY, currentX, currentY) <= siteDistance) || siteMap[j][i] == 1){
        ctx.fillStyle = getColorFromMapPosition(i, j);
        ctx.fillRect(j*width, i*height, width+1, height+1);

        //make this location visible in siteMap
        siteMap[j][i] = 1;
      }else{ //Coordinate is too far away from player, and we have not seen it before, print black
        ctx.fillStyle = 'black';
        ctx.fillRect(j*width, i*height, width+1, height+1);
      }
    }
  }
  printPlayer(); //Draw player piece after rest of map has been drawn
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

/*
   Called by user pressing Create Bucket button
   Create a bucket and adds it to players inventory
   If: has ironAx
     : has enough iron
     : has rockHammer
     : has enough water
*/
function createBucket(){
  var ironNeeded = 10;
  var waterNeeded = 100;
  if(iron >= ironNeeded){
    if(water >= waterNeeded){
      if(rockHammer == 1){
        if(ironAx == 1){
          //requirements satisfied
          bucket = 1;
          iron = iron - ironNeeded;
          water = water - waterNeeded;
 
          addMessage("Crafted Bucket!");
          $('#bucketInventory').text("Bucket : Crafted");
          $('#ironInventory').text("Iron : " + iron);
          $('#waterInventory').text("Water : " + water);

          activateButton(2, "createBucketProgress", "Create Bucket");
        }else{
          addMessage("Need Iron Ax!");
        }
      }else{
        addMessage("Need Rock Hammer!");
      }
    }else{
      addMessage("Need " + waterNeeded + " Water!");
    }
  }else{
    addMessage("Need " + ironNeeded + " Iron!");
  }
}

/* Creates an Iron Ax and adds it to players inventory
   IF: Player has enough wood
     : Player has enough iron
     : Player has enough water
     : Player has a rock hammer
*/
function createIronAx(){
  var woodNeeded = 50;
  var ironNeeded = 10;
  var waterNeeded = 50;
  
  if(wood >= woodNeeded){
    if(iron >= ironNeeded){
      if(water >= waterNeeded){
        if(rockHammer == 1){
          //Requirements succeeded
          ironAx = 1;
          wood = wood - woodNeeded;
          iron = iron - ironNeeded;
          water = water - waterNeeded;
         
          addMessage("Crafted an Iron Ax!");
          $('#ironInventory').text("Iron : " + iron);
          $('#waterInventory').text("Water : " + water);
          $('#ironAxInventory').text("Iron Ax : Crafted");
        //  $('#ironAxButton').hide(); 

          activateButton(2, "createIronAxProgress", "Create IronAx");
        }else{
          addMessage("Need a Rock Hammer!");
        }
      }else{
        addMessage("Need " + waterNeeded + " Water!");
      }
    }else{
      addMessage("Need " + ironNeeded + " Iron!");
    }
  }else{
    addMessage("Need " + woodNeeded + " Wood!");
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

/* Called when the user clicks smeltoreButton
   Check if there is enough ironOre
   Check if fireState is 4 (fully stoked)
   Check if there is enough water
   if so: remove Items used to smelt and update inventory
        : Add 1 iron and update inventory
*/
function smeltOre(){
  var ironOreNeeded = 10;
  var waterNeeded = 10;
  if(ironOre >= ironOreNeeded){
    if(water >= waterNeeded){
      if(fireState == 4){
        //all requirements satisfied
        water = water - waterNeeded;
        ironOre = ironOre - ironOreNeeded;
        iron++;
        fireState = 0;

        addMessage("Got 1 Iron");
        $('#waterInventory').text("Water  : " + water);
        $('#ironOreInventory').text("Iron Ore : " + ironOre);
        $('#ironInventory').text("Iron : " + iron);
        activateButton(2, "smeltOreProgress", "Smelt Ore");

        //show createIronAxButton if we have iron, a rockHammer and wood, and we havn't already crafted an ironAx
        if(iron > 0 && rockHammer == 1 && wood > 0 && ironAx == 0){
          $('#createIronAxButton').show();
        }

        //show createBucketButton if we have iron, a rockHammer, an ironAx, and water
        if(iron > 0 && rockHammer == 1 && ironAx == 1 && water > 0 && bucket == 0){
          $('#createBucketButton').show();
        }

      }else{
        addMessage("Fire Isn't Hot Enough!");
      }   
    }else{
      addMessage("Need " +waterNeeded+ " Water!");
    }
  }else{
    addMessage("Need " +ironOreNeeded+ " Iron Ore!");
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
      if(buttonID == 'createIronAxProgress')  $('#createIronAxButton').hide();
      if(buttonID == 'createBucketProgress')  $('#createBucketButton').hide();
      if(buttonID == 'lightFireProgress')fireLighting = false;
    } else {
      width++; 
      elem.style.width = width + '%'; 
      //elem.innerHTML = text;
    }
  }
}

