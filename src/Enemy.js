import Constants from "./Constants";
import GameEntity from "./GameEntity";
export default class Enemy extends GameEntity {
  static #EnemyState = {
    SEARCH: "SEARCH",
    ATTACK: "ATTACK",
  };

  level;
  constructor(lv, type) {
    "use strict";
    super();

    // enemy stats
    this.level = lv;
    this.type = type;

    this.currentState = Enemy.#EnemyState.SEARCH;

    this.maxHp = this.level * Constants.get("baseEnemyHp");
    this.hp = this.maxHp;

    this.healthBar = document.createElement("div");
    this.healthBar.classList.add("health_bar");
    this.appendChild(this.healthBar);
  }

  update() {}

  turnUpdate() {
    if (this.hp <= 0) return;

    if (this.currentState == Enemy.#EnemyState.SEARCH) this.#searchState();
    else if (this.currentState == Enemy.#EnemyState.ATTACK) this.#attackState();
  }

  #searchState() {
    // search player
    // if found
    // if player in reach -> change to attack state (and do first attack??)
    // if player out of reach -> set direction and move toward player
    // if player not found -> move left and right
  }
  #attackState() {
    // if player in reach -> attack
    // if player out of reach -> change to follow state
  }

  getHit(atkPower) {
    this.hp = Math.max(0, this.hp - atkPower);
    this.healthBar.style.maxWidth = (this.hp * 100) / this.maxHp + "%";
    if (this.hp <= 0) this.die();
  }

  die() {
    this.healthBar.remove();
    this.cell.currentEntity = null;
    this.classList.add("death");
  }
}
