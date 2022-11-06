const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const tau = 2 * Math.PI;

const deathSound = new Audio("resources/explode_11.mp3");
deathSound.volume = 0.1;

const menuLoop = new Audio("resources/menuLoop.mp3");
menuLoop.volume = 0.3;

let tps = 300;

let gridLength = 73;

const cubeImage = new Image();
cubeImage.src = "resources/coakmuffer.jpeg";

const waveImage = new Image();
waveImage.src = "resources/wave.png";

const backgroundImage = new Image();
backgroundImage.src = "resources/background.jpeg";

const groundImage = new Image();
groundImage.src = "resources/ground.jpeg";

const spikeImage = new Image();
spikeImage.src = "resources/spike.png";

const flatSpikeImage = new Image();
flatSpikeImage.src = "resources/spike.png";

const blockImage = new Image();
blockImage.src = "resources/block.png";

const wavePortalImage = new Image();
wavePortalImage.src = "resources/wavePortal.png";

const cubePortalImage = new Image();
cubePortalImage.src = "resources/cubePortal.png";

const yellowPadImage = new Image();
yellowPadImage.src = "resources/yellowPad.png";

const pinkPadImage = new Image();
pinkPadImage.src = "resources/pinkPad.png";

const skeptic_chamber_song = new Audio("resources/skeptic chamber.mp3");
skeptic_chamber_song.volume = 0.6;

const careening_cosmonaut_song = new Audio("resources/careening cosmonaut.mp3");
careening_cosmonaut_song.volume = 1;

const fabulous_zonkoid_song = new Audio("resources/fabulous zonkoid.mp3");
fabulous_zonkoid_song.volume = 0.3;

const gamemodes = {
  cube: {
    hitbox: { left: 0, right: 0, top: 0, bottom: 0 },
    hitboxForBlocks: { left: 0, right: 0, top: 20, bottom: 20 },
    image: cubeImage,
  },
  wave: {
    image: waveImage,
    hitbox: { left: 13, right: 40, top: 33, bottom: 33 },
    hitboxForBlocks: { left: 13, right: 40, top: 33, bottom: 33 },
  },
};

