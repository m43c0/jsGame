import Enemy from "./Enemy";
import GameManager from "./GameManager";
export default class Boss extends Enemy {
  constructor() {
    super();

    // enemy stats
    this.level = 99;
    this.className = "";

    this.setMaxHp(8000);
    this.hp = 8000;
    this.atk = 120;
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
