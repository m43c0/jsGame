import Constants from "../Constants";
export default class Enemy {
  constructor(level, type) {
    this.level = level;
    this.type = type;

    this.hp = this.level * Constants.get("baseEnemyHp");
  }

  update() {}

  turnUpdate() {}
}
2;
