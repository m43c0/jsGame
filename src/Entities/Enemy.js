import Constants from "../Constants";
import GameEntity from "../GameEntity";
export default class Enemy extends GameEntity {
  static #EnemyState = {
    SEARCH: "SEARCH",
    ATTACK: "ATTACK",
  };

  level;
  constructor(lv, type) {
    "use";
    super();

    // enemy stats
    this.level = lv;
    this.type = type;

    this.currentState = Enemy.#EnemyState.SEARCH;

    this.hp = this.level * Constants.get("baseEnemyHp");
  }

  update() {}

  turnUpdate() {
    if (this.currentState == Enemy.#EnemyState.SEARCH) this.#searchState();
    else if (this.currentState == Enemy.#EnemyState.ATTACK) this.#attackState();
  }

  #followState() {
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
}
