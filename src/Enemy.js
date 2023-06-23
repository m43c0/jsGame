import Constants from "./Constants";
import GameEntity from "./GameEntity";
export default class Enemy extends GameEntity {
  // static #EnemyState = {
  //   SEARCH: "SEARCH",
  //   ATTACK: "ATTACK",
  // };

  level;
  constructor(lv) {
    ("use strict");
    super();

    // enemy stats
    this.level = lv;
    this.classList.add("lv" + lv);

    this.maxHp = this.level * Constants.get("baseEnemyHp");
    this.hp = this.maxHp;
    this.atk = Constants.get("baseEnemyAtk") * lv;

    const turnTime = Constants.get("turnTime") * 0.8;
    this.style.setProperty("--enemy-move-speed", turnTime + "ms");

    this.classList.add("facing_left");
  }
}
