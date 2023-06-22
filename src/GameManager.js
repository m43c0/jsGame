"use strict";
import Constants from "./Constants";
import MapCell from "./MapCell";
import GameMap from "./GameMap";
import Player from "./Player";
import Enemy from "./Enemy";
import PlayerStats from "./PlayerStats";

export default class GameManager {
  static #instance;
  static #isDebug = true;
  static #debugLog = false;

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

      // define custom HTML element
      window.customElements.define("enemy-avatar", Enemy);
      window.customElements.define("player-avatar", Player);
      window.customElements.define("map-cell", MapCell);

      this.startFrameTimer = performance.now();
      this.deltaTime = undefined; // millis

      // start main update cycle
      this.#mainUpdate();

      if (GameManager.#isDebug) {
        this.#startGame();
      } else {
        document
          .querySelector("#overlay .play_button")
          .addEventListener("click", () => {
            this.#startGame();
          });
      }
    } else return GameManager.#instance;
  }

  static getInstance() {
    // return new GameManager -> ci pensa il costruttore a gestire l'istanza con il singleton
    return new GameManager();
  }

  #startGame() {
    this.#buildMap(this.playerStats);
    this.gameState = GameManager.#GameState.PLAY;

    if (GameManager.#isDebug) {
      document.querySelector("#overlay").remove();
      return;
    }

    document.querySelector("#overlay").classList.add("isPlaying");

    let audio = new Audio("/assets/music/main.mp3");
    audio.volume = 0.2;
    audio.play();
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
    if (GameManager.#debugLog) console.log(message);
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
}
