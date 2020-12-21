//Create variables here
var dog, dogImg, happyDog, database;
var bg;
var foodS = 20;
var foodStock = 20;
var feedPet, addFood;
var fedTime, lastFed, foodObj;
var feedFood, buyFood, xy;
var hor=0, min=0, sec=0;
var o_loc = 0;
var hours, name_inp, name_btn, name=" ";
var intro, changeGame, readGame;
var bedroom, washroom, garden;
var gameState=0;
var blank;
var dead=0, dead_img;
var echo = "=";






function preload()
{
  //load images here
  bg = loadImage("images/day.jpg");

  dogImg = loadImage('images/dogImg.png');
  happyDog = loadImage("images/dogImg1.png");

  bedroom = loadImage("images/BedRoom.png");
  washroom = loadImage("images/WashRoom.png");
  garden = loadImage("images/Garden.png");

  lazy_dog = loadImage("images/Lazy.png");

  blank = loadImage("images/blank.png");

  dead_img = loadImage("images/deadDog.png");
}



function setup() {
  createCanvas(1000, 500);

  //refer to the database
  database = firebase.database();

  //read the game state from the database
  readGame = database.ref("gameState");
  readGame.on("value", function(data){
    gameState=data.val();
  })

  //refer to the database for the foodstock
  foodStock = database.ref('Food');
  foodStock.on("value", readStock);
  fedTime = database.ref('Hour');
  fedTime.on("value", read);


  //refer to the database for hours
  hor = database.ref('Hour');
  hor.on("value", readTimeDataBaseHours);

  //refer to the database for the minutes
  min = database.ref('Minute');
  min.on("value", readTimeDataBaseMins);

  //refer to the databse for the seconds
  sec = database.ref('Second');
  sec.on("value", readTimeDataBaseSecs);

  

  //create Food Object
  foodObj = new Food();

  //create Dog Sprite
  dog = createSprite(800, 350, 100, 100);
  dog.addImage(dogImg);
  dog.scale = 0.3;

  //assign a default value to the current hour
  var currentHR = 0;

  //Buttons
  //To take name the dog
  //Greeting
  intro = createElement('h3');

  //input to enter the name of the dog
  name_inp = createInput("Enter the Name of your Dog");
  name_inp.position(width/2+260, 80);

  //button to submit the name of the dog
  name_btn = createButton("Name your Dog Now!");
  name_btn.position(width/2+280, 140);
  name_btn.mousePressed(function(){
    name_inp.hide();
    name_btn.hide();
    name = name_inp.value();
    
    
  })

  //To feed the dog
  feedFood = createButton("Feed");
  feedFood.position(width/2+270, 200);
  feedFood.mousePressed(function(){
    feedDog();
    
  });

  //to add more food
  buyFood = createButton("Add Food");
  buyFood.position(width/2+350, 200);
  buyFood.mousePressed(function(){
    if(foodS<20){
    foodS+=1;
    database.ref("/").update({
      'Food': foodS
    })

  }
    else if(foodS>=20){
      foodS=20;
    }

  })

}

//////////////////////////////////////////////////////////////////////////////////////////

function draw() {
  background(bg);
  currentHR = hour();
  drawSprites();

    if(o_loc===1){
      dog.addImage(happyDog);
      image(foodObj.image, 620, 350, 120, 100);
    }
    if(o_loc===0){
      dog.addImage(dogImg);
      
    }

    if(currentHR-hor>=1){
      o_loc=0;
    }
    else if (currentHR-hor<1){
      o_loc = 1;
    }

    if(hor>=13){
      hours = hor-12;
    }

  //Check if gamestate is not hungry
  if(gameState!=="hungry"){
    //feedFood.hide();
    dog.addImage(lazy_dog);
  }

  //dead for local
  if(dead>=10&&echo==="!="){
    dog.addImage(dead_img);
  }
  //currentHR=lastFed
  if(currentHR===lastFed&&echo==="="){
    dog.addImage(happyDog);
    bg=loadImage("images/day.jpg");
    echo="!="

    
  }
  //garden method
  if(currentHR===lastFed+1){
    foodObj.garden();
    dog.addImage(blank);
    gameState="playing";
    database.ref("/").update({
      'gameState': "playing"
    })
  }

  //washroom method
  if(currentHR>=lastFed+2&&currentHR<=lastFed+4){
    foodObj.washroom();
    dog.addImage(blank);
    gameState="bathing";
    database.ref("/").update({
      'gameState': "bathing"
    })
  }

  //bedroom method
  if(currentHR>=lastFed+5){
    foodObj.bedroom();
    dog.addImage(blank);
    gameState="hungry";
    database.ref("/").update({
      'gameState': "hungry"
    })
  }

  //texts
  push();
  textSize(25);
  strokeWeight(4);
  stroke(255, 120, 0);
  fill(0);
  textAlign(CENTER);
  text("Milk Bottles Left: "+foodS, 150, 45);
    if(hor<=12){
    text("Last Fed: "+ hor +": "+ min+ ": "+ sec + " AM", 820, 50 );
    }
    else if(hor>=13){
    text("Last Fed: "+ hours +": "+ min+ ": "+ sec + " PM", 820, 50 );
    }

    //Show the name
    if(name!==" "){
      push();
      textSize(25);
      strokeWeight(4);
      stroke(255, 120, 0);
      fill(0);
      textAlign(CENTER);
      text("Say Hello to "+name+" !", width/2, 120);
      pop();
    }
  pop();



  foodObj.getFoodStock();


    foodObj.display();
    //console.log(hours);
}

//////////////////////////////////////////////////////////////////////////////////////////////////

function readStock(data){
  foodS = data.val();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////

function writeStock(x){
    if(x<=0){
      x=0;
    }
    else if(x>0){
      x=x-1;
    }
  database.ref("/").update({
    'Food': x
  })
}

////////////////////////////////////////////////////////////////////////////////////////////////////

function readTimeDataBaseHours(hours){
  hor = hours.val();
}

function readTimeDataBaseMins(mins){
  min = mins.val();
}

function readTimeDataBaseSecs(secs){
  sec = secs.val();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////

function read(data){
  lastFed=data.val();
}

function feedDog(){
    if(foodS!==0){
    dead+=1;
    hor = hour();
    min = minute();
    sec = second();
    database.ref("/").update({
      "Hour": hor,
      "Minute": min,
      "Second": sec
    })
  }
    if(echo==='='){
      dog.addImage(happyDog);
      
    }
  writeStock(foodS);
  o_loc=1;


}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function getTime(){

  var response = await fetch("http://worldtimeapi.org/api/timezone/Asia/Kolkata");
    var responsejson = await response.json();
    var dt = responsejson.datetime;
    var hr = dt.slice(11, 13);

      if(hr>=06&&hr<18){
        bg = loadImage("images/day.jpg");
      }
      else if (hr>=18&&hr<06){
        bg = loadImage("images/night.jpg");
      }

}



