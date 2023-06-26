import Constants from "./Constants";
import GameEntity from "./GameEntity";
import GameManager from "./GameManager";

// classe per gestire l'oggetto player nella mappa
// ha un riferimento all'oggetto playerStat gestito dal GM in modod da non
// dover sempre richiamare quest'ultimo durante i combattimenti
export default class Player extends GameEntity {
  constructor(currentLevel, currentHp, exp, weaponLevel) {
    "use strict";
    super();

    this.level = currentLevel;
    this.maxHp = this.level * Constants.get("basePlayerHp");
    this.hp = currentHp;
    (this.weaponLv = weaponLevel ? undefined : 1), weaponLevel;

    this.atk = Constants.get("basePlayerAtk") * this.level;

    this.currentExp = exp;
    this.expToNextLevel =
      Constants.get("basePlayerExpToNextLevel") * this.level;

    this.updateHealthBar();

    // imposto la velocità di transazione del player (la velocità con la quale si muoverà tra le celle)
    // all'95% del tempo di un turno, così alla fine del turno il player sarà sicuramente in una casella, e non a metà tra due
    const turnTime = Constants.get("turnTime") * 0.95;
    this.style.setProperty("--player-move-speed", turnTime + "ms");
  }

  signalDeath(killer) {
    GameManager.getInstance().gameOver();
  }
  recoverAllHp() {
    this.hp = this.maxHp;
    this.updateHealthBar();
  }

  addExp(exp) {
    const totalExp = this.currentExp + exp;
    if (totalExp >= this.expToNextLevel) {
      const expLeftAfterLvUp = totalExp - this.expToNextLevel;
      this.levelUp();
      this.currentExp = expLeftAfterLvUp;
    } else this.currentExp = totalExp;

    GameManager.getInstance().updateUI(
      this.level,
      this.currentExp,
      this.weaponLv
    );
  }

  levelUp() {
    // YAY
    this.level++;
    GameManager.getInstance().showLvUpBanner();
    this.maxHp = this.level * Constants.get("basePlayerHp");
    this.hp = this.maxHp;
    this.atk = Constants.get("basePlayerAtk") * this.level;
    this.exp = 0;
    this.updateHealthBar();
    this.expToNextLevel =
      Constants.get("basePlayerExpToNextLevel") * this.level;
  }
}
