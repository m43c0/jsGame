import Constants from "./Constants";
import GameEntity from "./GameEntity";
import GameManager from "./GameManager";

// classe per gestire l'oggetto player nella mappa
// ha un riferimento all'oggetto playerStat gestito dal GM in modod da non
// dover sempre richiamare quest'ultimo durante i combattimenti
export default class Player extends GameEntity {
  static #isDebug = true;

  constructor(currentLevel, currentHp, exp, weaponLevel, facingLeft) {
    "use strict";
    super();

    this.level = currentLevel;
    this.#setupPlayerStats();

    // set stat che mi porto dietro da mappa precedente
    if (exp) this.currentExp = exp;
    this.weaponLv = weaponLevel;
    if (currentHp) this.hp = currentHp;

    this.updateHealthBar();

    if (facingLeft) this.classList.add("facing_left");

    this.#debugPrintStats();

    const turnTime = Constants.get("turnTime");
    this.style.setProperty("--player-move-speed", turnTime + "ms");
  }

  signalDeath(killer) {
    GameManager.getInstance().gameOver();
  }
  recoverAllHp() {
    this.hp = this.getMaxHp();
    this.updateHealthBar();
  }

  addExp(exp) {
    const totalExp = this.currentExp + exp;
    if (totalExp >= this.expToNextLevel) {
      const expLeftAfterLvUp = totalExp - this.expToNextLevel;
      this.levelUp();
      this.currentExp = expLeftAfterLvUp;
    } else this.currentExp = totalExp;

    this.#debugPrintStats();
    GameManager.getInstance().updateUI();
  }

  levelUp() {
    // YAY
    this.level++;
    GameManager.getInstance().showLvUpBanner();
    this.#setupPlayerStats();
    this.updateHealthBar();
  }

  #setupPlayerStats() {
    const maxHealth =
      Constants.get("basePlayerHp") +
      (Constants.get("basePlayerHp") / 10) *
        parseInt(Math.pow(this.level, 2.5));

    this.setMaxHp(maxHealth);
    this.hp = maxHealth;

    this.atk = Constants.get("basePlayerAtk") * this.level;

    this.expToNextLevel =
      Math.pow(this.level, 2) * Constants.get("basePlayerExpToNextLevel");

    this.currentExp = 0;
  }

  #debugPrintStats() {
    if (!Player.#isDebug) return;

    console.log("maxHP: ", this.getMaxHp());
    console.log("HP: ", this.hp);
    console.log("ATK: ", this.atk);
    console.log("weapon: ", this.weaponLv);
    console.log("exp: ", this.currentExp);
    console.log("expToNextLevel: ", this.expToNextLevel);
  }

  omar() {
    GameManager.getInstance().finish();
  }
}
