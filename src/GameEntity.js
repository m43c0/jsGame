import { Direction } from "./Direction";

export default class GameEntity extends HTMLElement {
  // class used as base class and extended to create custom HTMLElements to display (append) on the map
  // currentX and currentY properties are added to parent class HTMLElement, used as coordinates of the entity on the map

  currentX = 0;
  currentY = 0;
  #currentDirection = Direction.Down;
  #currentTarget = null;
  isAttacking = false;

  constructor() {
    super();
  }

  setDirection() {
    if (this.#currentTarget.y < this.currentY)
      this.#currentDirection = Direction.Up;
    else if (this.#currentTarget.x > this.currentX)
      this.#currentDirection = Direction.Right;
    else if (this.#currentTarget.y > this.currentY)
      this.#currentDirection = Direction.Down;
    else if (this.#currentTarget.x < this.currentX)
      this.#currentDirection = Direction.Left;
  }

  getNextCellCoordsInCurrentDirection() {
    return {
      x: this.currentX + this.#currentDirection.x,
      y: this.currentY + this.#currentDirection.y,
    };
  }

  isAtTargetCoords() {
    return (
      this.currentX == this.#currentTarget.x &&
      this.currentY == this.#currentTarget.y
    );
  }

  setCurrentTarget(xCoords, yCoords) {
    this.#currentTarget = { x: xCoords, y: yCoords };
  }
  resetCurrentTarget() {
    this.#currentTarget = null;
  }
  hasTarget() {
    return this.#currentTarget != null;
  }
}
