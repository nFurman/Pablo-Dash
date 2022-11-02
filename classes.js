class Obj {
  constructor({ type, originalPos, rotation, size = 1 }) {
    this.image = objs[type].image;
    this.size = gridLength * size;
    this.height = this.size * objs[type].height;
    this.width = this.size * objs[type].width;
    this.type = type;
    this.originalPos = originalPos;
    this.pos = { ...originalPos };
    this.rotation = rotation;
    this.hitboxesShown = false;
  }

  updatePosition() {
    //this.pos.x = this.pos.x - currentAttempt.speed;
    this.pos.x = this.originalPos.x - currentAttempt.distanceMoved;
    //console.log(currentAttempt.speed);
  }

  draw() {
    c.drawImage(
      this.image,
      this.pos.x,
      canvas.height - this.pos.y - currentGround.y,
      this.width,
      this.height
    );
  }
}

class Obstacle extends Obj {
  constructor({ type, originalPos, rotation }) {
    super({ type, originalPos, rotation });

    this.hitbox = JSON.parse(JSON.stringify(objs[type].hitbox));
    this.hitbox.left *= this.width / 100;
    this.hitbox.right *= this.width / 100;
    this.hitbox.top *= this.height / 100;
    this.hitbox.bottom *= this.height / 100;
  }

  checkDeath() {
    if (
      checkCollision(
        {
          x: currentPlayer.pos.x + currentPlayer.hitbox.left,
          y: currentPlayer.pos.y - currentPlayer.hitbox.top,
          width:
            currentPlayer.sideLength -
            currentPlayer.hitbox.left -
            currentPlayer.hitbox.right,
          height:
            currentPlayer.sideLength -
            currentPlayer.hitbox.bottom -
            currentPlayer.hitbox.top,
        },
        {
          x: this.pos.x + this.hitbox.left,
          y: this.pos.y - this.hitbox.top,
          width: this.width - this.hitbox.left - this.hitbox.right,
          height: this.width - this.hitbox.bottom - this.hitbox.top,
        }
      )
    ) {
      return true;
    } else {
      return false;
    }
  }

  drawHitboxes() {
    if (!this.hitboxesShown) {
      return;
    }
    drawHitbox({
      color: "red",
      opacity: 0.7,
      x: this.pos.x + this.hitbox.left,
      y: this.pos.y + currentGround.y - this.hitbox.top,
      width: this.width - this.hitbox.left - this.hitbox.right,
      height: this.height - this.hitbox.top - this.hitbox.bottom,
    });
  }
}

class Hazard extends Obstacle {
  constructor({ type, originalPos, rotation }) {
    //console.log("makin a " + type);
    super({ type, originalPos, rotation });
  }
}

class Block extends Obstacle {
  constructor({ type, originalPos, rotation }) {
    super({ type, originalPos, rotation });
    this.slideHitbox = JSON.parse(JSON.stringify(objs[type].slideHitbox));

    this.slideHitbox.left *= this.width / 100;
    this.slideHitbox.right *= this.width / 100;
    this.slideHitbox.top *= this.height / 100;
    this.slideHitbox.bottom *= this.height / 100;
  }

  drawHitboxes() {
    if (!this.hitboxesShown) {
      return;
    }
    super.drawHitboxes();

    drawHitbox({
      color: "blue",
      opacity: 0.7,
      x: this.pos.x + this.slideHitbox.left,
      y: this.pos.y - this.slideHitbox.top + currentGround.y,
      width: this.width - this.slideHitbox.left - this.slideHitbox.right,
      height: this.height - this.slideHitbox.bottom - this.slideHitbox.top,
    });
  }

