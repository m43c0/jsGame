"use strict";
import Constants from "../Constants";
import GameMap from "./GameMap";
import Player from "./Player";
import Enemy from "./Enemy";
import PlayerStats from "../PlayerStats";

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
      this.playerStats = new PlayerStats();
      this.gameState = GameManager.#GameState.STOP;

      // define player and enemy custom HTML element
      window.customElements.define("enemy-avatar", Enemy);
      window.customElements.define("player-avatar", Player);

      this.startFrameTimer = performance.now();
      this.deltaTime = undefined; // millis

      // start main update cycle
      this.#mainUpdate();

      // FIXME: questo metodo la prima volta sarà chiamato dal giocatore al click su un pulsante
      this.startGame();
    } else return GameManager.#instance;
  }

  static getInstance() {
    // return new GameManager -> ci pensa il costruttore a gestire l'istanza con il singleton
    return new GameManager();
  }

  startGame() {
    this.#buildMap(this.playerStats);
    this.gameState = GameManager.#GameState.PLAY;
  }

  #buildMap(plStats) {
    this.map = null;
    // build map
    this.map = new GameMap(plStats);
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
    this.playerStats.mapLevel++;
    this.#buildMap(this.playerStats);

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
