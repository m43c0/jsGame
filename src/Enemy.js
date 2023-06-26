import Constants from "./Constants";
import GameEntity from "./GameEntity";
import GameManager from "./GameManager";
export default class Enemy extends GameEntity {
  level;
  constructor(lv) {
    super();

    // enemy stats
    this.level = lv;
    this.classList.add("lv" + lv);

    this.maxHp = this.level * Constants.get("baseEnemyHp");
    this.hp = this.maxHp;
    this.weaponLv = 1;
    this.atk = Constants.get("baseEnemyAtk") * lv;

    const turnTime = Constants.get("turnTime") * 0.8;
    this.style.setProperty("--enemy-move-speed", turnTime + "ms");

    this.classList.add("facing_left");
  }

  signalDeath(killer) {
    killer.addExp(Constants.get("baseEnemyExpDrop") * this.level);
    GameManager.getInstance().addGold(
      Constants.get("baseEnemyGoldDrop") * this.level
    );
  }
}
