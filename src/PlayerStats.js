import Constants from "./Constants";
export default class PlayerStats {
  "use strict";
  constructor() {
    this.exp = 0;
    this.expToNextLevel =
      Constants.get("basePlayerExpToNextLevel") * this.level;

    this.mapLevel = Constants.get("mapStartingLevel");
  }

  addExp(exp) {
    const totalExp = this.exp + exp;
    if (totalExp >= this.expToNextLevel) {
      const expLeftAfterLvUp = totalExp - this.expToNextLevel;
      this.levelUp();
      this.exp = expLeftAfterLvUp;
    } else this.exp = totalExp;
  }

  levelUp() {
    // YAY
    this.level++;
    // FIXME:
    // this.hp = Constants.get("basePlayerHp") * this.level;
    // this.atk = Constants.get("basePlayerAtk") * this.level;
    // this.exp = 0;
    this.expToNextLevel =
      Constants.get("basePlayerExpToNextLevel") * this.level;
  }
}
