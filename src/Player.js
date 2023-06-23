import Constants from "./Constants";
import GameEntity from "./GameEntity";

// classe per gestire l'oggetto player nella mappa
// ha un riferimento all'oggetto playerStat gestito dal GM in modod da non
// dover sempre richiamare quest'ultimo durante i combattimenti
export default class Player extends GameEntity {
  constructor() {
    "use strict";
    super();

    this.level = Constants.get("startingPlayerLevel");
    this.maxHp = this.level * Constants.get("basePlayerHp");
    this.hp = this.maxHp;
    this.atk = Constants.get("basePlayerAtk") * this.level;

    // imposto la velocità di transazione del player (la velocità con la quale si muoverà tra le celle)
    // all'95% del tempo di un turno, così alla fine del turno il player sarà sicuramente in una casella, e non a metà tra due
    const turnTime = Constants.get("turnTime") * 0.95;
    this.style.setProperty("--player-move-speed", turnTime + "ms");
  }
}
