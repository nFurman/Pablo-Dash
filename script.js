const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");

canvas.width = 640;
canvas.height = 480;

const deathSound = new Audio("resources/explode_11.mp3");

const tau = 2 * Math.PI;
let tps = 60;

let playerImage = new Image();
playerImage.src = "resources/coakmuffer.jpeg";

let backgroundImage = new Image();
backgroundImage.src = "resources/background.jpeg";

let spikeImage = new Image();
spikeImage.src = "resources/spike.png";

let blockImage = new Image();
blockImage.src = "resources/block.png";

//let player = new icon({ sideLength: 50, image: playerImage });

let currentAttempt = {
  x: 0,
  att: 1,
  tick: 0,
  speedSetting: 7,
  speed: 7 * (60 / tps),

  renderedHazards: [],
  renderedBlocks: [],

  renderAll() {
    for (let ob of obstacles) {
      if (ob.type === "block") {
        this.renderedBlocks.push(new block(ob));
      } else {
        this.renderedHazards.push(new obstacle(ob));
      }
      ob.hasBeenRendered = true;
    }
  },

  renderNextGroup() {
    //console.log("trying to render");
    for (let ob of obstacles) {
      if (
        ob.hasBeenRendered != true &&
        ob.originalPos.x - this.x < canvas.width + 50 &&
        ob.originalPos.x - this.x > -50
      ) {
        if (ob.type === "block") {
          this.renderedBlocks.push(new block(ob));
        } else {
          this.renderedHazards.push(new obstacle(ob));
        }
        console.log("rendered a " + ob.type);
        ob.hasBeenRendered = true;
      }
    }
  },

  unrender() {
    if (this.renderedBlocks.length !== 0) {
      while (this.renderedBlocks[0].pos.x < -50) {
        console.log("unrendering " + this.renderedBlocks[0].type);
        this.renderedBlocks.shift();
        if (this.renderedBlocks.length === 0) {
          break;
        }
      }
    }
    if (this.renderedHazards.length !== 0) {
      while (this.renderedHazards[0].pos.x < -50) {
        console.log("unrendering " + this.renderedHazards[0].type);
        this.renderedHazards.shift();
        if (this.renderedHazards.length === 0) {
          break;
        }
      }
    }
  },
};

let player = {
  image: playerImage,
  sideLength: 50,
  pos: {
    y: 50,
    x: 120,
  },
  angle: 0,
  jump: {
    isJumping: false,
    tickStarted: 0,
    heightStarted: 50,
    angleStarted: 0,
  },
  fall: {
    isFalling: false,
    tickStarted: 0,
    heightStarted: 50,
    angleStarted: 0,
  },
  onGround: true,
  holding: false,

  doFall() {
    this.fall = {
      isFalling: true,
      tickStarted: currentAttempt.tick,
      heightStarted: this.pos.y,
      angleStarted: this.angle,
    };
  },

  doJump() {
    this.jump = {
      isJumping: true,
      tickStarted: currentAttempt.tick,
      heightStarted: this.pos.y,
      angleStarted: this.angle,
    };
  },

  land() {
    console.log("landed");
    this.pos.y = this.sideLength * Math.ceil(this.pos.y / this.sideLength);
    this.fall.isFalling = false;
    this.jump.isJumping = false;
    if (!this.holding) {
      this.onGround = true;
      this.jump.isJumping = false;
      this.angle =
        0.5 * Math.PI * Math.round(((this.angle % tau) / tau) * 4 - 0.2);
    } else {
      this.doJump();
    }
  },

  updatePosition() {
    if (this.onGround && this.holding) {
      this.onGround = false;
      this.doJump();
    }
    if (this.jump.isJumping) {
      this.angle =
        this.jump.angleStarted -
        (currentAttempt.tick - this.jump.tickStarted) * 0.115 * (60 / tps);
    } else if (this.fall.isFalling) {
      this.angle =
        this.fall.angleStarted -
        (currentAttempt.tick - this.fall.tickStarted) * 0.12 * (60 / tps);
    }
    if (this.jump.isJumping === true) {
      //this.pos.y += (13.2 - this.airTime) / 1.1;
      let jumpProgress =
        (currentAttempt.tick - this.jump.tickStarted) * (60 / 26 / tps) + 0.05;
      //console.log("jump prog: " + jumpProgress);
      this.pos.y =
        this.jump.heightStarted +
        400 * jumpProgress -
        400 * jumpProgress * jumpProgress;
      if (this.pos.y <= this.sideLength) {
        this.land();
      }
    }
    if (this.fall.isFalling === true) {
      let fallProgress =
        (currentAttempt.tick - this.fall.tickStarted) * (60 / 26 / tps) - 0.02;
      this.pos.y =
        this.fall.heightStarted -
        400 * fallProgress * fallProgress -
        80 * fallProgress;
      if (this.pos.y <= this.sideLength) {
        this.land();
      }
    }
  },

  draw() {
    if (this.angle === 0) {
      c.drawImage(
        this.image,
        this.pos.x,
        canvas.height - this.pos.y,
        this.sideLength,
        this.sideLength
      );
    } else {
      let translateX = this.pos.x + this.sideLength / 2;
      let translateY = canvas.height - this.pos.y + this.sideLength / 2;
      c.translate(translateX, translateY);
      c.rotate(-this.angle);
      c.drawImage(
        this.image,
        -this.sideLength / 2,
        -this.sideLength / 2,
        this.sideLength,
        this.sideLength
      );
      c.rotate(this.angle);
      c.translate(-translateX, -translateY);
    }
  },
  drawHitboxes() {
    c.fillStyle = "forestGreen";
    c.globalAlpha = 0.7;

    c.fillRect(
      this.pos.x,
      canvas.height - this.pos.y,
      player.sideLength,
      player.sideLength
    );
    c.globalAlpha = 1;
  },
};

