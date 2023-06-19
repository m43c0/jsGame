"use strict";
import Constants from "../Constants";
import Map from "./GameMap";
import Player from "./Player";
import Enemy from "./Enemy";

export default class GameManager {
  static #instance;
  static isDebug = false;

  // PLAY: normal play with turns timing
  // PAUSE: menu, shopts, etc.. main update runs but no turns
  // STOP: pause or game over. no main update or turns
  static #GameState = { PLAY: "PLAY", PAUSE: "PAUSE", STOP: "STOP" };

  constructor() {
    // singleton
    if (!GameManager.#instance) {
      GameManager.#instance = this;

      this.variable = Constants.get("test");
      this.turnTime = Constants.get("turnTime");
      this.map = null;
      this.player = null;
      this.gameState = GameManager.#GameState.STOP;

      // define enemy custom HTML element
      window.customElements.define("enemy-avatar", Enemy);

      this.startFrameTimer = performance.now();
      this.deltaTime = undefined; // millis

      // start main update cycle
      this.#mainUpdate();

      // FIX: questo metodo la prima volta sarà chiamato dal giocatore al click su un pulsante
      this.startGame();
    } else return GameManager.#instance;
  }

  static getInstance() {
    // return new GameManager -> ci pensa il costruttore a gestire l'istanza con il singleton
    return new GameManager();
  }

  startGame() {
    this.#buildMap(1);
    this.gameState = GameManager.#GameState.PLAY;
  }

  #buildMap(mapLevel) {
    this.map = null;
    // build map
    this.map = new Map(mapLevel);
  }

  #mainUpdate() {
    if (this.gameState != GameManager.#GameState.STOP) {
      this.deltaTime = performance.now() - this.startFrameTimer;
      this.startFrameTimer = performance.now();
      GameManager.console_log("delta time: " + this.deltaTime);
      this.map.update();
    }

    if (this.gameState == GameManager.#GameState.PLAY) {
      this.turnTime -= this.deltaTime;
      if (this.turnTime <= 0) this.#turnUpdate();
    }
    window.requestAnimationFrame(() => this.#mainUpdate());
  }

  #turnUpdate() {
    GameManager.console_log("TURN");
    this.turnTime = Constants.get("turnTime");
    this.map.turnUpdate();
  }

  static console_log(message) {
    if (GameManager.isDebug) console.log(message);
  }

  nextMap() {
    this.gameState = GameManager.#GameState.STOP;

    // animate out

    // create new map
    this.#buildMap(1);

    // animate in

    this.gameState = GameManager.#GameState.PLAY;
  }

  async test() {
    await delay(1);
    // do something
  }
}

function delay(ms) {
  new Promise((res) => setTimeout(res, ms));
}
