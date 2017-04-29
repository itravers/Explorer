/* 2dArray The map that will be loaded from file and displayed to user. */
var map;

/* 2dArray that Cooresponds with the map.
   Each area that has already been seen by player
   will be marked with a 1. When we print map we will
   know that player has already seen these coordinates
   so we will go head and display that part of the map*/
var siteMap;

//variables to help us with printing the map correctly
var mapHeight;
var mapWidth; 
var borderWidth;
var borderHeight;
var mapZeroX;
var mapZeroY;

/* 2d Associative array used to store all the prerequs for each item
   IE: itemPrereqs["rockHammer"]["rock"] = 25;*/
var itemPrereqs;


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

/* Keep track if an action is currently activated
   this is used to make sure the action doesn't activate more
   than once at a time.
*/
var fireLighting = false;
var upgradingTelescope = false;  
var smeltingOre = false;
var creatingRockHammer = false;
var makingGlass = false;
var creatingIronAx = false;
var creatingBucket = false;
var creatingRockIronShovel = false;
var creatingGlassMachine = false;
var creatingPickAx = false;
var creatingSmeltingMachine = false;

/* Keep track of the players inventory. */
var health = 100;  /* The amount of heath the player has left. */
var wood = 10000;      /* The wood the player has left. */
var water = 10000;     /* The water the player has left. */
var sand = 10000;      /* The sand the player has left. */
var glass = 10000;     /* The glass the player has left. */
var rock = 10000;      /* The rocks the player has left. */
var ironOre = 10000;   /* The ironOre the player has left. */
var iron = 10000;      /* The iron the player has left. */

/* Keep track of the permanent items the player has in inventory.
   0: Player does not have item
   1: Player does have item */
var rockHammer = 0;
var ironAx = 0;
var bucket = 0;
var rockIronShovel = 0;
var glassMachine = 0;
var pickAx = 0;
var smeltingMachine = 0;

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


/* Listen for key presses and clicks on the map canvas*/
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

   //listen for canvas clicks
   $("#mapCanvas").click(function(e){
     var canvas = this;//document.getElementById("#mapCanvas");

     console.log("x: " + e.offsetX + " y: " + e.offsetY);
     var x = e.offsetX;
     var y = e.offsetY;
     var success = false;
     //if click up button
     if(x >= borderWidth && x <= (canvas.width-borderWidth) 
        && y >= 0 && y <= borderHeight){
        movePlayer("up");
        success = true; 
     }else if(x >= borderWidth && x<=(canvas.width-borderWidth)
              && y >= borderHeight+mapHeight && y <= canvas.height){
       movePlayer("down");
       success = true;
     }else if(x >= 0 && x <= borderWidth
           && y >= borderHeight && y <= (canvas.height-borderHeight)){
       movePlayer("left");
       success = true;
     }else if(x >= borderWidth+mapWidth && x <= canvas.width
           && y >= borderHeight && y <= canvas.height-borderHeight){
       movePlayer("right");
       success = true;
     } 

     if(success){
       printMapButtons("#347C37");
       setTimeout(function(){
         printMapButtons("#4CAF50")
       }, 100);
     }
   });  
});

/* Reads prereqs for each item from file and loads them into
   itemPrereqs, a 2d associative array
*/
function initItemPrereqs(){
  //read from maps/ItemPrereqs.txt
  $.ajax({
    url  : "maps/ItemPrereqs.txt",
    type : "get",
    async: false,
    success : function(data){
      itemPrereqs = {};;
      var dataLine = '';
      var dataAllLines = new Array();
      for(var i = 0; i < data.length; i++){
        //Break the data up into individual lines
        if(data[i] == '\n'){//push line read to dataAllLine, and empty dataLine
          dataAllLines.push(dataLine);
          dataLine = '';
        }else{//
          dataLine += data[i];
        }
      } 

      //go through each dataAllLines and construct itemPrereqs
      for(var i = 0; i < dataAllLines.length; i++){
        var lineString = dataAllLines[i];
        lineString = lineString.replace(/\s+/g, " ").trim();//remove extra whitespace
        var line = lineString.split(" ");

        var itemName = line[0];
        itemPrereqs[itemName] = {};
        for(var j = 1; j < line.length; j++){
         var req = line[j].split(":");//split the preq up into name [0] and num [1]
         itemPrereqs[itemName][req[0]] = req[1];
        } 
      }
     // console.log("itemPrereqs['ironAx']['wood'] = " + itemPrereqs['ironAx']['wood']);

    },
    error : function(){
      console.log("Could not read from ItemPrereqs.txt");
    }
  });
}