const objs = {
  spike: {
    image: spikeImage,
    objType: "hazard",
    hitbox: { top: 38, bottom: 15, left: 33, right: 33 },
    width: 1,
    height: 1,
  },
  flatSpike: {
    image: flatSpikeImage,
    objType: "hazard",
    hitbox: { top: 30, bottom: 20, left: 34, right: 34 },
    width: 1,
    height: 0.5,
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
  yellowPad: {
    objType: "pad",
    image: yellowPadImage,
    padHitbox: { top: 0, bottom: 0, left: 0, right: 0 },
    width: 1,
    height: 0.2,
  },
  pinkPad: {
    objType: "pad",
    image: pinkPadImage,
    padHitbox: { top: 0, bottom: 0, left: 0, right: 0 },
    width: 1,
    height: 0.2,
  },
};

// for (let obj of skeptic_chamber) {
//   obj.originalPos.x -= 37;
// }
let currentScreen = "mainMenu";

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
  for (let ob of currentAttempt.renderedPads) {
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
  for (let ob of currentAttempt.renderedPads) {
    ob.draw();
  }
  for (let ob of currentAttempt.renderedHazards) {
    ob.drawHitboxes();
  }
  for (let ob of currentAttempt.renderedBlocks) {
    ob.drawHitboxes();
  }
  for (let ob of currentAttempt.renderedPads) {
    ob.drawHitboxes();
  }

  currentPlayer.draw();

  for (let ob of currentAttempt.renderedPortals) {
    ob.drawRightHalf();
    ob.drawHitboxes();
  }
  currentPlayer.drawHitboxes();

  currentPlayer.checkExplosion();
  currentGround.draw();

  c.fillStyle = "white";
  c.font = "bold 80px Courier New";
  c.fillText(
    "ATTEMPT  " + currentAttempt.att,
    7 * gridLength - currentAttempt.distanceMoved,
    canvas.height - currentGround.y - 5.5 * gridLength
  );
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
  deathSound.play();
  currentAttempt.song.pause();
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
const mainMenuDiv = document.getElementById("mainMenuDiv");
const windowDiv = document.getElementById("windowDiv");
const levelSelectorDiv = document.getElementById("levelSelectorDiv");

const shodBox = document.getElementById("shod");
const noclipBox = document.getElementById("noclip");
const menuLoopBox = document.getElementById("menuLoop");

levelSelectorDiv.remove();

function playMenuLoop() {
  if (currentScreen != "playing" && menuLoopBox.checked) menuLoop.play();
  document.removeEventListener("mousedown", playMenuLoop);
}

document.addEventListener("mousedown", playMenuLoop);

menuLoopBox.addEventListener("change", function () {
  if (this.checked) {
    menuLoop.currentTime = 0;
    menuLoop.play();
  } else {
    menuLoop.pause();
  }
});

function playButtonClicked() {
  currentScreen = "levelSelect";
  mainMenuDiv.remove();
  windowDiv.prepend(levelSelectorDiv);
}

function careeningCosmonautButtonClicked() {
  levelSelectorDiv.remove();
  startAttempt(careening_cosmonaut, careening_cosmonaut_song);
}
function fabulousZonkoidButtonClicked() {
  levelSelectorDiv.remove();
  startAttempt(fabulous_zonkoid, fabulous_zonkoid_song, 13);
}

function skepticChamberButtonClicked() {
  levelSelectorDiv.remove();
  startAttempt(skeptic_chamber, skeptic_chamber_song, 10.9);
}

function startAttempt(levelObjs, levelSong, offset = 0) {
  menuLoop.pause();
  currentScreen = "playing";
  let shod = shodBox.checked;
  currentAttempt = new Attempt(levelObjs, levelSong, 8.7, "cube", shod);
  currentAttempt.att = 1;
  currentAttempt.intervalID = setInterval(nextTick, 1000 / tps);
  currentAttempt.startTime = Date.now();
  currentBackground = new Background(backgroundImage);
  currentGround = new Ground(groundImage);
  currentPlayer = new Player();
  currentAttempt.copyObjs();
  currentAttempt.renderNextGroup();

  currentAttempt.songOffset = offset;
  currentAttempt.song.currentTime = currentAttempt.songOffset;
  currentAttempt.song.play();

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

  currentAttempt.song.currentTime = currentAttempt.songOffset;
  currentAttempt.song.play();
}

function escapeTo(screen) {
  switch (screen) {
    case "levelSelect":
      currentAttempt.song.pause();
      if (menuLoopBox.checked) {
        menuLoop.currentTime = 0;
        menuLoop.play();
      }
      clearInterval(currentAttempt.intervalID);
      currentAttempt.intervalID = "";
      windowDiv.prepend(levelSelectorDiv);
      currentScreen = "levelSelect";
      break;
    case "mainMenu":
      levelSelectorDiv.remove();
      windowDiv.prepend(mainMenuDiv);
      currentScreen = "mainMenu";
      break;
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "ArrowUp") {
    //console.log("jumpin");
    if (currentScreen === "playing") {
      currentPlayer.holding = true;
    }
  }

  if (e.key === "Escape") {
    if (currentScreen === "playing") {
      escapeTo("levelSelect");
    } else if (currentScreen === "levelSelect") {
      escapeTo("mainMenu");
    }
  }

  if (e.key === "r") {
    newAttempt(currentAttempt.intervalID);
  }

  if (e.key === "n" && noclipBox.checked) {
    currentPlayer.noclip = !currentPlayer.noclip;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === " " || e.key === "ArrowUp") {
    if (currentScreen === "playing") {
      currentPlayer.holding = false;
    }
  }
});

document.addEventListener("mousedown", (e) => {
  if (currentScreen === "playing") {
    currentPlayer.holding = true;
  }
});

document.addEventListener("mouseup", (e) => {
  if (currentScreen === "playing") {
    currentPlayer.holding = false;
  }
});
