import Constants from "./Constants";
import GameEntity from "./GameEntity";
import GameManager from "./GameManager";

// class used by GameMap to manage enemies
export default class Enemy extends GameEntity {
  constructor(lv) {
    super();

    // enemy stats and appearance are based on its level;
    // the higher the level, the stronger the enemy;
    // currently there are 4 types of enemyes.
    this.level = lv;
    this.classList.add("lv" + lv);

    const maxHealth = Constants.get("enemyHp")[lv - 1];

    this.setMaxHp(maxHealth);
    this.hp = maxHealth;
    this.weaponLv = 1;
    this.atk = Constants.get("enemyAtk")[lv - 1];

    // set css variable used as transition time for left and top properties
    // the entity will take the duration of one turn to move on the map from one cell to another
    const turnTime = Constants.get("turnTime");
    this.style.setProperty("--enemy-move-speed", turnTime + "ms");

    // random start direction (visually only, #currentDirection remains untouched)
    if (Math.random() > 0.4) this.classList.add("facing_left");
  }

  // when an enemy is defeated, its killer (the player) will be rewarded with exp and gold
  signalDeath(killer) {
    killer.addExp(
      Constants.get("baseEnemyExpDrop") * Math.floor(Math.pow(this.level, 2.4))
    );
    const minGoldDropped = Constants.get("baseEnemyGoldDrop") * this.level;
    const maxGoldDropped = minGoldDropped * 2;
    const goldDropped = Math.floor(
      Math.random() * (maxGoldDropped - minGoldDropped + 1) + minGoldDropped
    );

    GameManager.getInstance().addGold(goldDropped);
  }
}
