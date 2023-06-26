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
    map_rows: 5,
    turnTime: 400, // millis

    playerStartPositionX: 1,
    playerStartPositionY: 2,

    startingPlayerLevel: 1,
    basePlayerHp: 50,
    basePlayerAtk: 10,
    basePlayerExpToNextLevel: 15,
    playerStartingGold: 10,

    weaponCost: [0, 100, 200, 500, 1000],
    maxWeaponLevel: 5,

    baseEnemyHp: 20,
    baseEnemyAtk: 10,
    baseEnemyExpDrop: 5,
    baseEnemyGoldDrop: 1,

    mapStartingLevel: 1,
  };

  static get(constantName) {
    if (constantName in Constants.#constantsDB)
      return Constants.#constantsDB[constantName];
    else throw Error("Constants not found.");
  }
}
