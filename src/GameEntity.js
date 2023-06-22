import { Direction } from "./Direction";

export default class GameEntity extends HTMLElement {
  #currentDirection = Direction.Down;
  #currentTargetCell = null;
  isAttacking = false;
  cell = null;
  constructor() {
    super();
  }

  setDirection() {
    if (this.#currentTargetCell.y < this.cell.y)
      this.#currentDirection = Direction.Up;
    else if (this.#currentTargetCell.x > this.cell.x) {
      this.#currentDirection = Direction.Right;
      this.classList.remove("facing_left");
    } else if (this.#currentTargetCell.y > this.cell.y)
      this.#currentDirection = Direction.Down;
    else if (this.#currentTargetCell.x < this.cell.x) {
      this.#currentDirection = Direction.Left;
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
  resetCurrentTargetCell() {
    this.#currentTargetCell = null;
    this.classList.remove("walk");
  }
  hasTarget() {
    return this.#currentTargetCell != null;
  }
}
