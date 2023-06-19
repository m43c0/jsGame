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
    map_columns: 30,
    map_rows: 7,
    test: "_test_",
    turnTime: 200, // millis

    startingPlayerLevel: 1,
    basePlayerHp: 100,
    basePlayerAtk: 15,
    basePlayerExpToNextLevel: 10,

    baseEnemyHp: 10,
    baseEnemyExpDrop: 20,
    baseEnemyGoldDrop: 1,

    mapStartingLevel: 1,
  };

  static get(constantName) {
    if (constantName in Constants.#constantsDB)
      return Constants.#constantsDB[constantName];
    else throw Error("Constants not found.");
  }
}
