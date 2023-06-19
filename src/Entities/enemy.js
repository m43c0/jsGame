import Constants from "../Constants";
export default class Enemy extends HTMLElement {
  static #EnemyState = {
    IDLE: "IDLE",
    FOLLOW_PLAYER: "FOLLOW_PLAYER",
    ATTACK: "ATTACK",
    DEAD: "DEAD",
  };

  constructor(level, type, posX, posY) {
    super();

    this.level = level;
    this.type = type;

    this.currentPosition = { x: posX, y: posY };

    this.style.left = posX + "px";
    this.style.top = posY + "px";

    this.currentState = Enemy.#EnemyState.IDLE;

    this.hp = this.level * Constants.get("baseEnemyHp");

    this.addEventListener("click", () => this.#enemyClicked());
  }

  update() {}

  turnUpdate() {
    //console.log("enemy turn update");
    switch (this.currentState) {
      case Enemy.#EnemyState.IDLE:
        this.#idleState();
        break;
      case Enemy.#EnemyState.FOLLOW_PLAYER:
        this.#followState();
        break;
      case Enemy.#EnemyState.ATTACK:
        this.#attackState();
        break;
      case Enemy.#EnemyState.DEAD:
        this.#deadState();
        break;

      default:
        break;
    }
  }

  #enemyClicked(e) {
    console.log(this);
  }

  #idleState() {
    // search for player
  }
  #followState() {
    // follow player
  }
  #attackState() {}
  #deadState() {}
}
