// game is false to start, but changes to true when the user clicks the start button 

let gravity = 0.3;
let bounceFactor = 0.1;
let lastTime = 0;
let deltaTime = 0;
let speed = 18;
let accelleration = 1;
let worldHeight = 360;
let worldWidth = 540;
let velocityXLimit = 10;
let velocityYLimit = 10;
let friction = 0.95;
let frictionAir = 0.99;
let jump = 90;
let tileSize = [20, 20];
let playerSize = [10, 18];
let totalPoints = 0;
let defaultMap = "db.json";
let worldTiles = [];
let gameObjects = [];
let items = [];
let playerObject = null;
let messageElement = null;

let startButton = document.querySelector('#start');
let world = document.querySelector('#world');
let velocityXDebug = document.querySelector('#velocityX');
let velocityYDebug = document.querySelector('#velocityY');

// set the game world size
world.style.width = `${worldWidth}px`;
world.style.height = `${worldHeight}px`;

const controller = {
  w: {pressed: false, func: movePlayerUp},
  s: {pressed: false, func: movePlayerDown},
  a: {pressed: false, func: movePlayerLeft},
  d: {pressed: false, func: movePlayerRight}
}

function resetController() {
  Object.keys(controller).forEach(key => {
    controller[key].pressed = false;
  })
}

// Below are some empty event listeners to use as guidance. Don't forget to create the elements, assign them a class or ID, and then grab them using document.querySelector

// The event listener to start the game
startButton.addEventListener("click", function() {
  startGame();
});

function gameLoop(timestamp) {
  const currentTime = timestamp;
  // convert time in milliseconds to seconds
  const deltaTime = (currentTime - lastTime) / 1000; 
  lastTime = currentTime;
  
  if (playerObject != null) {
    runPressedButtons(playerObject);
  }

  // for all game objects the can move update their positions
  gameObjects.forEach(object => updatePostion(deltaTime, object));
  // check for player death
  if (playerObject != null && playerObject.y > worldHeight) {
    console.log('player death')
    playerDeath();
  }
  // set the debug info at the top of the game world.
  renderDebugInfo(playerObject);
  // request next frame
  requestAnimationFrame(gameLoop);
}

// The item that fires
function startGame() {
  if (playerObject) {
    playerObject.remove();
  }
  playerObject = null;
  if (messageElement) {
    messageElement.remove();
  }
  messageElement = null;
  loadMap(defaultMap);
  requestAnimationFrame(gameLoop);
}

// Check to see if an object hits another object
function checkCollision(object) {
  worldTiles.forEach(collider => {
    // check to see if any part of object is in collider
    if (object.x < collider.x + collider.width &&
      object.x + object.width > collider.x &&
      object.y < collider.y + collider.height &&
      object.y + object.height > collider.y) {
      // left side of collider
      const dx = (object.x + object.width / 2) - (collider.x + collider.width / 2);
      const dy = (object.y + object.height / 2) - (collider.y + collider.height / 2);
      const width = (object.width + collider.width) / 2;
      const height = (object.height + collider.height) / 2;
      const crossWidth = width * dy;
      const crossHeight = height * dx;

      if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
        if (crossWidth > crossHeight) {
          if (crossWidth > -crossHeight) {
            // Collision from bottom
            object.y = collider.y + collider.height;
            object.velocityY = 0;
          } else {
            // Collision from left
            object.x = collider.x - object.width;
            object.velocityX = 0;
          }
        } else {
          if (crossWidth > -crossHeight) {
            // Collision from right
            object.x = collider.x + collider.width;
            object.velocityX =0;
          } else {
            // Collision from top
            object.y = collider.y - object.height;
            object.velocityY =0;
          }
        }
      }
    }
  });
  return object;
}


function updatePostion(delta, object) {
  // Apply gravity to objects
  object.velocityY += gravity;
  if (object.velocityY > velocityYLimit) {
      object.velocityY = velocityYLimit;
  }
  // Update object positions
  object.x += object.velocityX * speed * delta;
  object.y += object.velocityY * speed * delta;
  object.velocityX *= friction;
  object.velocityY *= frictionAir;
  object = checkCollision(object);
  object.style.left = `${object.x}px`;
  object.style.top = `${object.y}px`;
}

