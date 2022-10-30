class obstacle {
  constructor({ type, originalPos, rotation, size }) {
    switch (type) {
      case "spike":
        this.image = spikeImage;
        break;
      case "block":
        this.image = blockImage;
        break;
    }
    this.size = size;
    this.type = type;
    this.originalPos = originalPos;
    this.pos = { ...originalPos };
    this.rotation = rotation;
    this.showHitboxes = false;

    switch (this.type) {
      case "spike":
        this.hitbox = { top: 30, bottom: 0, left: 30, right: 30 };
        break;
      case "block":
        this.hitbox = { top: 40, bottom: 0, left: 14, right: 0 };
        break;
      default:
        this.hitbox = { top: 0, bottom: 0, left: 0, right: 0 };
        break;
    }
    for (let hb in this.hitbox) {
      hb *= size / 100;
    }
  }

  updatePosition() {
    //this.pos.x = this.pos.x - currentAttempt.speed;
    this.pos.x = this.originalPos.x - currentAttempt.x;
    //console.log(currentAttempt.speed);
  }
  //this.pos.x = this.originalPos.x - currentAttempt.x;

  draw() {
    c.drawImage(
      this.image,
      this.pos.x,
      canvas.height - this.pos.y,
      gridLength,
      gridLength
    );
  }

  checkDeath() {
    if (
      //checks if the player is too far left or too far right to collide, that way it returns and doesnt need to check the rest
      currentPlayer.pos.x + currentPlayer.sideLength <=
        this.pos.x + this.hitbox.left ||
      currentPlayer.pos.x >= this.pos.x + gridLength - this.hitbox.right
    ) {
      return false;
    } else if (
      currentPlayer.pos.y - currentPlayer.sideLength <
        this.pos.y - this.hitbox.top &&
      currentPlayer.pos.y > this.pos.y - gridLength + this.hitbox.bottom
    ) {
      return true;
    }
    return false;
  }

  drawHitboxes() {
    if (!this.showHitboxes) {
      return;
    }
    c.fillStyle = "red";
    c.globalAlpha = 0.7;
    c.fillRect(
      this.pos.x + this.hitbox.left,
      canvas.height - this.pos.y + this.hitbox.top,
      currentPlayer.sideLength - this.hitbox.left - this.hitbox.right,
      currentPlayer.sideLength - this.hitbox.bottom - this.hitbox.top
    );
    c.globalAlpha = 1;
  }
}

class block extends obstacle {
  constructor({ type, originalPos, rotation }) {
    super({ type, originalPos, rotation });
    switch (this.type) {
      case "block":
        this.slideHitbox = { top: 0, bottom: 60, left: 0, right: 0 };
        break;
      default:
        this.slideHitbox = { top: 0, bottom: 0, left: 0, right: 0 };
        break;
    }
    for (let hb in this.slideHitbox) {
      hb *= gridLength / 100;
    }
  }
  drawHitboxes() {
    if (!this.showHitboxes) {
      return;
    }
    super.drawHitboxes();
    c.fillStyle = "blue";
    c.globalAlpha = 0.7;
    c.fillRect(
      this.pos.x + this.slideHitbox.left,
      canvas.height - this.pos.y + this.slideHitbox.top,
      gridLength - this.slideHitbox.left - this.slideHitbox.right,
      gridLength - this.slideHitbox.bottom - this.slideHitbox.top
    );
    c.globalAlpha = 1;
  }

  checkSliding() {
    if (
      //checks if the player is too far left or too far right to collide, that way it returns and doesnt need to check the rest
      currentPlayer.pos.x + currentPlayer.sideLength <
        this.pos.x + this.slideHitbox.left ||
      currentPlayer.pos.x > this.pos.x + gridLength - this.slideHitbox.right
    ) {
      //   if (currentPlayer.pos.x + 50 < this.pos.x + this.slideHitbox.left) {
      //     console.log("too far left");
      //   }
      //   if (currentPlayer.pos.x > this.pos.x + 50 - this.slideHitbox.right) {
      //     console.log("too far right");
      //   }
      return;
    } else if (
      currentPlayer.pos.y - currentPlayer.sideLength <=
        this.pos.y - this.slideHitbox.top &&
      currentPlayer.pos.y > this.pos.y - gridLength + this.slideHitbox.bottom
    ) {
      currentPlayer.slide = {
        isSliding: true,
        height: this.pos.y,
      };
    }
  }
}

