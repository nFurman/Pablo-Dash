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
    let hitbox = { top: 0, bottom: 0, left: 0, right: 0 };
    switch (this.type) {
      case "spike":
        hitbox = { top: 10, bottom: 0, left: 19, right: 19 };
        break;
      case "block":
        hitbox = { top: 30, bottom: 0, left: 7, right: 0 };
    }
    if (
      //checks if the player is too far left or too far right to collide, that way it returns and doesnt need to check the rest
      player.pos.x + player.sideLength <= this.pos.x + hitbox.left ||
      player.pos.x >= this.pos.x + player.sideLength - hitbox.right
    ) {
      return false;
    } else if (
      player.pos.y - player.sideLength < this.pos.y - hitbox.top &&
      player.pos.y > this.pos.y - player.sideLength + hitbox.bottom
    ) {
      return true;
    }
    return false;
  }
}

class block extends obstacle {
  checkSliding() {
    let hitbox = { top: 0, bottom: 0, left: 0, right: 0 };
    switch (this.type) {
      case "block":
        hitbox = { top: 0, bottom: 35, left: 0, right: 0 };
    }
    if (
      //checks if the player is too far left or too far right to collide, that way it returns and doesnt need to check the rest
      player.pos.x + player.sideLength < this.pos.x + hitbox.left ||
      player.pos.x > this.pos.x + player.sideLength - hitbox.right
    ) {
      //   if (player.pos.x + 50 < this.pos.x + hitbox.left) {
      //     console.log("too far left");
      //   }
      //   if (player.pos.x > this.pos.x + 50 - hitbox.right) {
      //     console.log("too far right");
      //   }
      return false;
    } else if (
      player.pos.y - player.sideLength <= this.pos.y - hitbox.top &&
      player.pos.y - player.sideLength >
        this.pos.y - player.sideLength + hitbox.bottom
    ) {
      return true;
    }
    return false;
  }
}