  checkDeath() {
    if (
      checkCollision(
        {
          x: currentPlayer.pos.x + currentPlayer.hitboxForBlocks.left,
          y: currentPlayer.pos.y - currentPlayer.hitboxForBlocks.top,
          width:
            currentPlayer.sideLength -
            currentPlayer.hitboxForBlocks.left -
            currentPlayer.hitboxForBlocks.right,
          height:
            currentPlayer.sideLength -
            currentPlayer.hitboxForBlocks.bottom -
            currentPlayer.hitboxForBlocks.top,
        },
        {
          x: this.pos.x + this.hitbox.left,
          y: this.pos.y - this.hitbox.top,
          width: this.width - this.hitbox.left - this.hitbox.right,
          height: this.height - this.hitbox.bottom - this.hitbox.top,
        }
      )
    ) {
      //console.log(currentPlayer.pos.y - currentPlayer.hitbox.top);

      // for (let i = 0.0; i < 200.0; i++) {
      //   console.log(i + 0.3 - 0.2 - 0.1);
      // }
      //console.log(0.0 + 0.3 - 0.2 - 0.1);

      //console.log(a - b - c + d + e);
      return true;
    } else {
      return false;
    }
  }
  checkSliding() {
    if (
      checkCollision(
        {
          x: currentPlayer.pos.x + currentPlayer.hitbox.left,
          y: currentPlayer.pos.y - currentPlayer.hitbox.top,
          width:
            currentPlayer.sideLength -
            currentPlayer.hitbox.left -
            currentPlayer.hitbox.right,
          height:
            currentPlayer.sideLength -
            currentPlayer.hitbox.bottom -
            currentPlayer.hitbox.top,
        },
        {
          x: this.pos.x + this.slideHitbox.left,
          y: this.pos.y - this.slideHitbox.top,
          width: this.width - this.slideHitbox.left - this.slideHitbox.right,
          height: this.height - this.slideHitbox.bottom - this.slideHitbox.top,
        }
      )
    ) {
      currentPlayer.slide = {
        isSliding: true,
        height: this.pos.y,
      };
      return;
    }
  }
}

