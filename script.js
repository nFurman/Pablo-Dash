const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");

canvas.width = 1440;
canvas.height = 770;

const tau = 2 * Math.PI;

const deathSound = new Audio("resources/explode_11.mp3");

let tps = 60;

let gridLength = 71;

let playerImage = new Image();
playerImage.src = "resources/coakmuffer.jpeg";

let backgroundImage = new Image();
backgroundImage.src = "resources/background.jpeg";

let spikeImage = new Image();
spikeImage.src = "resources/spike.png";

let blockImage = new Image();
blockImage.src = "resources/block.png";

let currentAttempt;
let currentBackground;
let currentPlayer;

function nextTick() {
  currentAttempt.tick = ((Date.now() - currentAttempt.startTime) * tps) / 1000;
  currentAttempt.x = currentAttempt.tick * currentAttempt.speed;
  if (currentAttempt.tick % 60) {
    currentAttempt.renderNextGroup();
    currentAttempt.unrenderNextGroup();
  }
  currentPlayer.updatePosition();

  currentBackground.updatePosition();

  for (let ob of currentAttempt.renderedHazards) {
    ob.updatePosition();
    if (ob.checkDeath()) {
      death();
    }
  }

  for (let ob of currentAttempt.renderedBlocks) {
    ob.updatePosition();
    if (ob.checkDeath()) {
      death();
    }
  }

  if (currentPlayer.pos.y <= currentPlayer.sideLength + currentAttempt.floorY) {
    if (!currentPlayer.slide.isSliding) {
      console.log(currentAttempt.floorY);

      currentPlayer.land(currentAttempt.floorY);
    }
  } else {
    let wasSliding = false;
    if (currentPlayer.slide.isSliding) {
      console.log("wasSlidin");
      wasSliding = true;
    }

    currentAttempt.checkSliding();

    if (wasSliding && !currentPlayer.slide.isSliding) {
      currentPlayer.doFall();
    } else if (!wasSliding && currentPlayer.slide.isSliding) {
      console.log("landin");
      currentPlayer.land(currentPlayer.slide.height);
    }
  }

  //console.log(
  ///"falling: " +
  ///currentPlayer.fall.isFalling +
  //" sliding: " + currentPlayer.sliding
  //);
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
}

function death() {
  console.log("broooooo");
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
  currentBackground = new background(backgroundImage);
  currentAttempt = new attempt(obstacles, 8.9);
  currentAttempt.copyObstacles();
  currentAttempt.att = 1;
  currentAttempt.intervalID = setInterval(nextTick, 1000 / tps);
  currentAttempt.startTime = Date.now();
  currentPlayer = new player(playerImage);

  animate();
}

function newAttempt(currentIntervalID) {
  if (currentAttempt.intervalID != currentIntervalID) {
    return;
  }
  currentAttempt.unrenderAll();
  currentAttempt.att++;
  clearInterval(currentIntervalID);

  currentAttempt.intervalID = setInterval(nextTick, 1000 / tps);
  currentAttempt.startTime = Date.now();

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
