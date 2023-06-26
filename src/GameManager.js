"use strict";
import Constants from "./Constants";
import MapCell from "./MapCell";
import GameMap from "./GameMap";
import Player from "./Player";
import Enemy from "./Enemy";
import ShopMenu from "./ShopMenu";

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
      window.customElements.define("shop-menu", ShopMenu);

      this.mapLevel = Constants.get("mapStartingLevel");

      this.startFrameTimer = performance.now();
      this.deltaTime = undefined; // millis

      this.backGroundMusic = new Audio("/assets/music/main.mp3");
      this.backGroundMusic.volume = 0.1;
      this.backGroundMusic.loop = true;

      // UI
      this.ui = document.getElementById("UI");

      const player_info_container = document.createElement("div");
      player_info_container.classList.add("player_info_container");

      this.playerLevelUI = document.createElement("div");
      this.playerLevelUI.classList.add("player_level");

      const playerExpUIContainer = document.createElement("div");
      playerExpUIContainer.classList.add("UI_exp_container");
      this.playerExpUI = document.createElement("div");
      this.playerExpUI.classList.add("UI_exp_current");
      playerExpUIContainer.appendChild(this.playerExpUI);

      this.currentMapUI = document.createElement("div");
      this.currentMapUI.classList.add("UI_current_map");
      this.currentWeaponUI = document.createElement("div");
      this.currentWeaponUI.id = "UI_current_weapon";
      this.currentGoldUI = document.createElement("div");
      this.currentGoldUI.classList.add("UI_current_gold");

      this.ui.appendChild(this.currentMapUI);
      player_info_container.appendChild(this.playerLevelUI);
      player_info_container.appendChild(playerExpUIContainer);
      player_info_container.appendChild(this.currentWeaponUI);
      player_info_container.appendChild(this.currentGoldUI);

      this.ui.appendChild(player_info_container);

      this.changeMapCurtain = document.createElement("div");
      this.changeMapCurtain.id = "change_map_curtain";
      this.ui.appendChild(this.changeMapCurtain);

      const levelUpBanner = document.createElement("div");
      levelUpBanner.id = "UI_level_up";
      document.getElementById("root").appendChild(levelUpBanner);

      // city shopping menu
      this.shopMenu = new ShopMenu();
      this.ui.appendChild(this.shopMenu);

      this.currentGold = 0;
      this.addGold(0); // set html of gold ui element to "0"

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

  #buildMap(
    currentTimeOfDay,
    playerLevel,
    playerHp,
    playerExp,
    playerWeaponLevel
  ) {
    this.map = null;
    // build map
    this.map = new GameMap(
      this.mapLevel,
      currentTimeOfDay,
      playerLevel,
      playerHp,
      playerExp,
      playerWeaponLevel
    );

    this.updateUI(playerLevel, playerExp, playerWeaponLevel);
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

  async changeMap(
    change,
    currentTimeOfDay,
    playerLevel,
    playerHp,
    playerExp,
    playerWeaponLevel
  ) {
    this.gameState = GameManager.GameState.STOP;

    // animate out
    if (change > 0) this.changeMapCurtain.classList.add("close_to_left");
    else this.changeMapCurtain.classList.add("close_to_right");
    await this.aspetta(1000);

    // create new map
    this.mapLevel += change;
    this.#buildMap(
      currentTimeOfDay,
      playerLevel,
      playerHp,
      playerExp,
      playerWeaponLevel
    );

    // animate in
    if (change > 0) this.changeMapCurtain.classList.add("open_to_left");
    else this.changeMapCurtain.classList.add("open_to_right");
    await this.aspetta(1000);
    this.changeMapCurtain.className = "";
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
    const overlay = document.querySelector("#overlay");
    overlay.querySelector(".overlay_text").innerHTML = "You beat the game";
    overlay.querySelector(".play_button").innerHTML = "thank you for playing";
    overlay.classList.remove("isPlaying");
  }

  playerEnterInCity(player) {
    this.gameState = GameManager.GameState.PAUSE;
    this.shopMenu.openMenu(player, this.gold);
  }

  playerExitFromCity() {
    this.gameState = GameManager.GameState.PLAY;
  }

  async updateUI(lv, exp) {
    this.currentMapUI.innerHTML = "Map:" + this.mapLevel;
    this.playerLevelUI.innerHTML = "Lv" + lv;
    const expBarFill = Math.floor(
      (exp * 100) / (Constants.get("basePlayerExpToNextLevel") * lv)
    );

    // if level up -> reach 100% before going back to zero
    if (parseInt(this.playerExpUI.style.width, 10) > expBarFill) {
      this.playerExpUI.style.width = "100%";
      setTimeout(() => {
        this.playerExpUI.style.width = expBarFill + "%";
      }, 200);
    } else this.playerExpUI.style.width = expBarFill + "%";
  }

  addGold(coins) {
    this.currentGold += coins;
    this.currentGoldUI.innerHTML = this.currentGold;
  }

  async showLvUpBanner() {
    document.getElementById("UI_level_up").classList.add("active");
    await aspetta(1000);
    document.getElementById("UI_level_up").classList.remove("active");
  }

  changePlayerWeaponUI(weaponLv) {
    this.currentWeaponUI.className = "";
    this.currentWeaponUI.classList.add();
  }

  aspetta(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
}
