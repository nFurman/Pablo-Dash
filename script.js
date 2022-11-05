const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");

canvas.width = 1440;
canvas.height = 800;

const tau = 2 * Math.PI;

const deathSound = new Audio("resources/explode_11.mp3");

let tps = 300;

let gridLength = 73;

let cubeImage = new Image();
cubeImage.src = "resources/coakmuffer.jpeg";

let waveImage = new Image();
waveImage.src = "resources/wave.png";

let backgroundImage = new Image();
backgroundImage.src = "resources/background.jpeg";

let groundImage = new Image();
groundImage.src = "resources/ground.jpeg";

let spikeImage = new Image();
spikeImage.src = "resources/spike.png";

let blockImage = new Image();
blockImage.src = "resources/block.png";

let wavePortalImage = new Image();
wavePortalImage.src = "resources/wavePortal.png";

let cubePortalImage = new Image();
cubePortalImage.src = "resources/cubePortal.png";

const gamemodes = {
  cube: {
    hitbox: { left: 0, right: 0, top: 0, bottom: 0 },
    hitboxForBlocks: { left: 0, right: 0, top: 20, bottom: 20 },
    image: cubeImage,
  },
  wave: {
    image: waveImage,
    hitbox: { left: 7, right: 40, top: 33, bottom: 33 },
    hitboxForBlocks: { left: 7, right: 40, top: 33, bottom: 33 },
  },
};

const objs = {
  spike: {
    image: spikeImage,
    objType: "hazard",
    hitbox: { top: 38, bottom: 5, left: 32, right: 32 },
    width: 1,
    height: 1,
  },
  wavePortal: {
    image: wavePortalImage,
    objType: "portal",
    gamemode: "wave",
    portalHitbox: { top: 0, bottom: 0, left: 0, right: 0 },
    width: 1,
    height: 2,
  },
  cubePortal: {
    objType: "portal",
    gamemode: "cube",
    image: cubePortalImage,
    portalHitbox: { top: 0, bottom: 0, left: 0, right: 0 },
    width: 1,
    height: 2,
  },
  block: {
    image: blockImage,
    objType: "block",
    slideHitbox: { top: 0, bottom: 80, left: 0, right: 0 },
    hitbox: { top: 0, bottom: 0, left: 0, right: 0 },
    width: 1,
    height: 1,
  },
};

// for (let obj of fabulous_zonkoid) {
//   obj.originalPos.x -= 37;
// }

let currentAttempt;
let currentBackground;
let currentGround;
let currentPlayer;

let lastDistanceMovedWhenRendered;
function nextTick() {
  //console.log(currentPlayer.angle);
  //console.log(currentPlayer.hitbox);
  //console.log(currentPlayer.fall);
  //console.log(currentPlayer.jump);
  //console.log(currentPlayer.pos.y, currentGround.y);
  let potentialTick = Math.round(
    ((Date.now() - currentAttempt.startTime) * tps) / 1000
  );
  if (potentialTick - currentAttempt.tick == 2) {
    currentAttempt.tick++;
  } else {
    currentAttempt.tick = potentialTick;
  }
  //console.log(currentAttempt.tick);
  currentAttempt.distanceMoved = currentAttempt.tick * currentAttempt.speed;
  if (
    currentAttempt.distanceMoved - lastDistanceMovedWhenRendered > gridLength ||
    currentAttempt.tick < 50
  ) {
    lastDistanceMovedWhenRendered = currentAttempt.distanceMoved;
    currentAttempt.renderNextGroup();
    currentAttempt.unrenderNextGroup();
    currentPlayer.unrenderNextWaveTrails();
  }

  if (currentAttempt.objHitboxesShown) {
    currentAttempt.showObjHitboxes();
  }

  for (let ob of currentAttempt.renderedHazards) {
    ob.updatePosition();
  }
  for (let ob of currentAttempt.renderedBlocks) {
    ob.updatePosition();
  }
  for (let ob of currentAttempt.renderedPortals) {
    ob.updatePosition();
  }

  currentPlayer.updateStatus();
  currentPlayer.updatePosition();
  if (!currentPlayer.noclip) currentPlayer.checkDeath();

  currentBackground.updatePosition();
  currentGround.updatePosition();
}

function animate() {
  animationFrame = window.requestAnimationFrame(animate);
  //console.log(currentAttempt.intervalID);
  currentBackground.draw();
  for (let ob of currentAttempt.renderedHazards) {
    ob.draw();
  }
  for (let ob of currentAttempt.renderedBlocks) {
    ob.draw();
  }
  for (let ob of currentAttempt.renderedPortals) {
    ob.drawLeftHalf();
  }
  for (let ob of currentAttempt.renderedHazards) {
    ob.drawHitboxes();
  }
  for (let ob of currentAttempt.renderedBlocks) {
    ob.drawHitboxes();
  }

  currentPlayer.draw();

  for (let ob of currentAttempt.renderedPortals) {
    ob.drawRightHalf();
    ob.drawHitboxes();
  }
  currentPlayer.drawHitboxes();

  currentGround.draw();
  currentPlayer.checkExplosion();
}

function drawHitbox({ color, opacity, x, y, width, height }) {
  c.fillStyle = color;
  c.globalAlpha = opacity;

  c.fillRect(x, canvas.height - y, width, height);
  c.globalAlpha = 1;
}

function checkCollision(rect1, rect2) {
  if (
    rect1.x + rect1.width >= rect2.x &&
    rect1.x <= rect2.x + rect2.width &&
    rect1.y - rect1.height <= rect2.y &&
    rect1.y >= rect2.y - rect2.height
  ) {
    return true;
  } else {
    return false;
  }
}
function death() {
  console.log("broooooo");
  currentPlayer.isDead = true;

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
  currentAttempt = new Attempt(fabulous_zonkoid, 8.7, "cube");
  currentAttempt.att = 1;
  currentAttempt.intervalID = setInterval(nextTick, 1000 / tps);
  currentAttempt.startTime = Date.now();
  currentBackground = new Background(backgroundImage);
  currentGround = new Ground(groundImage);
  currentPlayer = new Player();
  currentAttempt.copyObjs();
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
  currentAttempt.copyObjs();
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

  if (e.key == "n") {
    currentPlayer.noclip = !currentPlayer.noclip;
  }

  if (e.key == "p") {
    console.table(currentPlayer.renderedWaveTrails);
    clearInterval(currentAttempt.intervalID);
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === " " || e.key === "ArrowUp") {
    currentPlayer.holding = false;
  }
});

let testSpikeData = {
  type: "spike",
  position: {
    x: 3,
    y: 1,
  },
};
let testSpike = new Hazard(testSpikeData);