function itemPrereqSatisfied(item){
  var satisfied = true;
  addMessage("<br>"); //print a blank line to group prereq messages together
 
  //check if satisfies upgradeTelescope
    if(item == 'upgradeTelescope'){
      var woodNeeded = (telescopeLevel + 1) * itemPrereqs['upgradeTelescope']['wood'];
      var glassNeeded = (telescopeLevel +1) * itemPrereqs['upgradeTelescope']['glass'];
      if(glass < glassNeeded){
      satisfied = false;
      addMessage("Need " + (glassNeeded-glass) + " more Glass!");
      }
      if(wood < woodNeeded){
      satisfied = false;
      addMessage("Need " + (woodNeeded-wood) + " more Wood!"); 
      }
      return satisfied;//only return for upgradeTelescope
    }

  for(key in itemPrereqs[item]){
    if(key == 'rock'){
      if(rock < itemPrereqs[item][key]){
        addMessage("Need " + (itemPrereqs[item][key] - rock) + " more Rock!");
        satisfied = false;
      }

    }else if(key == 'wood'){
      if(wood < itemPrereqs[item][key]){ 
        addMessage("Need " + (itemPrereqs[item][key] - wood) + " more Wood!");
        satisfied = false;
      }

    }else if(key == 'water'){
      if(water < itemPrereqs[item][key]){ 
        addMessage("Need " + (itemPrereqs[item][key] - water) + " more Water!");
        satisfied = false;
      }

    }else if(key == 'ironOre'){ 
      if(ironOre < itemPrereqs[item][key]){ 
        addMessage("Need " + (itemPrereqs[item][key] - ironOre) + " more Iron Ore!");
        satisfied = false;
      }

    }else if(key == 'sand'){
      if(sand < itemPrereqs[item][key]){
        addMessage("Need " + (itemPrereqs[item][key] - sand) + " more Sand!");
        satisfied = false;
      }

    }else if(key == 'glass'){
      if(glass < itemPrereqs[item][key]){
        addMessage("Need " + (itemPrereqs[item][key] - glass) + " more Glass!");
        satisfied = false;
      }

    }else if(key == 'iron'){
      if(iron < itemPrereqs[item][key]){
        addMessage("Need " + (itemPrereqs[item][key] - iron) + " more Iron!");
        satisfied = false;
      }

    }else if(key == 'fireState'){
      if(fireState < itemPrereqs[item][key]){
        addMessage("Fire Isn't Hot Enough!");
        satisfied = false;
      }
    }else if(key == 'ironAx'){
      if(ironAx != itemPrereqs[item][key]){
        if(ironAx == 0){
          addMessage("Need Iron Ax!");
        }else{
          addMessage("Already have an Iron Ax!");
        }
        satisfied = false;
      }
    }else if(key == 'bucket'){
      if(bucket != itemPrereqs[item][key]){
        if(bucket == 0){
          addMessage("Need Bucket!");
        }else{
          addMessage("Already have a Bucket!");
        }
        satisfied = false;
      }
    }else if(key == 'rockHammer'){
      if(rockHammer != itemPrereqs[item][key]){
        if(rockHammer == 0){
          addMessage("Need Rock Hammer!");
        }else{
          addMessage("Already have Rock Hammer!");
        }
        satisfied = false;
      }
    }else if(key == 'rockIronShovel'){
      if(rockIronShovel != itemPrereqs[item][key]){
        if(rockIronShovel == 0){
          addMessage("Need Rock Iron Shovel!");
        }else{
          addMessage("Already have Rock Iron Shovel!");
        }
        satisfied = false;
      }
    }else if(key == 'glassMachine'){
      if(glassMachine != itemPrereqs[item][key]){
        if(glassMachine == 0){
          addMessage("Need Glass Machine!");
        }else{
          addMessage("Already have Glass Machine!");
        }
        satisfied = false;
      }
    }else if(key == 'pickAx'){
      if(pickAx != itemPrereqs[item][key]){
        if(pickAx == 0){
          addMessage("Need Pick Ax!");
        }else{
          addMessage("Already Have Pick Ax");
        }
        satisfied = false;
      }
    }else if(key == 'smeltingMachine'){
      if(smeltingMachine != itemPrereqs[item][key]){
        if(smeltingMachine == 0){
          addMessage("Need Smelting Machine!");
        }else{
          addMessage("Already Have Smelting Machine");
        }
        satisfied = false;
      }
    }
  }
  return satisfied; 
}

