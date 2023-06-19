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
    basePlayerHp: 100,
    basePlayerAtk: 15,
    baseEnemyHp: 10,
  };

  static get(constantName) {
    if (constantName in Constants.#constantsDB)
      return Constants.#constantsDB[constantName];
    else throw Error("Constants not found.");
  }
}