let background = {
  image: backgroundImage,
  x: 0,

  updatePosition() {
    //this.pos.x = this.pos.x > -canvas.width ? this.pos.x - currentAttempt.speed : canvas.width;
    // if (this.pos.x - currentAttempt.speed <= -canvas.width) {
    //   console.log(this.pos.x);
    // }
    this.x = ((-currentAttempt.tick * currentAttempt.speed) / 3) % canvas.width;
  },

  draw() {
    c.drawImage(this.image, this.x, 0, canvas.width, canvas.height);
    c.drawImage(
      this.image,
      this.x + canvas.width,
      0,
      canvas.width,
      canvas.height
    );
  },
};

let startTime = Date.now();
let intervalID = setInterval(nextTick, 1000 / tps);
function nextTick() {
  currentAttempt.tick = ((Date.now() - startTime) * tps) / 1000;
  currentAttempt.x = currentAttempt.tick * currentAttempt.speed;
  if (currentAttempt.tick % 60) {
    currentAttempt.renderNextGroup();
    currentAttempt.unrender();
  }

  background.updatePosition();
  for (let ob of currentAttempt.renderedHazards) {
    ob.updatePosition();
    if (ob.checkDeath()) {
      death();
    }
  }
  let landing = false;
  let falling = true;
  if (currentAttempt.renderedBlocks.length === 0) {
    falling = false;
  }
  for (let ob of currentAttempt.renderedBlocks) {
    ob.updatePosition();
    if (ob.checkDeath()) {
      death();
      return;
    }
    let sliding = ob.checkSliding();
    if (
      !player.onGround &&
      sliding &&
      player.jump.isJumping === true &&
      (currentAttempt.tick - player.jump.tickStarted) * (60 / 26 / tps) > 0.4
    ) {
      landing = true;
    }

    if (
      player.pos.y === player.sideLength ||
      player.jump.isJumping ||
      player.fall.isFalling ||
      sliding
    ) {
      falling = false;
    }
  }
  if (landing) {
    player.land();
    console.log("landing");
  }
  if (falling) {
    console.log("falling");
    player.onGround = false;
    player.doFall();
  }
  player.updatePosition();
}

function animate() {
  animationFrame = window.requestAnimationFrame(animate);

  //console.log(animationFrame / currentAttempt.tick);
  background.draw();
  for (let ob of currentAttempt.renderedHazards) {
    ob.draw();
    ob.drawHitboxes();
  }
  for (let ob of currentAttempt.renderedBlocks) {
    ob.draw();
    ob.drawHitboxes();
  }
  player.draw();
  player.drawHitboxes();
}
animate();

function death() {
  console.log("broooooo");
  //deathSound.play();
  clearInterval(intervalID);
}

document.addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "ArrowUp") {
    //console.log("jumpin");
    player.holding = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === " " || e.key === "ArrowUp") {
    player.holding = false;
  }
});