class player {
  constructor(image) {
    this.image = image;
    this.sideLength = 71;
    this.pos = {
      y: this.sideLength + currentAttempt.floorY,
      x: 4.7 * gridLength,
    };
    this.angle = 0;
    this.jump = {
      isJumping: false,
    };
    this.fall = {
      isFalling: false,
    };
    this.slide = {
      isSliding: true,
      height: this.pos.y - this.sideLength,
    };
    this.isExploding = false;
    this.explosion = {};
    this.holding = false;
    this.show = true;
    this.showHitboxes = false;
  }

  reset() {
    this.pos = {
      y: this.sideLength + currentAttempt.floorY,
      x: 4.7 * gridLength,
    };
    this.angle = 0;
    this.jump = {
      isJumping: false,
    };
    this.fall = {
      isFalling: false,
    };
    this.slide = {
      isSliding: true,
      height: this.pos.y - this.sideLength,
    };
    this.isExploding = false;
    this.explosion = {};
    this.show = true;
  }

  doFall() {
    this.slide.isSliding = false;
    this.fall = {
      isFalling: true,
      tickStarted: currentAttempt.tick,
      heightStarted: this.pos.y,
      angleStarted: this.angle,
    };
  }

  doJump() {
    console.log("jumpin");
    this.slide.isSliding = false;
    this.jump = {
      isJumping: true,
      tickStarted: currentAttempt.tick,
      heightStarted: this.pos.y,
      angleStarted: this.angle,
    };
  }

  land(y) {
    console.trace();

    console.log("landed");
    this.pos.y = this.sideLength + y;
    if (this.pos.y < this.sideLength + currentAttempt.floorY) {
      this.pos.y = this.sideLength + currentAttempt.floorY;
    }
    this.fall.isFalling = false;
    if (!this.holding) {
      this.jump.isJumping = false;
      this.sliding = {
        isSliding: true,
        height: y,
      };
      this.angle =
        0.5 * Math.PI * Math.round(((this.angle % tau) / tau) * 4 - 0.2);
    } else {
      this.doJump();
    }
  }

  updatePosition() {
    if (this.slide.isSliding && this.holding) {
      this.slide.isSliding = false;
      this.doJump();
    }
    if (this.jump.isJumping) {
      this.angle =
        this.jump.angleStarted -
        (currentAttempt.tick - this.jump.tickStarted) * 0.124 * (60 / tps);
    } else if (this.fall.isFalling) {
      this.angle =
        this.fall.angleStarted -
        (currentAttempt.tick - this.fall.tickStarted) * 0.124 * (60 / tps);
    }
    if (this.jump.isJumping === true) {
      //this.pos.y += (13.2 - this.airTime) / 1.1;
      let jumpProgress =
        (currentAttempt.tick - this.jump.tickStarted) * (60 / 26 / tps) + 0.05;
      //console.log("jump prog: " + jumpProgress);
      this.pos.y =
        this.jump.heightStarted +
        8 * gridLength * jumpProgress -
        8 * gridLength * jumpProgress * jumpProgress;
      if (this.pos.y <= this.sideLength + currentAttempt.floorY) {
        this.land(currentAttempt.floorY);
      }
    }
    if (this.fall.isFalling === true) {
      let fallProgress =
        (currentAttempt.tick - this.fall.tickStarted) * (60 / 26 / tps) - 0.02;
      this.pos.y =
        this.fall.heightStarted -
        8 * gridLength * fallProgress * fallProgress -
        8 * (gridLength / 5) * fallProgress;
      if (this.pos.y <= this.sideLength + currentAttempt.floorY) {
        this.land(currentAttempt.floorY);
      }
    }
  }

  draw() {
    if (!this.show) {
      return;
    }
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
  }
  drawHitboxes() {
    if (!this.showHitboxes) {
      return;
    }
    c.fillStyle = "forestGreen";
    c.globalAlpha = 0.7;

    c.fillRect(
      this.pos.x,
      canvas.height - this.pos.y,
      currentPlayer.sideLength,
      currentPlayer.sideLength
    );
    c.globalAlpha = 1;
  }

  checkExplosion() {
    if (!this.isExploding) {
      return;
    }
    this.explosion.drawExplosion();
    if (this.explosion.timePassed > 0.7) {
      this.isExploding = false;
    }
  }

