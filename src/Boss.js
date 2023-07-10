import Enemy from "./Enemy";
import GameManager from "./GameManager";
export default class Boss extends Enemy {
  constructor() {
    super();

    // enemy stats
    this.level = 99;
    this.className = "";

    this.setMaxHp(6200);
    this.hp = 6200;
    this.atk = 90;
    this.weaponLv = 1;

    this.classList.add("facing_left");
  }
  signalDeath() {
    GameManager.getInstance().stopMainUpdate();
    setTimeout(() => {
      GameManager.getInstance().finish();
    }, 2000);
  }
}
