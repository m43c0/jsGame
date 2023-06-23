import { Direction } from "./Direction";

export default class GameEntity extends HTMLElement {
  #currentDirection = Direction.Down;
  #currentTargetCell = null;
  cell = null;

  level;
  maxHp;
  hp;
  atk;
  isAttacking = false;

  constructor() {
    super();

    this.healthBar = document.createElement("div");
    this.healthBar.classList.add("health_bar");
    this.appendChild(this.healthBar);
  }

  getHit(atkPower) {
    this.hp = Math.max(0, this.hp - atkPower);
    this.healthBar.style.setProperty(
      "--hp-percentage",
      (this.hp * 100) / this.maxHp + "%"
    );
    if (this.hp <= 0) this.die();
  }

  die() {
    this.healthBar.remove();
    this.cell.currentEntity = null;
    this.classList.add("death");
  }

  setDirection(cellToLook) {
    if (cellToLook.y < this.cell.y) this.#currentDirection = Direction.Up;
    else if (cellToLook.x > this.cell.x) {
      this.#currentDirection = Direction.Right;
      if (this.classList.contains("facing_left"))
        this.classList.remove("facing_left");
    } else if (cellToLook.y > this.cell.y)
      this.#currentDirection = Direction.Down;
    else if (cellToLook.x < this.cell.x) {
      this.#currentDirection = Direction.Left;
      if (!this.classList.contains("facing_left"))
        this.classList.add("facing_left");
    }
  }

  getNextCellCoordsInCurrentDirection() {
    return {
      x: this.cell.x + this.#currentDirection.x,
      y: this.cell.y + this.#currentDirection.y,
    };
  }

  isAtTargetCoords() {
    return (
      this.cell.x == this.#currentTargetCell.x &&
      this.cell.y == this.#currentTargetCell.y
    );
  }

  setCurrentTargetCell(targetCell) {
    this.#currentTargetCell = targetCell;
    this.classList.add("walk");
  }
  getCurrentTargetCell() {
    return this.#currentTargetCell;
  }
  resetCurrentTargetCell() {
    this.#currentTargetCell = null;
    this.classList.remove("walk");
  }
  hasTarget() {
    return this.#currentTargetCell != null;
  }
}
