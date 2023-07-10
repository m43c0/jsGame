import Constants from "./Constants";
import { Direction } from "./Direction";

export default class GameEntity extends HTMLElement {
  #currentDirection = Direction.Down;
  #currentTargetCell = null;
  cell = null;

  level;
  currentExp;
  #maxHp;
  hp;
  atk;
  weaponLv;
  isAttacking = false;

  constructor() {
    super();

    this.healthBar = document.createElement("div");
    this.healthBar.classList.add("health_bar");
    this.appendChild(this.healthBar);

    this.damageLabel = document.createElement("span");
    this.damageLabel.classList.add("damage_label");
    this.appendChild(this.damageLabel);
    this.damageLabel.style.setProperty(
      "--display-time",
      Constants.get("turnTime") + "ms"
    );
  }

  getHit(attackingEntity) {
    const weaponDamageBonus =
      Constants.get("weaponDamageBonus")[attackingEntity.weaponLv - 1];
    const attackPower = attackingEntity.atk + weaponDamageBonus;
    this.hp = Math.max(0, this.hp - attackPower);

    this.damageLabel.innerHTML = attackPower;
    const turnTime = Constants.get("turnTime");
    this.damageLabel.classList.add("active");
    setTimeout(() => {
      this.damageLabel.classList.remove("active");
    }, turnTime);

    this.updateHealthBar();
    if (this.hp <= 0) this.die(attackingEntity);
  }

  updateHealthBar() {
    this.healthBar.style.setProperty(
      "--hp-percentage",
      (this.hp * 100) / this.#maxHp + "%"
    );
  }

  getMaxHp() {
    return this.#maxHp;
  }

  setMaxHp(max_hp) {
    this.#maxHp = max_hp;
  }

  die(killer) {
    this.healthBar.remove();
    this.cell.setCurrentEntity(null);
    this.classList.add("death");
    this.signalDeath(killer);
  }
  signalDeath(killer) {}

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
  getCurrentDirection() {
    return this.#currentDirection;
  }

  getNextCellCoordsInCurrentDirection() {
    return {
      x: this.cell.x + this.#currentDirection.x,
      y: this.cell.y + this.#currentDirection.y,
    };
  }

  getNextCellCoordsInDirection(direction) {
    return {
      x: this.cell.x + direction.x,
      y: this.cell.y + direction.y,
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
