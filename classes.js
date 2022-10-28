class obstacle {
  constructor({ type, originalPos, rotation }) {
    switch (type) {
      case "spike":
        this.image = spikeImage;
        break;
      case "block":
        this.image = blockImage;
        break;
    }
    this.type = type;
    this.originalPos = originalPos;
    this.pos = { ...originalPos };
    this.rotation = rotation;

    switch (this.type) {
      case "spike":
        this.hitbox = { top: 15, bottom: 0, left: 15, right: 15 };
        break;
      case "block":
        this.hitbox = { top: 30, bottom: 0, left: 7, right: 0 };
        break;
      default:
        this.hitbox = { top: 0, bottom: 0, left: 0, right: 0 };
        break;
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
      player.sideLength,
      player.sideLength
    );
  }

  checkDeath() {
    if (
      //checks if the player is too far left or too far right to collide, that way it returns and doesnt need to check the rest
      player.pos.x + player.sideLength <= this.pos.x + this.hitbox.left ||
      player.pos.x >= this.pos.x + player.sideLength - this.hitbox.right
    ) {
      return false;
    } else if (
      player.pos.y - player.sideLength < this.pos.y - this.hitbox.top &&
      player.pos.y > this.pos.y - player.sideLength + this.hitbox.bottom
    ) {
      return true;
    }
    return false;
  }

  drawHitboxes() {
    c.fillStyle = "red";
    c.globalAlpha = 0.7;
    c.fillRect(
      this.pos.x + this.hitbox.left,
      canvas.height - this.pos.y + this.hitbox.top,
      player.sideLength - this.hitbox.left - this.hitbox.right,
      player.sideLength - this.hitbox.bottom - this.hitbox.top
    );
    c.globalAlpha = 1;
  }
}

class block extends obstacle {
  constructor({ type, originalPos, rotation }) {
    super({ type, originalPos, rotation });
    switch (this.type) {
      case "block":
        this.slideHitbox = { top: 0, bottom: 35, left: 0, right: 0 };
        break;
      default:
        this.slideHitbox = { top: 0, bottom: 0, left: 0, right: 0 };
        break;
    }
  }
  drawHitboxes() {
    super.drawHitboxes();
    c.fillStyle = "blue";
    c.globalAlpha = 0.7;
    c.fillRect(
      this.pos.x + this.slideHitbox.left,
      canvas.height - this.pos.y + this.slideHitbox.top,
      player.sideLength - this.slideHitbox.left - this.slideHitbox.right,
      player.sideLength - this.slideHitbox.bottom - this.slideHitbox.top
    );
    c.globalAlpha = 1;
  }

  checkSliding() {
    if (
      //checks if the player is too far left or too far right to collide, that way it returns and doesnt need to check the rest
      player.pos.x + player.sideLength < this.pos.x + this.slideHitbox.left ||
      player.pos.x > this.pos.x + player.sideLength - this.slideHitbox.right
    ) {
      //   if (player.pos.x + 50 < this.pos.x + this.slideHitbox.left) {
      //     console.log("too far left");
      //   }
      //   if (player.pos.x > this.pos.x + 50 - this.slideHitbox.right) {
      //     console.log("too far right");
      //   }
      return false;
    } else if (
      player.pos.y - player.sideLength <= this.pos.y - this.slideHitbox.top &&
      player.pos.y - player.sideLength >
        this.pos.y - player.sideLength + this.slideHitbox.bottom
    ) {
      return true;
    }
    return false;
  }
}