  explode() {
    this.show = false;
    this.isExploding = true;
    this.explosion = new explosion({
      timeStarted: Date.now(),
      pos: {
        x: this.pos.x + this.sideLength / 2,
        y: this.pos.y - this.sideLength / 2,
      },
    });
  }
}

class explosion {
  constructor({ timeStarted, pos }) {
    this.timeStarted = timeStarted;
    this.pos = pos;
    this.timePassed;
  }

  drawExplosion() {
    this.timePassed = (Date.now() - this.timeStarted) / 1000;
    //console.log(timePassed);
    c.beginPath();
    //c.arc(this.pos.x, canvas.height - this.pos.y, timePassed, 0, 2 * Math.PI);
    c.arc(
      this.pos.x,
      canvas.height - this.pos.y,
      50 * Math.sin(3 * this.timePassed) + 30,
      0,
      2 * Math.PI
    );
    c.stroke();
  }
}

class background {
  constructor(image) {
    this.image = image;
    this.x = 0;
  }

  updatePosition() {
    //this.pos.x = this.pos.x > -canvas.width ? this.pos.x - currentAttempt.speed : canvas.width;
    // if (this.pos.x - currentAttempt.speed <= -canvas.width) {
    //   console.log(this.pos.x);
    // }
    this.x = ((-currentAttempt.tick * currentAttempt.speed) / 6) % canvas.width;
  }

  draw() {
    c.drawImage(this.image, this.x, 0, canvas.width, canvas.height);
    c.drawImage(
      this.image,
      this.x + canvas.width,
      0,
      canvas.width,
      canvas.height
    );
  }
}

class attempt {
  constructor(obstacles, startingSpeed) {
    this.obstacles = obstacles;
    this.x = 0;
    this.att = 1;
    this.tick = 0;
    this.speedSetting = startingSpeed;
    this.speed = startingSpeed * (60 / tps) * (gridLength / 50);

    this.currentObstacles;

    this.renderedHazards = [];
    this.renderedBlocks = [];

    this.floorY = 168;
  }

  copyObstacles() {
    this.currentObstacles = JSON.parse(JSON.stringify(this.obstacles));
    for (let ob of this.currentObstacles) {
      ob.originalPos.x *= gridLength;
      ob.originalPos.y = ob.originalPos.y * gridLength + currentAttempt.floorY;
      if (ob.size === undefined) {
        ob.size = gridLength;
      }
    }
  }

  renderAll() {
    for (let ob of this.currentObstacles) {
      if (ob.type === "block") {
        this.renderedBlocks.push(new block(ob));
      } else {
        this.renderedHazards.push(new obstacle(ob));
      }
      ob.hasBeenRendered = true;
    }
  }

  renderNextGroup() {
    //console.log("trying to render");
    for (let ob of this.currentObstacles) {
      if (
        ob.hasBeenRendered != true &&
        ///need to fix this i dont want to mutate obstacles
        ob.originalPos.x - this.x < canvas.width + 50 &&
        ob.originalPos.x - this.x > -50
      ) {
        if (ob.type === "block") {
          this.renderedBlocks.push(new block(ob));
        } else {
          this.renderedHazards.push(new obstacle(ob));
        }
        //console.log("rendered a " + ob.type);
        ob.hasBeenRendered = true;
      }
    }
  }

  unrenderAll() {
    while (this.renderedBlocks.length > 0) {
      this.renderedBlocks.shift();
    }
    while (this.renderedHazards.length > 0) {
      this.renderedHazards.shift();
    }
  }

  unrenderNextGroup() {
    if (this.renderedBlocks.length !== 0) {
      while (this.renderedBlocks[0].pos.x < -50) {
        //console.log("unrendering " + this.renderedBlocks[0].type);
        this.renderedBlocks.shift();
        if (this.renderedBlocks.length === 0) {
          break;
        }
      }
    }
    if (this.renderedHazards.length !== 0) {
      while (this.renderedHazards[0].pos.x < -50) {
        //console.log("unrendering " + this.renderedHazards[0].type);
        this.renderedHazards.shift();
        if (this.renderedHazards.length === 0) {
          break;
        }
      }
    }
  }

  checkSliding() {
    currentPlayer.slide.isSliding = false;
    for (let ob of this.renderedBlocks) {
      ob.checkSliding();
    }
  }
}
