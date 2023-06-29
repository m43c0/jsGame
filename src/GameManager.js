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

      this.turnTime = Constants.get("turnTime");
      this.map = null;
      this.gameState = GameManager.GameState.STOP;

      // define custom HTML element
      window.customElements.define("world-container", GameMap);
      window.customElements.define("enemy-avatar", Enemy);
      window.customElements.define("player-avatar", Player);
      window.customElements.define("map-cell", MapCell);
      window.customElements.define("shop-menu", ShopMenu);

      this.startFrameTimer = performance.now();
      this.deltaTime = undefined; // millis

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
      levelUpBanner.innerHTML = "Level Up!";
      this.rootElement = document.getElementById("root");
      this.rootElement.appendChild(levelUpBanner);

      // city shopping menu
      this.shopMenu = new ShopMenu();
      this.ui.appendChild(this.shopMenu);

      if (localStorage.getItem("savegame") == null)
        document.querySelector("#overlay .load_button").classList.add("locked");

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

        document
          .querySelector("#overlay .load_button")
          .addEventListener("click", () => {
            this.#loadGame();
          });
      }
    } else return GameManager.#instance;
  }

  static getInstance() {
    // return new GameManager -> ci pensa il costruttore a gestire l'istanza con il singleton
    return new GameManager();
  }

  #loadGame() {
    const save = localStorage.getItem("savegame");
    if (save == null) {
      this.#startGame();
      return;
    }

    const saveObject = JSON.parse(save);
    this.#startGame(
      saveObject.mapLv,
      saveObject.playerLevel,
      saveObject.gold,
      saveObject.playerCurrentExp,
      saveObject.weaponLv
    );
  }

  #startGame(_mapLv, _pLv, _pGold, _pExp, _wLv) {
    this.mapLevel =
      _mapLv === undefined ? Constants.get("mapStartingLevel") : _mapLv;

    this.currentGold =
      _mapLv === undefined ? Constants.get("playerStartingGold") : _pGold;
    this.addGold(0); // set html of gold ui element to "0"

    const playerLevel =
      _pLv === undefined ? Constants.get("startingPlayerLevel") : _pLv;

    const playerExp = _pExp === undefined ? 0 : _pExp;

    const weaponLevel = _wLv === undefined ? 1 : _wLv;

    this.#buildMap(1, 0, playerLevel, undefined, playerExp, weaponLevel);
    this.gameState = GameManager.GameState.PLAY;

    if (GameManager.#isDebug) {
      document.querySelector("#overlay").remove();
      return;
    }
    document.querySelector("#overlay").className = "isPlaying";

    this.#playMusic("main");

    this.backGroundMusic.addEventListener("timeupdate", function () {
      const buffer = 0.44;
      if (this.currentTime > this.duration - buffer) {
        this.currentTime = 0;
        this.play();
      }
    });
  }

  #buildMap(
    change,
    currentTimeOfDay,
    playerLevel,
    playerHp,
    playerExp,
    playerWeaponLevel
  ) {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    // build map
    this.map = new GameMap(
      this.mapLevel,
      change,
      currentTimeOfDay,
      playerLevel,
      playerHp,
      playerExp,
      playerWeaponLevel
    );

    this.rootElement.appendChild(this.map);

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
      change,
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
    overlay.querySelector(".play_button").innerHTML = "Restart";

    if (localStorage.getItem("savegame") != null)
      document
        .querySelector("#overlay .load_button")
        .classList.remove("locked");

    this.#playMusic("game-over");
    overlay.classList.remove("isPlaying");
    overlay.classList.add("gOver");
  }

  finish() {
    this.gameState = GameManager.GameState.STOP;
    const overlay = document.querySelector("#overlay");
    overlay.querySelector(".overlay_text").innerHTML = "You beat the game!!";
    const thanks = document.createElement("div");
    thanks.innerHTML = "Thank You for playing";
    document.querySelector("#overlay").appendChild(thanks);
    overlay.querySelector(".play_button").remove();
    this.#playMusic("end");
    overlay.classList.remove("isPlaying");
    overlay.classList.add("finish");
  }

  playerEnterInCity(player) {
    this.gameState = GameManager.GameState.PAUSE;
    this.shopMenu.openMenu(player);
  }

  playerExitFromCity() {
    this.gameState = GameManager.GameState.PLAY;
  }

  async updateUI(playerLevel, playerExp) {
    this.currentMapUI.innerHTML = "Map:" + this.mapLevel;
    this.playerLevelUI.innerHTML = "Lv" + playerLevel;
    const expBarFill = Math.floor(
      (playerExp * 100) / Player.getExpNeededToLevelUp(playerLevel)
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
    await this.aspetta(1000);
    document.getElementById("UI_level_up").classList.remove("active");
  }

  updatePlayerWeaponUI(weaponLv) {
    this.currentWeaponUI.className = "";
    this.currentWeaponUI.classList.add("lv" + weaponLv);
    this.rootElement.classList.add("wLv" + weaponLv);
  }

  saveGame(player) {
    const save = {
      mapLv: this.mapLevel,
      playerLevel: player.level,
      playerCurrentExp: player.currentExp,
      weaponLv: player.weaponLv,
      gold: this.currentGold,
    };
    localStorage.setItem("savegame", JSON.stringify(save));
  }

  #playMusic(song) {
    if (this.backGroundMusic) this.backGroundMusic.pause();
    this.backGroundMusic = new Audio("/assets/music/" + song + ".ogg");
    this.backGroundMusic.volume = 0.05;
    this.backGroundMusic.loop = true;
    this.backGroundMusic.play();
  }

  aspetta(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
}
