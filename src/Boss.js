import Constants from "./Constants";
import Enemy from "./Enemy";
import GameEntity from "./GameEntity";
export default class Boss extends Enemy {
  constructor() {
    super();

    // enemy stats
    this.level = 99;
    this.className = "";

    this.setMaxHp(9999);
    this.hp = 9999;
    this.atk = 66;
    this.weaponLv = 1;

    this.classList.add("facing_left");
  }
  signalDeath() {
    GameManager.getInstance().finish();
  }
}
