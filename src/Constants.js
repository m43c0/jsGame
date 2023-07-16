// static class used to manage game stats
export default class Constants {
  constructor() {
    if (this instanceof Constants) {
      throw Error(
        "Constants is designed as static class. It cannot be instantiated."
      );
    }
  }

  // private object used as DB for constants and accessed by the static 'get' method.
  static #constantsDB = {
    map_columns: 20,
    map_rows: 6,
    turnTime: 400, // millis

    playerStartPositionX: 1,
    playerStartPositionY: 2,

    startingPlayerLevel: 1,
    maxPlayerLevel: 15,
    basePlayerHp: 50,
    basePlayerAtk: 10,
    basePlayerExpToNextLevel: 20,
    playerStartingGold: 10,

    weaponCost: [0, 100, 250, 700, 1500],
    weaponDamageBonus: [0, 25, 50, 100, 150],
    maxWeaponLevel: 5,

    enemyHp: [20, 40, 200, 450],
    enemyAtk: [10, 15, 30, 100],
    baseEnemyExpDrop: 5,
    baseEnemyGoldDrop: 7,

    mapStartingLevel: 1,
  };

  // method for retrieving the required constant
  static get(constantName) {
    if (constantName in Constants.#constantsDB)
      return Constants.#constantsDB[constantName];
    else throw Error("Constants not found.");
  }
}
