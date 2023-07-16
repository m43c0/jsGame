import Constants from "./Constants";
import { Direction } from "./Direction";

// base class used to represent entities moving and interactiong on map (player and enemies)
// it extends the HTMLElement, defining a custom HTML element that can be inserted into the DOM and has
// custom data and functionalities.
// Custom properties (class fileds) such as target and direction are used to manage its movementts in the map;
// other fileds represent battle stats (hp, lv, atk and so on...)
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

    // append elements used as UI components
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

  // calculates the damage suffered after a received hit and the consequences of the damage
  getHit(attackingEntity) {
    const weaponDamageBonus =
      Constants.get("weaponDamageBonus")[attackingEntity.weaponLv - 1];
    const attackPower = attackingEntity.atk + weaponDamageBonus;
    this.hp = Math.max(0, this.hp - attackPower);

    // activate the damageLabel UI elemnt for the time of a turn
    this.damageLabel.innerHTML = attackPower;
    const turnTime = Constants.get("turnTime");
    this.damageLabel.classList.add("active");
    setTimeout(() => {
      this.damageLabel.classList.remove("active");
    }, turnTime);

    this.updateHealthBar();

    // if no more hp -> die
    if (this.hp <= 0) this.die(attackingEntity);
  }

  // update healthBar fill amount
  updateHealthBar() {
    this.healthBar.style.setProperty(
      "--hp-percentage",
      (this.hp * 100) / this.#maxHp + "%"
    );
  }

  // #maxHp access is restricted to this class (and its subclasses)
  // so we need #maxHp getter and setter
  getMaxHp() {
    return this.#maxHp;
  }
  setMaxHp(max_hp) {
    this.#maxHp = max_hp;
  }

  // removes this entity from the cell it is occupying(reset it currentEntity to null)
  // and calls the signalDeath 'abstact' method to notify of its death
  // does not set a specific status of 'DEATH' as other game components always check
  // that the entity is alive (hp > 0) before interacting with it
  die(killer) {
    this.healthBar.remove();
    this.cell.setCurrentEntity(null);
    this.classList.add("death");
    this.signalDeath(killer);
  }

  // 'abstract' method which will be implemented by subclasses to perform certain actions upon the entity's death
  signalDeath(killer) {}

  // sets the direction of the entity and the css class to flip its avatar to the left or to the right (there are no up and down sprites)
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

  // get x and y coords of the next cell in the current direction
  getNextCellCoordsInCurrentDirection() {
    return {
      x: this.cell.x + this.#currentDirection.x,
      y: this.cell.y + this.#currentDirection.y,
    };
  }

  // get x and y coords of the next cell in given direction
  getNextCellCoordsInDirection(direction) {
    return {
      x: this.cell.x + direction.x,
      y: this.cell.y + direction.y,
    };
  }

  // checks if entity is at #currentTargetCell coordinates
  isAtTargetCoords() {
    return (
      this.cell.x == this.#currentTargetCell.x &&
      this.cell.y == this.#currentTargetCell.y
    );
  }

  // set current target cell on map
  // and add css class .walk to change entity sprite background
  setCurrentTargetCell(targetCell) {
    this.#currentTargetCell = targetCell;
    this.classList.add("walk");
  }

  getCurrentTargetCell() {
    return this.#currentTargetCell;
  }

  // when current target is reset, player stops moving (remove css class .walk)
  resetCurrentTargetCell() {
    this.#currentTargetCell = null;
    this.classList.remove("walk");
  }

  hasTarget() {
    return this.#currentTargetCell != null;
  }
}
