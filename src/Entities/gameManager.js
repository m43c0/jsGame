"use strict";
import Constants from "../Constants";
import Map from "./map";
import Player from "./player";
import Enemy from "./enemy";

export default class GameManager {
  static #instance;
  static isDebug = false;

  // PLAY: normal play with turns timing
  // IDLE: menu, shopts, etc.. main update runs but no turns
  // STOP: pause or game over. no main update or turns
  static #GameState = { PLAY, IDLE, STOP };

  constructor() {
    // singleton
    if (!GameManager.#instance) {
      GameManager.#instance = this;

      this.HTMLroot = document.getElementById("root");
      this.variable = Constants.get("test");
      this.turnTime = Constants.get("turnTime");
      this.map = new Map();
      this.currentEnemies = [];
      this.player = new Player();
      this.gameState = GameManager.#GameState.PLAY;

      this.startFrameTimer = performance.now();
      this.deltaTime = undefined; // millis

      this.init();
    } else return GameManager.#instance;
  }

  static getInstance() {
    // return new GameManager -> ci pensa il costruttore a gestire l'istanza con il singleton
    return new GameManager();
  }

  init() {
    // build map
    this.map.createMap();

    this.map.map_container.appendChild(this.player.playerAvatar);
    this.player.setPosition(1, 3); // starting cell x:1, y:3

    // create enemies with map info

    // start main update cycle
    this.#mainUpdate();
  }

  #mainUpdate() {
    if (this.gameState != GameManager.#GameState.STOP) {
      this.deltaTime = performance.now() - this.startFrameTimer;
      this.startFrameTimer = performance.now();
      GameManager.console_log("delta time: " + this.deltaTime);
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

    this.player.turnUpdate();
    this.currentEnemies.forEach((e) => e.turnUpdate());
  }

  static console_log(message) {
    if (GameManager.isDebug) console.log(message);
  }

  setPlayerTarget(cell) {
    const targetX = parseInt(cell.getAttribute("pos-x"));
    const targetY = parseInt(cell.getAttribute("pos-y"));
    console.log("X: ", targetX, "Y: ", targetY);

    this.player.setTarget(targetX, targetY);
  }

  canMoveToCell(x, y) {
    return true;
  }

  nextMap() {}

  async test() {
    await delay(1);
    // do something
  }
}

function delay(ms) {
  new Promise((res) => setTimeout(res, ms));
}
