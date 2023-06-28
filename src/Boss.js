import Constants from "./Constants";
import Enemy from "./Enemy";
export default class Boss extends Enemy {
  constructor() {
    ("use strict");

    // enemy stats
    this.level = 99;
    this.classList.add("boss");

    this.setMaxHp(9999);
    this.hp = 9999;
    this.atk = 66;
    this.weaponLv = 1;

    const turnTime = Constants.get("turnTime");
    this.style.setProperty("--enemy-move-speed", turnTime + "ms");

    this.classList.add("facing_left");
  }
  signalDeath() {
    GameManager.getInstance().finish();
  }
}