class Player {
  constructor(cubeImage, waveImage, gamemode) {
    this.cubeImage = cubeImage;
    this.waveImage = waveImage;
    this.changeGamemode(gamemode);
    this.sideLength = 73;
    this.pos = {
      y: this.sideLength,
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
    this.renderedWaveTrails = [];
    this.wavePulse = 0.1;
    this.isExploding = false;
    this.explosion = {};
    this.holding = false;
    this.show = true;
    this.hitboxesShown = false;
  }

  reset() {
    //this.changeGamemode("cube");
    this.pos = {
      y: this.sideLength,
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
    this.renderedWaveTrails = [];
    this.isExploding = false;
    this.explosion = {};
    this.show = true;
    this.hitboxesShown = false;
  }

  changeGamemode(gamemode) {
    this.gamemode = gamemode;
    switch (this.gamemode) {
      case "cube":
        this.image = this.cubeImage;
        this.hitbox = {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        };
        this.hitboxForBlocks = {
          left: 0,
          right: 0,
          top: 20,
          bottom: 20,
        };
        break;
      case "wave":
        this.image = this.waveImage;
        this.hitbox = {
          left: 0,
          right: 25,
          top: 20,
          bottom: 20,
        };
        break;
    }
  }

  doFall() {
    console.log("fallin");
    if (this.gamemode === "wave" && this.jump.isJumping) {
      this.renderedWaveTrails.push({
        startDistanceMoved: this.jump.tickStarted * currentAttempt.speed,
        startHeight: this.jump.heightStarted,
        angle: Math.PI / 4,
        endDistanceMoved: currentAttempt.distanceMoved,
      });
    }
    this.slide.isSliding = false;
    this.jump.isJumping = false;
    this.fall = {
      isFalling: true,
      tickStarted: currentAttempt.tick,
      heightStarted: this.pos.y,
      angleStarted: this.angle,
    };
  }

  doJump() {
    //console.log("jumpin");
    if (this.gamemode === "wave") {
      if (this.fall.isFalling) {
        this.renderedWaveTrails.push({
          startDistanceMoved: this.fall.tickStarted * currentAttempt.speed,
          startHeight: this.fall.heightStarted,
          angle: -Math.PI / 4,
          endDistanceMoved: currentAttempt.distanceMoved,
        });
      }
      if (this.slide.isSliding) {
        this.renderedWaveTrails.push({
          startDistanceMoved: this.slide.tickStarted * currentAttempt.speed,
          startHeight: this.slide.height + this.sideLength - this.hitbox.bottom,
          angle: 0,
          endDistanceMoved: currentAttempt.distanceMoved,
        });
      }
    }
    this.slide.isSliding = false;
    this.fall.isFalling = false;
    this.jump = {
      isJumping: true,
      tickStarted: currentAttempt.tick,
      heightStarted: this.pos.y,
      angleStarted: this.angle,
    };
  }

  land(y) {
    console.log("landed");
    switch (this.gamemode) {
      case "cube":
        this.cubeLand(y);
        break;
      case "wave":
        this.waveLand(y);
        break;
    }
  }

  cubeLand(y) {
    this.pos.y = this.sideLength - this.hitbox.bottom + y;
    if (this.pos.y < this.sideLength) {
      this.pos.y = this.sideLength;
    }
    this.fall.isFalling = false;
    if (!this.holding) {
      this.jump.isJumping = false;
      this.slide = {
        isSliding: true,
        height: y,
      };
      this.angle =
        0.5 * Math.PI * Math.round(((this.angle % tau) / tau) * 4 - 0.2);
    } else {
      this.doJump();
    }
  }

  waveLand(y) {
    //console.log("wavelandin");

    if (this.fall.isFalling) {
      this.renderedWaveTrails.push({
        startDistanceMoved: this.fall.tickStarted * currentAttempt.speed,
        startHeight: this.fall.heightStarted,
        angle: -Math.PI / 4,
        endDistanceMoved: currentAttempt.distanceMoved,
      });
    }
    this.pos.y = this.sideLength - this.hitbox.bottom + y;
    if (this.pos.y < this.sideLength - this.hitbox.bottom) {
      this.pos.y = this.sideLength - this.hitbox.bottom;
    }
    this.fall.isFalling = false;
    if (!this.holding) {
      this.jump.isJumping = false;
      this.slide = {
        isSliding: true,
        height: y,
        tickStarted: currentAttempt.tick,
      };
      this.angle = 0;
    } else {
      this.doJump();
    }
  }

  updatePosition() {
    switch (this.gamemode) {
      case "cube":
        if (this.slide.isSliding && this.holding) {
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
        if (this.jump.isJumping) {
          //this.pos.y += (13.2 - this.airTime) / 1.1;
          let jumpProgress =
            (currentAttempt.tick + 1 - this.jump.tickStarted) * (60 / 26 / tps);
          if (jumpProgress < 1.1) {
            this.pos.y =
              this.jump.heightStarted +
              8 * gridLength * jumpProgress -
              8 * gridLength * jumpProgress * jumpProgress;
          } else {
            this.pos.y =
              this.jump.heightStarted +
              gridLength * (-9.6 * jumpProgress + 9.5);
          }
          if (this.pos.y <= this.sideLength) {
            this.land(0);
          }
        }
        if (this.fall.isFalling) {
          let fallProgress =
            (currentAttempt.tick + 1 - this.fall.tickStarted) * (60 / 26 / tps);
          if (fallProgress < 0.6) {
            this.pos.y =
              this.fall.heightStarted -
              8 * gridLength * fallProgress * fallProgress;
          } else {
            this.pos.y =
              this.fall.heightStarted +
              gridLength * (-9.6 * fallProgress + 2.86);
          }
          if (this.pos.y <= this.sideLength) {
            this.land(0);
          }
        }
        break;
      case "wave":
        if (!this.jump.isJumping && this.holding) {
          this.doJump();
        }
        if (!this.fall.isFalling && !this.holding && !this.slide.isSliding) {
          this.doFall();
        }
        if (this.jump.isJumping) {
          if (this.angle >= Math.PI / 4 - 0.01) {
            this.angle = Math.PI / 4;
          } else {
            // this.angle =
            //   this.jump.angleStarted +
            //   (currentAttempt.tick - this.jump.tickStarted) *
            //     0.2 *
            //     (60 / tps)
            this.angle += (Math.PI / 4 - this.angle) / 2;
            if (this.angle >= Math.PI / 4 - 0.01) {
              this.angle = Math.PI / 4;
            }
          }
        } else if (this.fall.isFalling) {
          if (this.angle <= -Math.PI / 4 + 0.01) {
            this.angle = -Math.PI / 4;
          } else {
            this.angle += (-Math.PI / 4 - this.angle) / 2;
            if (this.angle <= -Math.PI / 4 + 0.01) {
              this.angle = -Math.PI / 4;
            }
          }
        }
        if (this.jump.isJumping) {
          let ticksPassed = currentAttempt.tick + 1 - this.jump.tickStarted; //* (60 / 26 / tps);
          this.pos.y =
            this.jump.heightStarted + ticksPassed * currentAttempt.speed;
        }
        if (this.fall.isFalling) {
          let ticksPassed = currentAttempt.tick + 1 - this.fall.tickStarted; //* (60 / 26 / tps);
          this.pos.y =
            this.fall.heightStarted - ticksPassed * currentAttempt.speed;

          if (this.pos.y < this.sideLength - this.hitbox.bottom) {
            this.land(0);
          }
        }
        break;
    }
  }

  checkDeath() {
    for (let ob of currentAttempt.renderedHazards) {
      if (ob.checkDeath()) {
        death();
      }
    }

    for (let ob of currentAttempt.renderedBlocks) {
      if (ob.checkDeath()) {
        death();
      }
    }
  }

  updateStatus() {
    if (this.pos.y <= this.sideLength - this.hitbox.bottom) {
      if (!this.slide.isSliding) {
        this.land(0);
      }
    } else {
      let wasSliding = false;
      if (this.slide.isSliding) {
        wasSliding = true;
      }

      currentAttempt.checkSliding();

      if (wasSliding && !this.slide.isSliding) {
        this.doFall();
      } else if (!wasSliding && this.slide.isSliding) {
        this.land(this.slide.height);
      }
    }
  }
  unrenderNextWaveTrails() {
    for (let i = this.renderedWaveTrails.length - 1; i >= 0; i--) {
      if (
        this.renderedWaveTrails[i].endDistanceMoved <
        currentAttempt.distanceMoved - currentPlayer.pos.x - 100
      ) {
        this.renderedWaveTrails.splice(i, 1);
      }
    }
  }
  drawWaveAndTrails() {}

  drawWaveTrail(x, y, width, length, angle) {
    c.fillStyle = "#000";
    c.translate(x, y);
    c.rotate(-angle);
    c.fillRect(0, -width / 2, length, width);
    c.rotate(angle);
    c.translate(-x, -y);
  }

  draw() {
    if (!this.show) {
      return;
    }

    if (this.gamemode === "wave") {
      c.fillStyle = "#FFF";
      for (let trail of this.renderedWaveTrails) {
        let translateX =
          this.pos.x -
          currentAttempt.distanceMoved +
          trail.startDistanceMoved -
          0.5 * this.hitbox.left +
          0.5 * (this.sideLength - this.hitbox.right);
        let translateY =
          canvas.height -
          trail.startHeight -
          currentGround.y -
          Math.tan(trail.angle) * currentAttempt.speed +
          this.sideLength / 2;
        let length =
          (trail.endDistanceMoved - trail.startDistanceMoved) /
          Math.cos(trail.angle);
        c.translate(translateX, translateY);
        c.rotate(-trail.angle);
        c.fillRect(
          -0.5 * this.hitbox.left - 0.5 * (this.sideLength - this.hitbox.right),
          -(gridLength * this.wavePulse) / 2,
          length,
          gridLength * this.wavePulse
        );
        c.rotate(trail.angle);
        c.translate(-translateX, -translateY);
        /*
        this.drawWaveTrail(
          this.pos.x -
            currentAttempt.distanceMoved +
            trail.startDistanceMoved -
            currentAttempt.speed,
          canvas.height -
            trail.startHeight -
            currentGround.y +
            this.sideLength / 2,
          this.wavePulse * gridLength,
          (trail.endDistanceMoved -
            trail.startDistanceMoved +
            currentAttempt.speed) /
            Math.cos(trail.angle),
          trail.angle
        );
        */
      }
      c.fillStyle = "#FFF";
      if (this.jump.isJumping) {
        let translateX =
          this.pos.x -
          currentAttempt.distanceMoved +
          this.jump.tickStarted * currentAttempt.speed +
          0.5 * this.hitbox.left +
          0.5 * (this.sideLength - this.hitbox.right);
        let translateY =
          canvas.height -
          currentGround.y -
          this.jump.heightStarted -
          Math.tan(Math.PI / 4) * currentAttempt.speed +
          this.sideLength / 2;
        let length =
          (currentAttempt.distanceMoved -
            this.jump.tickStarted * currentAttempt.speed) *
            Math.sqrt(2) +
          this.sideLength / 2;
        c.translate(translateX, translateY);
        c.rotate(-Math.PI / 4);
        c.fillRect(
          -0.5 * this.hitbox.left - 0.5 * (this.sideLength - this.hitbox.right),
          -(gridLength * this.wavePulse) / 2,
          length,
          gridLength * this.wavePulse
        );
        c.rotate(Math.PI / 4);
        c.translate(-translateX, -translateY);
      }

      if (this.fall.isFalling) {
        let translateX =
          this.pos.x -
          currentAttempt.distanceMoved +
          this.fall.tickStarted * currentAttempt.speed +
          0.5 * this.hitbox.left +
          0.5 * (this.sideLength - this.hitbox.right);
        let translateY =
          canvas.height -
          currentGround.y -
          this.fall.heightStarted -
          +Math.tan(-Math.PI / 4) * currentAttempt.speed +
          this.sideLength / 2;
        let length =
          (currentAttempt.distanceMoved -
            this.fall.tickStarted * currentAttempt.speed) *
            Math.sqrt(2) +
          this.sideLength / 2;
        c.translate(translateX, translateY);
        c.rotate(Math.PI / 4);
        c.fillRect(
          -0.5 * this.hitbox.left - 0.5 * (this.sideLength - this.hitbox.right),
          -(gridLength * this.wavePulse) / 2,
          length,
          gridLength * this.wavePulse
        );
        c.rotate(-Math.PI / 4);
        c.translate(-translateX, -translateY);
        //console.log(this.fall.heightStarted);
      }
      if (this.slide.isSliding) {
        c.fillRect(
          this.pos.x -
            currentAttempt.distanceMoved +
            this.slide.tickStarted * currentAttempt.speed,
          canvas.height -
            currentGround.y -
            this.slide.height +
            this.hitbox.bottom -
            this.sideLength / 2 -
            (gridLength * this.wavePulse) / 2,
          currentAttempt.distanceMoved -
            this.slide.tickStarted * currentAttempt.speed,
          //+this.sideLength / 2,
          gridLength * this.wavePulse
        );
      }

      //the wave icon needs to rotate differently than the cube icon
      if (this.angle === 0) {
        c.drawImage(
          this.image,
          this.pos.x,
          canvas.height - this.pos.y - currentGround.y,
          this.sideLength,
          this.sideLength
        );
      } else {
        let translateX =
          this.pos.x +
          0.5 * this.hitbox.left +
          0.5 * (this.sideLength - this.hitbox.right);
        let translateY =
          canvas.height - this.pos.y - currentGround.y + this.sideLength / 2;
        c.translate(translateX, translateY);
        c.rotate(-this.angle);
        c.drawImage(
          this.image,
          -0.5 * this.hitbox.left - 0.5 * (this.sideLength - this.hitbox.right),
          -this.sideLength / 2,
          this.sideLength,
          this.sideLength
        );
        c.rotate(this.angle);
        c.translate(-translateX, -translateY);
      }
      return;
    }
    if (this.angle === 0) {
      c.drawImage(
        this.image,
        this.pos.x,
        canvas.height - this.pos.y - currentGround.y,
        this.sideLength,
        this.sideLength
      );
    } else {
      let translateX = this.pos.x + this.sideLength / 2;
      let translateY =
        canvas.height - this.pos.y - currentGround.y + this.sideLength / 2;
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
    if (!this.hitboxesShown) {
      return;
    }

    drawHitbox({
      color: "forestGreen",
      opacity: 0.7,
      x: this.pos.x + this.hitbox.left,
      y: this.pos.y + currentGround.y - this.hitbox.top,
      width: this.sideLength - this.hitbox.left - this.hitbox.right,
      height: this.sideLength - this.hitbox.top - this.hitbox.bottom,
    });

    if (this.gamemode === "cube") {
      drawHitbox({
        color: "blue",
        opacity: 0.9,
        x: this.pos.x + this.hitboxForBlocks.left,
        y: this.pos.y + currentGround.y - this.hitboxForBlocks.top,
        width:
          this.sideLength -
          this.hitboxForBlocks.left -
          this.hitboxForBlocks.right,
        height:
          this.sideLength -
          this.hitboxForBlocks.top -
          this.hitboxForBlocks.bottom,
      });
    }
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
    this.explosion = new Explosion({
      timeStarted: Date.now(),
      pos: {
        x: this.pos.x + this.sideLength / 2,
        y: this.pos.y - this.sideLength / 2,
      },
    });
  }
}

class Explosion {
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
      canvas.height - this.pos.y - currentGround.y,
      50 * Math.sin(3 * this.timePassed) + 30,
      0,
      2 * Math.PI
    );
    c.stroke();
  }
}

class Portal extends Obj {
  constructor({ type, originalPos, rotation }) {
    super({ type, originalPos, rotation });
    this.portalHitbox = JSON.parse(JSON.stringify(objs[type].portalHitbox));
  }

  drawHitboxes() {
    if (!this.hitboxesShown) {
      return;
    }
    drawHitbox({
      color: "green",
      opacity: 0.7,
      x: this.pos.x + this.portalHitbox.left,
      y: this.pos.y + currentGround.y - this.portalHitbox.top,
      width: this.width - this.portalHitbox.left - this.portalHitbox.right,
      height: this.height - this.portalHitbox.top - this.portalHitbox.bottom,
    });
  }
}

class Background {
  constructor(image) {
    this.image = image;
    this.distanceMoved = 0;
  }

  updatePosition() {
    //this.pos.x = this.pos.x > -canvas.width ? this.pos.x - currentAttempt.speed : canvas.width;
    // if (this.pos.x - currentAttempt.speed <= -canvas.width) {
    //   console.log(this.pos.x);
    // }
    this.distanceMoved =
      ((-currentAttempt.tick * currentAttempt.speed) / 6) % canvas.width;
  }

  draw() {
    c.drawImage(
      this.image,
      this.distanceMoved,
      -currentGround.y,
      canvas.width,
      canvas.height
    );
    c.drawImage(
      this.image,
      this.distanceMoved + canvas.width,
      -currentGround.y,
      canvas.width,
      canvas.height
    );
    c.drawImage(
      this.image,
      this.distanceMoved,
      -currentGround.y - canvas.height,
      canvas.width,
      canvas.height
    );
    c.drawImage(
      this.image,
      this.distanceMoved + canvas.width,
      -currentGround.y - canvas.height,
      canvas.width,
      canvas.height
    );
  }
}

class Ground {
  constructor(image) {
    this.image = image;
    this.distanceMoved = 0;
    this.y = 174;
  }

  updatePosition() {
    //this.pos.x = this.pos.x > -canvas.width ? this.pos.x - currentAttempt.speed : canvas.width;
    // if (this.pos.x - currentAttempt.speed <= -canvas.width) {
    //   console.log(this.pos.x);
    // }
    this.distanceMoved = (-currentAttempt.tick * currentAttempt.speed) % 1744;
    if (currentPlayer.pos.y + this.y > canvas.height - 150) {
      this.y = -currentPlayer.pos.y + canvas.height - 150;
    } else if (
      currentPlayer.pos.y + this.y <
      174 + currentPlayer.sideLength - currentPlayer.hitbox.bottom
    ) {
      this.y =
        -currentPlayer.pos.y +
        currentPlayer.sideLength +
        174 -
        currentPlayer.hitbox.bottom;
    }
  }

  draw() {
    for (let i = 0; i < 8; i++) {
      c.drawImage(
        this.image,
        843,
        0,
        436,
        300,
        this.distanceMoved + i * 436,
        canvas.height - this.y,
        436,
        300
      );
    }
  }
}

class Attempt {
  constructor(levelObjs, startingSpeed) {
    this.levelObjs = levelObjs;
    this.distanceMoved = 0;
    this.att = 1;
    this.tick = 0;
    this.speedSetting = startingSpeed;
    this.speed = startingSpeed * (60 / tps) * (gridLength / 50);

    this.currentObjs;

    this.renderedHazards = [];
    this.renderedBlocks = [];
    this.renderedPortals = [];

    this.objHitboxesShown = false;
  }

  copyObjs() {
    this.currentObjs = JSON.parse(JSON.stringify(this.levelObjs));
    for (let ob of this.currentObjs) {
      ob.originalPos.x = ob.originalPos.x * gridLength + currentPlayer.pos.x;
      ob.originalPos.y = ob.originalPos.y * gridLength;
    }
  }

  renderAll() {
    for (let ob of this.currentObjs) {
      switch (objs[ob.type].objType) {
        case "block":
          this.renderedBlocks.push(new Block(ob));
          break;
        case "hazard":
          this.renderedHazards.push(new Hazard(ob));
          break;
        case "portal":
          this.renderedPortals.push(new Portal(ob));
          break;
      }
      ob.hasBeenRendered = true;
    }
  }

  renderNextGroup() {
    //console.log("trying to render");
    for (let ob of this.currentObjs) {
      if (
        ob.hasBeenRendered != true &&
        ///need to fix this i dont want to mutate objs
        ob.originalPos.x - this.distanceMoved <
          canvas.width + currentAttempt.speed * 60 + 300 &&
        ob.originalPos.x - this.distanceMoved > -300 - currentAttempt.speed * 60
      ) {
        switch (objs[ob.type].objType) {
          case "block":
            this.renderedBlocks.push(new Block(ob));
            break;
          case "hazard":
            this.renderedHazards.push(new Hazard(ob));
            break;
          case "portal":
            this.renderedPortals.push(new Portal(ob));
            break;
        }
        ob.hasBeenRendered = true;
        console.log("rendered a " + ob.type);
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
    while (this.renderedPortals.length > 0) {
      this.renderedPortals.shift();
    }
  }

  unrenderNextGroup() {
    if (this.renderedBlocks.length !== 0) {
      while (this.renderedBlocks[0].pos.x < -100) {
        console.log("unrendering " + this.renderedBlocks[0].type);
        this.renderedBlocks.shift();
        if (this.renderedBlocks.length === 0) {
          break;
        }
      }
    }
    if (this.renderedHazards.length !== 0) {
      while (this.renderedHazards[0].pos.x < -100) {
        console.log("unrendering " + this.renderedHazards[0].type);
        this.renderedHazards.shift();
        if (this.renderedHazards.length === 0) {
          break;
        }
      }
    }
    if (this.renderedPortals.length !== 0) {
      while (this.renderedPortals[0].pos.x < -100) {
        console.log("unrendering " + this.renderedPortals[0].type);
        this.renderedPortals.shift();
        if (this.renderedPortalss.length === 0) {
          break;
        }
      }
    }
  }

  checkSliding() {
    currentPlayer.slide.isSliding = false;
    if (currentPlayer.jump.isJumping) {
      if (
        (currentAttempt.tick + 1 - currentPlayer.jump.tickStarted) *
          (60 / 26 / tps) <
        0.5
      ) {
        return;
      }
    }
    for (let ob of this.renderedBlocks) {
      ob.checkSliding();
    }
  }

  showObjHitboxes() {
    for (let ob of this.renderedBlocks) {
      ob.hitboxesShown = true;
    }
    for (let ob of this.renderedHazards) {
      ob.hitboxesShown = true;
    }
    for (let ob of this.renderedPortals) {
      ob.hitboxesShown = true;
    }
  }
}
