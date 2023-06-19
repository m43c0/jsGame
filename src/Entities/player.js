import { Direction } from "../Direction";
import GameManager from "./gameManager";
import Constants from "../Constants";

export default class Player {
  constructor() {
    "use strict";
    this.currentLevel = 1;
    this.isAttacking = false;
    this.currentDirection = Direction.Down;
    this.playerAvatar = document.createElement("player");
    this.currentPosition = { x: 0, y: 0 };
    this.currentTarget = null;

    // imposto la velocità di transazione del player (la velocità con la quale si muoverà tra le celle)
    // all'80% del tempo di un turno, così alla fine del turno il player sarà sicuramente in una casella, e non a metà tra due
    const turnTime = Constants.get("turnTime") * 0.8;
    this.playerAvatar.style.setProperty("--player-move-speed", turnTime + "ms");
  }

  setPosition(x, y) {
    const cellPosition = GameManager.getInstance().map.getCellPosition(x, y);
    this.playerAvatar.style.left = cellPosition.x + "px";
    this.playerAvatar.style.top = cellPosition.y + "px";
    this.currentPosition.x = x;
    this.currentPosition.y = y;
  }

  setTarget(targetX, targetY) {
    this.currentTarget = { x: targetX, y: targetY };
  }

  update() {}

  turnUpdate() {
    if (!this.isAttacking && this.currentTarget != null) this.#move();
  }

  #move() {
    // imposto direzione
    this.#setDirection();

    // check se mi posso muovere in quella direzione
    const nextCell = {
      x: this.currentPosition.x + this.currentDirection.x,
      y: this.currentPosition.y + this.currentDirection.y,
    };

    if (GameManager.getInstance().canMoveToCell(nextCell.x, nextCell.y)) {
      // si -> mi muovo in quella direzione
      this.setPosition(nextCell.x, nextCell.y);
      if (
        this.currentPosition.x == this.currentTarget.x &&
        this.currentPosition.y == this.currentTarget.y
      ) {
        // arrivato a destinazione
        this.currentTarget = null;
      }
    }
  }

  #setDirection() {
    if (this.currentTarget.y < this.currentPosition.y)
      this.currentDirection = Direction.Up;
    else if (this.currentTarget.x > this.currentPosition.x)
      this.currentDirection = Direction.Right;
    else if (this.currentTarget.y > this.currentPosition.y)
      this.currentDirection = Direction.Down;
    else if (this.currentTarget.x < this.currentPosition.x)
      this.currentDirection = Direction.Left;
  }

  #attack(target) {}
}
