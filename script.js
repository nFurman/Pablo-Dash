const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");

canvas.width = 1440;
canvas.height = 800;

const tau = 2 * Math.PI;

const deathSound = new Audio("resources/explode_11.mp3");

let tps = 120;

let gridLength = 73;

let playerImage = new Image();
playerImage.src = "resources/coakmuffer.jpeg";

let backgroundImage = new Image();
backgroundImage.src = "resources/background.jpeg";

let groundImage = new Image();
groundImage.src = "resources/ground.jpeg";

let spikeImage = new Image();
spikeImage.src = "resources/spike.png";

let blockImage = new Image();
blockImage.src = "resources/block.png";

let currentAttempt;
let currentBackground;
let currentGround;
let currentPlayer;

function nextTick() {
  //console.log(currentPlayer.pos.y);
  let potentialTick = Math.round(
    ((Date.now() - currentAttempt.startTime) * tps) / 1000
  );
  if (potentialTick - currentAttempt.tick == 2) {
    currentAttempt.tick++;
  } else {
    currentAttempt.tick = potentialTick;
  }
  //console.log(currentAttempt.tick);
  currentAttempt.x = currentAttempt.tick * currentAttempt.speed;
  if (currentAttempt.tick % 60 == 0 || currentAttempt.tick < 50) {
    currentAttempt.renderNextGroup();
    currentAttempt.unrenderNextGroup();
  }

  if (currentAttempt.obstacleHitboxesShown) {
    currentAttempt.showObstacleHitboxes();
  }

  currentPlayer.updateStatus();
  currentPlayer.updatePosition();
  currentPlayer.checkDeath();

  currentBackground.updatePosition();
  currentGround.updatePosition();
}

function animate() {
  animationFrame = window.requestAnimationFrame(animate);
  //console.log(currentAttempt.intervalID);
  currentBackground.draw();
  for (let ob of currentAttempt.renderedHazards) {
    ob.draw();
    ob.drawHitboxes();
  }
  for (let ob of currentAttempt.renderedBlocks) {
    ob.draw();
    ob.drawHitboxes();
  }
  currentPlayer.draw();
  currentPlayer.checkExplosion();

  currentPlayer.drawHitboxes();
  currentGround.draw();
}

function death() {
  console.log("broooooo");

  console.log(currentAttempt);

  currentAttempt.showObstacleHitboxes();
  currentPlayer.hitboxesShown = true;

  //console.log(currentAttempt.renderedBlocks, currentAttempt.renderedHazards);
  //console.log(currentAttempt.intervalID);
  //deathSound.play();
  clearInterval(currentAttempt.intervalID);
  currentPlayer.explode();
  //let currentIntervalID = currentAttempt.intervalID;
  // setTimeout(() => {
  //   if (currentAttempt.intervalID === currentIntervalID) {
  //     newAttempt();
  //   }
  // }, 1000);
  setTimeout(newAttempt, 1000, currentAttempt.intervalID);
}

function startAttempt() {
  currentAttempt = new attempt(obstacles, 8.9);
  currentAttempt.att = 1;
  currentAttempt.intervalID = setInterval(nextTick, 1000 / tps);
  currentAttempt.startTime = Date.now();
  currentBackground = new background(backgroundImage);
  currentGround = new ground(groundImage);
  currentPlayer = new player(playerImage);
  currentAttempt.copyObstacles();
  currentAttempt.renderNextGroup();

  animate();
}

function newAttempt(currentIntervalID) {
  if (currentAttempt.intervalID != currentIntervalID) {
    return;
  }
  currentAttempt.unrenderAll();
  currentAttempt.att++;
  clearInterval(currentIntervalID);

  currentAttempt.startTime = Date.now();
  currentAttempt.intervalID = setInterval(nextTick, 1000 / tps);

  currentPlayer.reset();
  currentAttempt.copyObstacles();
}

document.addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "ArrowUp") {
    //console.log("jumpin");
    currentPlayer.holding = true;
  }
  if (e.key == "s") {
    startAttempt();
  }
  if (e.key == "r") {
    newAttempt(currentAttempt.intervalID);
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === " " || e.key === "ArrowUp") {
    currentPlayer.holding = false;
  }
});
