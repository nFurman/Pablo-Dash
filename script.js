const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 640;
canvas.height = 480;

const tau = 2 * Math.PI;
let tps = 60;

let playerImage = new Image();
playerImage.src = "img/coakmuffer.jpeg";

let backgroundImage = new Image();
backgroundImage.src = "img/background.jpeg";

let spikeImage = new Image();
spikeImage.src = "img/spike.png";

let blockImage = new Image();
blockImage.src = "img/block.png";

//let player = new icon({ sideLength: 50, image: playerImage });

let currentAttempt = {
  x: 0,
  att: 1,
  tick: 0,
  speed: 7,

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
  sideLength: 50,
  pos: {
    y: 50,
    x: 120,
  },
  image: playerImage,
  airFrame: -1,
  angle: 0,
  onGround: true,
  holding: false,

  land() {
    this.pos.y = this.sideLength * Math.ceil(this.pos.y / this.sideLength);
    this.angle =
      0.5 * Math.PI * Math.round(((this.angle % tau) / tau) * 4 - 0.2);
    this.airFrame = -1;
    if (!this.holding) {
      this.onGround = true;
    }
  },

  updatePosition() {
    if (this.onGround && this.holding) {
      this.onGround = false;
    }
    if (!this.onGround) {
      this.angle -= 0.1;
      this.airFrame++;
    }
    if (this.airFrame > -1) {
      this.pos.y += 13.2 - this.airFrame / 1.1;
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
};

let background = {
  image: backgroundImage,
  x: 0,

  updatePosition() {
    //this.pos.x = this.pos.x > -canvas.width ? this.pos.x - currentAttempt.speed : canvas.width;
    // if (this.pos.x - currentAttempt.speed <= -canvas.width) {
    //   console.log(this.pos.x);
    // }
    this.x = (this.x - currentAttempt.speed / 3) % canvas.width;
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

let intervalID = setInterval(nextTick, 1000 / tps);
function nextTick() {
  currentAttempt.tick++;
  currentAttempt.x += currentAttempt.speed;
  if (currentAttempt.tick % 60) {
    currentAttempt.renderNextGroup();
    currentAttempt.unrender();
  }

  background.updatePosition();
  for (let ob of currentAttempt.renderedHazards) {
    ob.updatePosition();
    if (ob.checkDeath()) {
      console.log("broooooo");
      //alert("deat");
      clearInterval(intervalID);
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
      console.log("broooooo");
      //alert("deat");
      clearInterval(intervalID);
    }
    let sliding = ob.checkSliding();
    if (!player.onGround && sliding) {
      landing = true;
    }

    if (player.pos.y === player.sideLength || player.airFrame > -1 || sliding) {
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
    player.airFrame = 13;
  }
  player.updatePosition();
}

function animate() {
  animationFrame = window.requestAnimationFrame(animate);

  background.draw();
  for (let ob of currentAttempt.renderedHazards) {
    ob.draw();
  }
  for (let ob of currentAttempt.renderedBlocks) {
    ob.draw();
  }
  player.draw();
}
animate();

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
