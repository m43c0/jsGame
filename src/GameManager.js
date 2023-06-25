"use strict";
import Constants from "./Constants";
import MapCell from "./MapCell";
import GameMap from "./GameMap";
import Player from "./Player";
import Enemy from "./Enemy";

export default class GameManager {
  static #instance;
  static #isDebug = false;
  static #debugLog = false;

  // PLAY: normal play with turns timing
  // PAUSE: menu, shopts, etc.. main update runs but no turns
  // STOP: pause or game over. no main update or turns
  static GameState = { PLAY: "PLAY", PAUSE: "PAUSE", STOP: "STOP" };

  constructor() {
    // singleton
    if (!GameManager.#instance) {
      GameManager.#instance = this;

      this.variable = Constants.get("test");
      this.turnTime = Constants.get("turnTime");
      this.map = null;
      this.gameState = GameManager.GameState.STOP;

      // define custom HTML element
      window.customElements.define("enemy-avatar", Enemy);
      window.customElements.define("player-avatar", Player);
      window.customElements.define("map-cell", MapCell);

      this.mapLevel = Constants.get("mapStartingLevel");

      this.startFrameTimer = performance.now();
      this.deltaTime = undefined; // millis

      this.backGroundMusic = new Audio("/assets/music/main.mp3");
      this.backGroundMusic.volume = 0.1;
      this.backGroundMusic.loop = true;

      this.currentGold = 0;

      // UI
      this.ui = document.getElementById("main_ui");
      this.playerLevelUI = document.createElement("div");
      this.playerLevelUI.id = "UI_player_level";
      const playerExpUIContainer = document.createElement("div");
      playerExpUIContainer.id = "UI_exp_container";
      this.playerExpUI = document.createElement("div");
      this.playerExpUI.id = "UI_exp_current";
      playerExpUIContainer.appendChild(this.playerExpUI);
      this.ui.appendChild(this.playerLevelUI);
      this.ui.appendChild(playerExpUIContainer);

      // start main update cycle
      this.#mainUpdate();

      if (GameManager.#isDebug) {
        document.getElementById("root").classList.add("debug");
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
    this.#buildMap(
      0,
      Constants.get("startingPlayerLevel"),
      Constants.get("basePlayerHp"),
      0
    );
    this.gameState = GameManager.GameState.PLAY;

    if (GameManager.#isDebug) {
      document.querySelector("#overlay").remove();
      return;
    }
    document.querySelector("#overlay").classList.add("isPlaying");

    this.backGroundMusic.play();

    this.backGroundMusic.addEventListener("timeupdate", function () {
      const buffer = 0.44;
      if (this.currentTime > this.duration - buffer) {
        this.currentTime = 0;
        this.play();
      }
    });
  }

  #buildMap(currentTimeOfDay, playerLevel, playerHp, playerExp) {
    this.map = null;
    // build map
    this.map = new GameMap(
      this.mapLevel,
      currentTimeOfDay,
      playerLevel,
      playerHp,
      playerExp
    );

    this.updateUI(playerLevel, playerExp);
  }

  #mainUpdate() {
    if (this.gameState != GameManager.GameState.STOP) {
      this.deltaTime = performance.now() - this.startFrameTimer;
      this.startFrameTimer = performance.now();
      GameManager.console_log("delta time: " + this.deltaTime);
      this.map.update();
    }

    if (this.gameState == GameManager.GameState.PLAY) {
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

  changeMap(change, currentTimeOfDay, playerLevel, playerHp, playerExp) {
    this.gameState = GameManager.GameState.STOP;

    // animate out

    // create new map
    this.mapLevel += change;
    this.#buildMap(currentTimeOfDay, playerLevel, playerHp, playerExp);

    // animate in

    this.gameState = GameManager.GameState.PLAY;
  }

  gameOver() {
    this.gameState = GameManager.GameState.STOP;
    if (GameManager.#isDebug) {
      console.log("GAME OVER");
      return;
    }
    this.backGroundMusic.pause();
    this.backGroundMusic.currentTime = 0;

    const overlay = document.querySelector("#overlay");
    overlay.querySelector(".overlay_text").innerHTML = "Game Over";
    overlay.querySelector(".play_button").innerHTML = "Retry";
    overlay.classList.remove("isPlaying");
  }

  finish() {
    this.gameState = GameManager.GameState.STOP;
    console.log("you win");
  }

  playerEnterInCity() {
    this.gameState = GameManager.GameState.PAUSE;
  }

  playerExitFromCity() {
    this.gameState = GameManager.GameState.PLAY;
  }

  updateUI(lv, exp) {
    this.playerLevelUI.innerHTML =
      "Map: " + this.mapLevel + " - Player Lv" + lv;
    const expBarFill = Math.floor(
      (exp * 100) / (Constants.get("basePlayerExpToNextLevel") * lv)
    );

    // if level up -> reach 100% before
    if (parseInt(this.playerExpUI.style.width, 10) > expBarFill) {
      this.playerExpUI.style.width = "100%";
      setTimeout(() => {
        this.playerExpUI.style.width = expBarFill + "%";
      }, 200);
    } else this.playerExpUI.style.width = expBarFill + "%";
  }

  addGold(coins) {
    this.currentGold += coins;
  }
}
