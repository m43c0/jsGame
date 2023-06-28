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

    const maxHealth = Constants.get("enemyHp")[lv - 1];

    this.setMaxHp(maxHealth);
    this.hp = maxHealth;
    this.weaponLv = 1;
    this.atk = Constants.get("enemyAtk")[lv - 1];

    const turnTime = Constants.get("turnTime");
    this.style.setProperty("--enemy-move-speed", turnTime + "ms");

    // random start direction (visually only, #currentDirection remains untouched)
    if (Math.random() > 0.4) this.classList.add("facing_left");
  }

  signalDeath(killer) {
    killer.addExp(Constants.get("baseEnemyExpDrop") * this.level);
    const minGoldDropped = Constants.get("baseEnemyGoldDrop") * this.level;
    const maxGoldDropped = minGoldDropped * 2;
    const goldDropped = Math.floor(
      Math.random() * (maxGoldDropped - minGoldDropped + 1) + minGoldDropped
    );

    GameManager.getInstance().addGold(goldDropped);
  }
}