/* Loads the map from file
    Initializes the siteMap to all 0's
    Prints Initial player health under inventory list
*/
function initMap(){
  initMapVariables(); 
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

  initItemPrereqs();
}


/* Prints state of the fire (string) to player messages
   based on fireState (int) */
function printFireState(state){
  addMessage('<br>');//add blank line under firestate
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

    //If we have a rockIronShovel get 10 sand, else get 1
    if(rockIronShovel == 1){
      sand = sand + 10;
      addMessage("Got 10 Sand");
    }else{
      sand++;
      addMessage("Got 1 Sand");
    }

    $("#sandInventory").text("Sand     : " + sand); //Update sand in inventory list
    printMap(); //Reprint the Map

  }else if(map[x][y] == 'R'){ //There is rock at the players current location
    map[x][y] = "0"; //Replace rock with nothing.
 
    if(pickAx == 1){
      rock = rock + 10;;
      addMessage("Got 10 Rock");
    }else{
      rock = rock + 1;
      addMessage("Got 1 Rock");
    }

    $("#rockInventory").text("Rock    : " + rock); //Update rock in inventory list
    printMap(); //Reprint the Map

  }else if(map[x][y] == 'I'){ //There is iron at players current location

    if(rockHammer == 1){ //must have rock hammer to get Iron Ore
      map[x][y] = "0"; //Replace Iron Ore with nothing

      if(pickAx == 1){//pickAx gets 10 iron ore at once
        ironOre = ironOre + 10;
        addMessage("Got 10 Iron Ore");
      }else{
        ironOre++;
        addMessage("Got 1 Iron Ore");
      }

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

  activateButton(1, "getItemProgress", "Get Item");
  //update Buttons when inventory is adequate to show that button
  updateButtons();
}

/* Updates the inventory displays */
function updateInventory(){
  $("#healthInventory").text("Health : " + health);
  $("#telescopeInventory").text("Tele Lvl : " + telescopeLevel);
  
  if(rockHammer == 1)  $("#rockHammerInventory").text("Rock Hammer : Crafted");
  if(ironAx == 1) $("#ironAxInventory").text("Iron Ax : Crafted");
  if(bucket == 1) $("#bucketInventory").text("Bucket : Crafted");
  if(rockIronShovel == 1) $("#rockIronShovelInventory").text("RI Shovel : Crafted");
  if(glassMachine == 1) $("#glassMachineInventory").text("Glass Machine : Crafted");
  if(pickAx == 1) $("#pickAxInventory").text("Pick Ax : Crafted");
  if(smeltingMachine == 1) $("#smeltingMachineInventory").text("Smelting M. : Crafted");
  if(wood > 0) $("#woodInventory").text("Wood : " + wood);
  if(water > 0) $("#waterInventory").text("Water : " + water);
  if(sand > 0) $("#sandInventory").text("Sand : " + sand);
  if(glass > 0) $("#glassInventory").text("Glass : " + glass);
  if(rock > 0) $("#rockInventory").text("Rock : " + rock);
  if(ironOre > 0) $("#ironOreInventory").text("Iron Ore : " + ironOre);
  if(iron > 0) $("#ironInventory").text("Iron : " + iron);
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
  }else{ 
    $('#createRockHammerButton').hide();
  }

  //show that rock hammer has been crafted in inventory if rockHammer = 1
  if(rockHammer == 1){
    $('#rockHammerInventory').text("Rock Hammer : Crafted");
  }

  //If we have some iron ore, show the smelt ore button
  if(ironOre > 0){
    $('#smeltOreButton').show();
  }

  //Show createRockIronShovelButton if we have iron, rocks, wood, glass, and no rockIronShovel yet
  if(iron > 0 && rock > 0 && wood > 0 && glass > 0 && rockIronShovel == 0){
    $('#createRockIronShovelButton').show();
  }else{
    $('#createRockIronShovelButton').hide();
  }

  //Show createGlassMachineButton if we have ironAx, bucket, rockIronShovel, glass, wood, iron, water, sand rock, and no glassMachine
  if(ironAx == 1 && bucket == 1 && rockIronShovel == 1 && glass > 0 
     && wood > 0 && iron > 0 && water > 0 && sand > 0 && rock > 0 && glassMachine == 0){
    $('#createGlassMachineButton').show();
  }else{ 
    $('#createGlassMachineButton').hide();
  }

  //show createPickAxButton if we have sand, water, wood, rock, glass, iron and no pickAx
  if(sand > 0 && water > 0 && wood > 0 && rock > 0 && glass > 0 && iron > 0 && pickAx == 0 && glassMachine == 1){
    $('#createPickAxButton').show();
  }else{
    $('#createPickAxButton').hide();
  }
  
  //show createSmeltingMachineButton if we have sand, water, wood, rock, glass, iron and no smeltingMachine
  if(sand > 0 && water > 0 && wood > 0 && rock > 0 && glass > 0 && iron > 0 && smeltingMachine == 0){
    $('#createSmeltingMachineButton').show();
  }else{
    $('#createSmeltingMachineButton').hide();
  }
  
  //if we have glass, and we have wood, the upgradeTelescope button should show
  if(glass > 0 && wood > 0){
    $('#upgradeTelescopeButton').show();
  }
    
  if(iron > 0 && rockHammer == 1 && wood > 0 && ironAx == 0){
    $('#createIronAxButton').show();
  }else{
    $('#createIronAxButton').hide();
  }
    
  //show createBucketButton if we have iron, a rockHammer, an ironAx, and water
  if(iron > 0 && rockHammer == 1 && ironAx == 1 && water > 0 && bucket == 0){
    $('#createBucketButton').show();
  }else{
    $('#createBucketButton').hide();
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
      addMessage("<br>");//put a space under message
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
  ctx.fillRect(mapZeroX,mapZeroY, mapHeight, mapWidth);
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
  var height = (mapHeight)/map[0].length;
  var width = (mapWidth)/map.length;
  var color = getColorFromMapPosition(currentPos[1], currentPos[0]);
 
  ctx.fillStyle = color;
  ctx.fillRect((mapZeroX) + (currentPos[1]*width), (mapZeroY) + (currentPos[0]*height), width, height);
}


/* Prints the player piece on the map. */
function printPlayer(){
  var canvas = document.getElementById('mapCanvas');
  var ctx = canvas.getContext('2d');
  var height = mapHeight/map[0].length;
  var width = mapWidth/map.length;
  ctx.fillStyle = 'red';
  ctx.fillRect((mapZeroX)+(currentPos[1]*width), (mapZeroY) + (currentPos[0]*height), width, height);
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

/*Initialized the variables that seperate the canvas from the
  map that is printed on the canvas. Gives border room for the
  directional buttons. */
function initMapVariables(){
  var canvas = document.getElementById('mapCanvas');  
  borderWidth = 30;
  borderHeight = 30;
  mapZeroX = borderWidth;
  mapZeroY = borderHeight;
  mapWidth = canvas.width-(borderWidth*2);
  mapHeight = canvas.height-(borderHeight*2);
}

/* Prints the directional buttons on the canvas with the given color*/
function printMapButtons(color){
  var canvas = document.getElementById('mapCanvas');
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  
  //print top button
  ctx.fillRect(mapZeroX, 0, mapWidth+1, borderHeight);
  ctx.beginPath();
  ctx.moveTo(canvas.width/2, borderHeight/5); 
  ctx.lineTo((canvas.width/2)+10, (borderHeight/5)*4);
  ctx.lineTo((canvas.width/2)-10, (borderHeight/5)*4);
  ctx.closePath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#000000";
  ctx.stroke();

  //print bottom button
  ctx.fillRect(mapZeroX, (borderHeight+mapHeight), mapWidth+1, borderHeight);
  ctx.beginPath();
  ctx.moveTo(canvas.width/2,(borderHeight+mapHeight)+(borderHeight/5)*4); 
  ctx.lineTo((canvas.width/2)+10, (borderHeight+mapHeight)+(borderHeight/5));
  ctx.lineTo((canvas.width/2)-10, (borderHeight+mapHeight)+(borderHeight/5));
  ctx.closePath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#000000";
  ctx.stroke();

  //print left button
  ctx.fillRect(0, borderHeight, borderWidth, mapHeight);
  ctx.beginPath();
  ctx.moveTo(borderWidth/5, canvas.height/2); 
  ctx.lineTo((borderWidth/5)*4, (canvas.height/2)+10);
  ctx.lineTo((borderWidth/5)*4, (canvas.height/2)-10);
  ctx.closePath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#000000";
  ctx.stroke();
  
  //print left button
  ctx.fillRect(borderWidth+mapWidth, borderHeight, borderWidth, mapHeight+1);
  ctx.beginPath();
  ctx.moveTo((canvas.width)- borderWidth/5, canvas.height/2); 
  ctx.lineTo((canvas.width)-(borderWidth/5)*4, (canvas.height/2)+10);
  ctx.lineTo((canvas.width)-(borderWidth/5)*4, (canvas.height/2)-10);
  ctx.closePath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#000000";
  ctx.stroke();
}

/* Prints the map as an HTML5 canvas */
function printMap(){
  printMapButtons("#4CAF50");
  var canvas = document.getElementById('mapCanvas');
  var ctx = canvas.getContext('2d');

  //draw outline around entire canvas
  //ctx.strokeRect(0,0,canvas.width,canvas.height);

  var height = mapHeight/map[0].length;
  var width = mapWidth/map.length;
  var currentX = currentPos[1];
  var currentY = currentPos[0];

  //first we blank the map
  ctx.fillStyle = 'white';
  ctx.fillRect(mapZeroX, mapZeroY, mapWidth, mapHeight);

  //Loop through the map and print a specific color at each coordinate
  for(var i = 0; i < map.length; i++){
    for(var j = 0; j < map[i].length; j++){
      var mapPosX = j;
      var mapPosY = i;
      
      /* Check how far away from player this coordinate is, only print it if it is within siteDistance
         or if player has already seen it before. Mark everything we print as seen. */
      if((getDistance(mapPosX, mapPosY, currentX, currentY) <= siteDistance) || siteMap[j][i] == 1){
        ctx.fillStyle = getColorFromMapPosition(i, j);
        ctx.fillRect(mapZeroX+(j*width), mapZeroY+(i*height), width+1, height+1);
        //make this location visible in siteMap
        siteMap[j][i] = 1;
      }else{ //Coordinate is too far away from player, and we have not seen it before, print black
        ctx.fillStyle = 'black';
        ctx.fillRect(mapZeroX+(j*width), mapZeroY+(i*height), width+1, height+1);
      }
    }
  }
  printPlayer(); //Draw player piece after rest of map has been drawn
}


/* Add a message to the top of players message list
   If list is too long, remove oldest message from list. */
function addMessage(msg){
  //if there are more than x messages already, remove the last one
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
  if(itemPrereqSatisfied('stoneWalk')){

    if(map[x][y] == '0'){
    activateButton(itemPrereqs['stoneWalk']['time'], "placeStoneWalkProgress", "Place Stone Walkway");
    map[x][y] = 's';
    printMap();
    rock = rock - rocksNeeded;
    $('#rockInventory').text("Rocks : " + rock);
    }else{
    addMessage("Location Isn't Empty!");
    }
  }
}


/* Creates an item cooresponding to the given name
   updates inventories, and updates player messages.
*/
function createItem(item){
  //first update inventories
  for(key in itemPrereqs[item]){ //loop through the prereqs of item
    if(key == 'rock'){
      rock = rock - itemPrereqs[item][key];
      $('#rockInventory').text("Rock : " + rock);
      addMessage("Consumed " + itemPrereqs[item][key] + " Rocks!");
    }else if(key == 'wood'){
      wood = wood - itemPrereqs[item][key];
      $('#woodInventory').text("Wood : " + wood);
      addMessage("Consumed " + itemPrereqs[item][key] + " Wood!");
    }else if(key == 'water'){ 
      water = water - itemPrereqs[item][key];
      $('#waterInventory').text("Water : " + water);
      addMessage("Consumed " + itemPrereqs[item][key] + " Water!");
    }else if(key == 'ironOre'){
      ironOre = ironOre - itemPrereqs[item][key];
      $('#ironOreInventory').text("Iron Ore : " + ironOre);
      addMessage("Consumed " + itemPrereqs[item][key] + " Iron Ore!");
    }else if(key == 'sand'){
      sand = sand - itemPrereqs[item][key];
      $('#sandInventory').text("Sand : " + sand);
      addMessage("Consumed " + itemPrereqs[item][key] + " Sand!");
    }else if(key == 'glass'){
      glass = glass - itemPrereqs[item][key];
      $('#glassInventory').text("Glass : " + glass);
      addMessage("Consumed " + itemPrereqs[item][key] + " Glass!");
    }else if(key == 'iron'){
      iron = iron - itemPrereqs[item][key];
      $('#ironInventory').text("Iron : " + iron);
      addMessage("Consumed " + itemPrereqs[item][key] + " Iron!");
    }
  }

  //Create the item itself
  if(item == 'glass'){ //Trying to create glass
    var numMade = 0;
    if(glassMachine == 1){
      glass = glass + 5;
      numMade = 5;
    }else{
      glass++
      numMade = 1;
    }
    addMessage("Made " + numMade + " Glass!");
    $('#glassInventory').text('Glass : ' + glass);
  }else if(item == 'iron'){
    if(smeltingMachine == 1){//smelting machine makes more iron
      iron = iron + 10;
      addMessage("Smelted 10 Iron");
    }else{
      iron++;
      addMessage("Smelted 1 Iron");
    }
    fireState = 0;
    printFireState(fireState);
    $('#ironInventory').text("Iron : " + iron);
  }else if(item == 'rockHammer'){
    rockHammer = 1;
    $('#rockHammerInventory').text("Rock Hammer : Crafted");
    addMessage("Crafted Rock Hammer");
  }else if(item == 'ironAx'){
    ironAx = 1;
    $('#ironAxInventory').text("Iron Ax : Crafted");
    addMessage("Crafted Iron Ax!");
  }else if(item == 'bucket'){
    bucket = 1;
    $('#bucketInventory').text("Bucket : Crafted");
    addMessage("Crafted Bucket!");
  }else if(item == 'rockIronShovel'){
    rockIronShovel = 1;
    $('#rockIronShovelInventory').text("Rock Iron Shovel : Crafted");
    addMessage("Crafted Rock Iron Shovel!");
  }else if(item == 'glassMachine'){
    glassMachine = 1;
    $('#glassMachineInventory').text("Glass Machine : Crafted");
    addMessage("Crafted Glass Machine");
  }else if(item == 'pickAx'){
    pickAx = 1;
    $('#pickAxInventory').text('Pick Ax : Crafted');
    addMessage("Crafted Pick Ax");
  }else if(item == 'smeltingMachine'){
    smeltingMachine = 1;
    $('#smeltingMachineInventory').text('Smelting Machine : Crafted');
    addMessage("Crafted Smelting Machine");
  }
}


/* Called by user pressing createSmeltingMachineButton
   Create a Smelting Machine and add it to inventory
*/
function createSmeltingMachine(){
  if(itemPrereqSatisfied('smeltingMachine') && creatingSmeltingMachine == false){
    creatingSmeltingMachine = true;
    activateButton(itemPrereqs['smeltingMachine']['time'], "createSmeltingMachineProgress", "Create Smelting Machine");
  }
}


/* Called by user pressing createPickAxButton
   Create a pick ax and add it to inventory
*/
function createPickAx(){
  if(itemPrereqSatisfied('pickAx') && creatingPickAx == false){
    creatingPickAx = true;
    activateButton(itemPrereqs['pickAx']['time'], "createPickAxProgress", "Create Pick Ax");
  }
}


/* called by user pressing createGlassMachineButton
   Create a glass machine and add it to players inventory
*/
function createGlassMachine(){
  if(itemPrereqSatisfied('glassMachine') && creatingGlassMachine == false){
    creatingGlassMachine = true;
    activateButton(itemPrereqs['glassMachine']['time'], "createGlassMachineProgress", "Create Glass Machine");
  }
}


/* Called by user pressing createRockIronShovelButton
   Create a Rock Iron Shovel and add it to players inventory
*/
function createRockIronShovel(){
  if(itemPrereqSatisfied('rockIronShovel') && creatingRockIronShovel == false){
    creatingRockIronShovel = true;
    activateButton(itemPrereqs['rockIronShovel']['time'], "createRockIronShovelProgress", "Create Rock Iron Shovel");
  }
}


/*
   Called by user pressing Create Bucket button
   Create a bucket and adds it to players inventory
*/
function createBucket(){
  if(itemPrereqSatisfied('bucket') && creatingBucket == false){
    creatingBucket = true;
    activateButton(itemPrereqs['bucket']['time'], "createBucketProgress", "Create Bucket");
  } 
}


/* Creates an Iron Ax and adds it to players inventory
*/
function createIronAx(){
  if(itemPrereqSatisfied('ironAx') && creatingIronAx == false){
    creatingIronAx = true;
    activateButton(itemPrereqs['ironAx']['time'], "createIronAxProgress", "Create IronAx");
  }
}


/* Creates a rock hammer and adds it to players inventory
*/
function createRockHammer(){
  if(itemPrereqSatisfied('rockHammer')){
    if(creatingRockHammer == false){
      creatingRockHammer = true;
      activateButton(itemPrereqs['rockHammer']['time'], "createRockHammerProgress", "Create Rock Hammer");
    }
  }
}


/* Called when the user clicks smeltoreButton
*/
function smeltOre(){
  if(itemPrereqSatisfied('iron')){
    if(smeltingOre == false){
      smeltingOre = true; 
      activateButton(itemPrereqs['iron']['time'], "smeltOreProgress", "Smelt Ore"); 
    }
  }
}


/* Called when the user clicks Make Glass button
*/
function makeGlass(){
  if(itemPrereqSatisfied('glass') && makingGlass == false){
    makingGlass = true;
    fireState = 0; 
    activateButton(itemPrereqs['glass']['time'], "makeGlassProgress", "Make Glass");
  }
}


/* Called when user clicks Upgrade Telescope button
*/
function upgradeTelescope(){
  if(itemPrereqSatisfied('upgradeTelescope')){
    if(upgradingTelescope == false){
      upgradingTelescope = true;  
      activateButton(itemPrereqs['upgradeTelescope']['time'], "upgradeTelescopeProgress", "Upgrade Telescope");
    }
      printMap(); 
  }
}


/* Called when user clicks StokeFire Button
*/
function lightFire(){
  if(itemPrereqSatisfied('lightFire')){
    if(fireLighting == false){//we don't want to light fire while it's already lighting 
      fireLighting = true;
      activateButton(itemPrereqs['lightFire']['time'], "lightFireProgress", "Stoke Fire");
    }
  }
}


/* Makes the buttons countdown timer work.
   Certain buttons disappear after they are done activating */
function activateButton(interval, buttonID, text) {
  var elem = document.getElementById(buttonID);   
  var width = 10;
  var id = setInterval(frame, interval);
  elem.innerHTML = "";//get rid of text while going
  elem.style.width = width;
  updateButtons(); //Update all the buttons based on inventory levels
  function frame() {
    if (width >= 100) {
      clearInterval(id);
      elem.innerHTML = text;//bring back text once done
      finishButton(buttonID);
    } else {
      width++; 
      elem.style.width = width + '%'; 
    }
  }
}


/* Called when a button is done being activated
   This is where we should call createItem */
function finishButton(buttonID){
  if(buttonID == 'makeGlassProgress'){
     createItem('glass');
     makingGlass = false;
  }

  if(buttonID == 'lightFireProgress'){
    if(fireState == 0) addMessage("Fire Started"); //only say "Fire Started" when fire is started
    wood = wood - itemPrereqs['lightFire']['wood'];
 
    if(fireState < 4){
      fireState++;
      movesSinceLastFireStateChange = 0;
      printFireState(fireState);
    }else{
      addMessage("You're Wasting Wood!");
    }
    fireLighting = false;
  }

  if(buttonID == "upgradeTelescopeProgress"){
    glass = glass - (telescopeLevel + 1) * itemPrereqs['upgradeTelescope']['glass'];
    wood = wood - (telescopeLevel + 1) * itemPrereqs['upgradeTelescope']['wood'];
    telescopeLevel++;
    siteDistance = (telescopeLevel * 2) + 1;
    addMessage("<br>");
    addMessage("Telescope Upgraded");
    upgradingTelescope = false;  
  } 
 
  if(buttonID == "smeltOreProgress"){
    createItem('iron'); 
    smeltingOre = false;
  }

  if(buttonID == "createRockHammerProgress"){ 
    createItem('rockHammer');
    creatingRockHammer = false;  
  }

  if(buttonID == "createIronAxProgress"){
    createItem('ironAx');
    creatingIronAx = false;
  }

  if(buttonID == "createBucketProgress"){
    createItem('bucket');
    creatingBucket = true;
  }

  if(buttonID == "createRockIronShovelProgress"){
    createItem('rockIronShovel');
    creatingRockIronShovel = false;
  }

  if(buttonID == "createGlassMachineProgress"){
    createItem('glassMachine');
    creatingGlassMachine = false;
  }

  if(buttonID == 'createPickAxProgress'){
    createItem('pickAx');
    creatingPickAx = false;
  }

  if(buttonID == 'createSmeltingMachineProgress'){
    createItem('smeltingMachine');
    creatingSmeltingMachine = false;
  }

  updateInventory();
  updateButtons();
  printMap();
}