function handleKeyDown(e) {
  controller[e.key] && (controller[e.key].pressed = true)
}

function handleKeyUp(e) {
  controller[e.key] && (controller[e.key].pressed = false)
}

function runPressedButtons(player) {
  Object.keys(controller).forEach(key => {
    controller[key].pressed && controller[key].func(player)
  })
}

function movePlayerUp(player) {
  // TODO: add jump animation
  // Jump
  if(player.velocityY === 0 ) {
    player.velocityY -= jump;
    if (player.velocityY < -velocityYLimit) {
      player.velocityY = -velocityYLimit;   
    } 
  }
}

function movePlayerDown(player) {
  // Duck
  // TODO: add duck or swim down animation
  // player.y += accelleration;
}

function movePlayerLeft(player) {
  player.velocityX -= accelleration;
  if (player.velocityX < -velocityXLimit) {
    player.velocityX = -velocityXLimit;
  }
}
function movePlayerRight(player) {
  player.velocityX += accelleration;
  if (player.velocityX > velocityXLimit) {
    player.velocityX = velocityXLimit;
  }
}

function addPlayerController() {
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
}

function removePlayerController() {
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("keyup", handleKeyUp);
}

function playerDeath() {
  removePlayerController(playerObject);
  playerObject.remove();
  playerObject = null;
  resetController();
  renderMessage("player died");
}

function player(tile) {
  const playerElement = document.createElement('div');
  // init params of player
  playerElement.velocityX = 0;
  playerElement.velocityY = 0;
  playerElement.x = tile.location.x * tileSize[0];
  playerElement.y = tile.location.y * tileSize[1];
  playerElement.width = playerSize[0];
  playerElement.height = playerSize[1];
  playerElement.className = "player";
  playerElement.style.top = `${(tile.location.y * playerSize[1]) - playerSize[1]}px`;
  playerElement.style.left = `${tile.location.x * playerSize[0]}px`;
  // add event listener for player movement
  addPlayerController();
  return playerElement;
}

function groundTile(tile) {
  const tileElement = document.createElement('div');
  tileElement.className = "tile";

  // init params of tiles
  tileElement.x = tile.location.x * tileSize[0];
  tileElement.y = tile.location.y * tileSize[1];
  tileElement.width = tileSize[0];
  tileElement.height = tileSize[1];
  tileElement.style.top = `${tile.location.y * tileSize[1]}px`;
  tileElement.style.left = `${tile.location.x * tileSize[0]}px`;
  return tileElement;
}

function addTile(parentElement, tile) {
  // Select the parent element where you want to add the new element

  if (tile.type === "start") {
    if (playerObject === null) {
      playerObject = player(tile);
      parentElement.appendChild(playerObject);
      gameObjects.push(playerObject);
    }
  } else {
    // Create a new element
    let tileElement = groundTile(tile);
    // Append the new element to the parent element
    parentElement.appendChild(tileElement);
    worldTiles.push(tileElement)
  }
}

function loadMap(map) {
  fetch(map)
    .then(response => response.json())
    .then(data => {
      // Do something with the loaded JSON data
      data.forEach(tile => {
        addTile(world, tile);
      })
    })
    .catch(error => {
      console.error('Error loading JSON file:', error);
    });
}

function renderDebugInfo(object) {
  velocityXDebug.innerHTML = `velocityX: ${object?.velocityX ? object?.velocityX : '--'}`;
  velocityYDebug.innerHTML = `velocityY: ${object?.velocityY ? object?.velocityY : '--'}`;
}

function renderMessage(message, timeLimit=5000) {
  messageElement = document.createElement('div');
  messageElement.innerHTML = `<p>${message}</p>`;
  messageElement.className="alert";
  world.appendChild(messageElement);
  setTimeout(() => messageElement.remove(), timeLimit);
}