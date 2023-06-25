import Constants from "./Constants";
import Enemy from "./Enemy";
export default class Boss extends Enemy {
  constructor() {
    ("use strict");

    // enemy stats
    this.level = 99;
    this.classList.add("boss");

    this.maxHp = 9999;
    this.hp = this.maxHp;
    this.atk = 100;

    const turnTime = Constants.get("turnTime") * 0.8;
    this.style.setProperty("--enemy-move-speed", turnTime + "ms");

    this.classList.add("facing_left");
  }
  signalDeath() {
    GameManager.getInstance().finish();
  }
}
