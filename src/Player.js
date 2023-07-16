import Constants from "./Constants";
import GameEntity from "./GameEntity";
import GameManager from "./GameManager";

// class used by GameMap to manage the player;
// A new player is created for each map, so its stat must be
// carried over from map to map and passed to the constructor;
// the same thing must be done to load previos save game
export default class Player extends GameEntity {
  static #isDebug = false;

  constructor(currentLevel, currentHp, exp, weaponLevel, facingLeft) {
    ("use strict");
    super();

    this.level = currentLevel;
    this.maxLevel = parseInt(Constants.get("maxPlayerLevel"));
    // set base stats
    this.#setupPlayerStats();

    // set stats carried over from previous map (or loaded savegame)
    if (exp) this.currentExp = exp;
    this.weaponLv = weaponLevel;
    if (currentHp) this.hp = currentHp;

    this.updateHealthBar();
    if (facingLeft) this.classList.add("facing_left");

    this.#debugPrintStats();

    // set css variable used as transition time for left and top properties
    // the entity will take the duration of one turn to move on the map from one cell to another
    const turnTime = Constants.get("turnTime");
    this.style.setProperty("--player-move-speed", turnTime + "ms");
  }

  // if player dies -> game over
  signalDeath(killer) {
    GameManager.getInstance().gameOver();
  }

  recoverAllHp() {
    this.hp = this.getMaxHp();
    this.updateHealthBar();
  }

  // add experience points to the player
  addExp(exp) {
    // do not add exp if player already at max level
    if (this.level >= this.maxLevel) return;

    const totalExp = this.currentExp + exp;
    // if enough exp -> level up
    if (totalExp >= this.expToNextLevel) {
      // save experience left over after using up all it takes to level up
      const expLeftAfterLvUp = totalExp - this.expToNextLevel;

      this.levelUp();
      this.currentExp = expLeftAfterLvUp;

      // do not keep left exp if reached max level
      if (this.level >= this.maxLevel) this.currentExp = 0;
    } else this.currentExp = totalExp;

    this.#debugPrintStats();

    // update UI stats
    GameManager.getInstance().updateUI(this.level, this.currentExp);
  }

  // increase current level by one, update all stats  and signal GM to show the UI banner 'level up'
  levelUp() {
    this.level++;
    GameManager.getInstance().showLvUpBanner();
    this.#setupPlayerStats();
    this.updateHealthBar();
  }

  // sets player base stats by the current level (this.level)
  #setupPlayerStats() {
    const maxHealth =
      Constants.get("basePlayerHp") +
      (Constants.get("basePlayerHp") / 10) *
        Math.floor(Math.pow(this.level, 2.2));

    this.setMaxHp(maxHealth);
    this.hp = maxHealth;

    this.atk = Constants.get("basePlayerAtk") * this.level;

    this.expToNextLevel = Player.getExpNeededToLevelUp(this.level);

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

  // static method to compute exp needed for next level
  static getExpNeededToLevelUp(lv) {
    return Math.pow(lv, 1.6) * Constants.get("basePlayerExpToNextLevel");
  }
}
