import Constants from "./Constants";
import GameManager from "./GameManager";
import MapCell from "./MapCell";
import Player from "./Player";
import Enemy from "./Enemy";

export default class GameMap {
  #cells = [];
  constructor(playerStats) {
    "use strict";
    this.cols = Constants.get("map_columns");
    this.rows = Constants.get("map_rows");
    this.cell_size;
    this.world_container = null;
    this.sky = null;
    this.map_container = null;
    this.enemies = [];
    this.locations = [];

    this.timeOfDay = 0;

    this.playerStatsRef = playerStats;

    // MAP DOM elements
    const rootElement = document.getElementById("root");
    rootElement.innerHTML = ""; // clear everything

    // world container -> contiene il div del cielo, i 2 div che limitano il movimento sopra e sotto la mappa (montagne) e la mappa stessa
    this.world_container = document.createElement("div");
    this.world_container.id = "world_container";
    this.sky = document.createElement("div");
    this.sky.id = "sky";

    const bg0 = document.createElement("div");
    bg0.id = "bg0";
    bg0.classList.add("background");
    const starz = document.createElement("div");
    starz.id = "bg_stars";
    starz.classList.add("background");

    const bg1 = document.createElement("div");
    bg1.id = "bg1";
    bg1.classList.add("background");
    const bg2 = document.createElement("div");
    bg2.id = "bg2";
    bg2.classList.add("background");
    const bg3 = document.createElement("div");
    bg3.id = "bg3";
    bg3.classList.add("background");
    this.sky.appendChild(bg0);
    this.sky.appendChild(starz);
    this.sky.appendChild(bg1);
    this.sky.appendChild(bg2);
    this.sky.appendChild(bg3);

    const border_bottom = document.createElement("div");
    border_bottom.id = "map_border_bottom";

    this.map_container = document.createElement("div");
    this.map_container.id = "map_container";
    document.documentElement.style.setProperty("--map-columns", this.cols);

    this.world_container.appendChild(this.sky);
    this.world_container.appendChild(this.map_container);
    this.world_container.appendChild(border_bottom);

    const dayNightOverlay = document.createElement("div");
    dayNightOverlay.id = "daynight_overlay";
    this.world_container.appendChild(dayNightOverlay);

    rootElement.appendChild(this.world_container);

    for (let y = 0; y < this.rows; y++)
      for (let x = 0; x < this.cols; x++) {
        const ranomType = Math.random();
        let cellType = MapCell.CellType.GRASS;
        if (ranomType > 0.85) cellType = MapCell.CellType.TREE;
        if (ranomType > 0.95) cellType = MapCell.CellType.ROCK;

        const c = new MapCell(x, y, cellType);

        c.addEventListener("click", () => {
          this.#setPlayerCurrentTarget(c);
        });
        this.map_container.appendChild(c);
        this.#cells.push(c);
      }

    window.addEventListener("resize", (event) => {
      this.setupSizes();
    });
    this.setupSizes();

    // create player
    this.player = new Player();
    this.map_container.appendChild(this.player);

    this.#setGameEntityPositionInMap(
      this.player,
      this.#getCellFromCoords(
        Constants.get("playerStartPositionX"),
        Constants.get("playerStartPositionY")
      )
    );
    this.#setParallaxShift(); // reset parallax (for successive maps)

    // enemies
    const mapLv = this.playerStatsRef.mapLevel;
    const isCity = mapLv % 3 === 0 || mapLv % 7 === 0 || mapLv % 13 === 0;
    if (isCity) {
      // TODO: place city

      return;
    }

    let totalEnemiesOnMap = Math.floor((mapLv + 2) / 2);
    const enemyLevel = Math.floor(mapLv / 3) + 1;

    while (totalEnemiesOnMap > 0) {
      const enemyPositionX = GameMap.#randomIntFromInterval(5, this.cols - 2);
      const enemyPositionY = GameMap.#randomIntFromInterval(1, this.rows - 2);
      const cellToPlaceEnemy = this.#getCellFromCoords(
        enemyPositionX,
        enemyPositionY
      );

      if (!this.#isCellFree(cellToPlaceEnemy)) continue;

      const enemy = new Enemy(this.playerStatsRef.mapLevel, "slime"); // TODO: enemy type
      this.enemies.push(enemy);
      this.map_container.appendChild(enemy);
      this.#setGameEntityPositionInMap(enemy, cellToPlaceEnemy);
      enemy.addEventListener("click", (e) => this.#enemyClicked(e.target));

      totalEnemiesOnMap--;
    }
  }

  setupSizes() {
    // to avoid gaps betweens elements caused by float errors,
    // cell size must be an integer, and world container must be an integer multiple of cell size
    this.cell_size = parseInt(window.innerWidth / this.cols);
    const worlContainerWidth = this.cell_size * this.cols;
    console.log("resize map: ", window.innerWidth, this.cols, this.cell_size);
    document.documentElement.style.setProperty(
      "--world-width",
      worlContainerWidth + "px"
    );
    document.documentElement.style.setProperty(
      "--cell-size",
      this.cell_size + "px"
    );
  }

  update() {
    // this.#dayNightCycle();
  }

  turnUpdate() {
    if (this.player.hasTarget()) this.#movePlayerAvatar();

    this.enemies.forEach((e) => e.turnUpdate());
  }

  #dayNightCycle() {
    // timeOfDay:
    // 0: 6AM
    // 100: 6PM
    // 200: 6AM
    this.timeOfDay += 0.1;
    if (this.timeOfDay >= 200) this.timeOfDay = 0;
    // colori. da 0 a 100 giorno pieno. da 100 a 150 passa da giorno a notte e da 150 a 200 passa da notte a giorno
    if (this.timeOfDay >= 100) {
      let amount = this.timeOfDay - 100;
      amount = amount <= 50 ? amount / 50 : amount * -0.02 + 2;
      const dayNightColor = GameMap.#lerpColor("#aee7f8", "#34376f", amount);
      document.documentElement.style.setProperty(
        "--daynight-color",
        dayNightColor
      );
      document.documentElement.style.setProperty(
        "--night-intensity",
        Math.min(amount, 0.5)
      );
    }
  }

  // set the position (left and top pixels) and the coordinates of the given gameEntity
  #setGameEntityPositionInMap(gameEntity, destinationCell) {
    if (gameEntity.cell != null) gameEntity.cell.currentEntity = null;
    gameEntity.style.left = destinationCell.x * this.cell_size + "px";
    gameEntity.style.top = destinationCell.y * this.cell_size + "px";
    destinationCell.currentEntity = gameEntity;
    gameEntity.cell = destinationCell;
  }

  #movePlayerAvatar() {
    // imposto direzione
    this.player.setDirection();
    const nextCellCoords = this.player.getNextCellCoordsInCurrentDirection();
    const nextCell = this.#getCellFromCoords(
      nextCellCoords.x,
      nextCellCoords.y
    );

    // check se mi posso muovere in quella direzione
    if (this.#isCellFree(nextCell)) {
      // si -> mi muovo in quella direzione
      this.#setGameEntityPositionInMap(this.player, nextCell);
      this.#setParallaxShift();
      this.#checkIfPlayerArrivedAtDestination();
    } else {
      // no -> mi fermo
      this.#stopPlayerMovements();
    }
  }

  #setParallaxShift() {
    document.documentElement.style.setProperty(
      "--parallax-shift",
      this.player.cell.x * -1 + "px"
    );
  }

  #checkIfPlayerArrivedAtDestination() {
    // se sono sull'ultima colonna -> prossima mappa
    if (this.player.cell.x >= this.cols - 1) {
      GameManager.getInstance().nextMap();
      return;
    }

    if (this.player.isAtTargetCoords()) {
      // arrivato a destinazione
      this.#stopPlayerMovements();
    }
  }

  #setPlayerCurrentTarget(cell) {
    // set player current target
    console.log("X: ", cell.x, "Y: ", cell.y);

    // fermo il Player se per caso si stava già muovendo
    this.#stopPlayerMovements();

    cell.classList.add("current_target");

    this.player.setCurrentTargetCell(cell);
  }

  #enemyClicked(enemy) {
    console.log(JSON.stringify(enemy));
  }

  #stopPlayerMovements() {
    const currentTargetCell = document.querySelector("map-cell.current_target");
    if (currentTargetCell) currentTargetCell.classList.remove("current_target");
    this.player.resetCurrentTargetCell();
  }

  #attack(target) {}

  #isCellFree(cell) {
    return cell.isWalkable && cell.currentEntity == null;
  }

  #getCellFromCoords(coordX, coordY) {
    return this.#cells.filter(
      (cell) => cell.x === coordX && cell.y == coordY
    )[0];
  }

  /**
   *
   * UTILS
   *
   */

  static #randomIntFromInterval(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * https://gist.github.com/rosszurowski/67f04465c424a9bc0dae
   *
   * A linear interpolator for hexadecimal colors
   * @param {String} a
   * @param {String} b
   * @param {Number} amount
   * @example
   * // returns #7F7F7F
   * lerpColor('#000000', '#ffffff', 0.5)
   * @returns {String}
   */
  static #lerpColor(a, b, amount) {
    var ah = +a.replace("#", "0x"),
      ar = ah >> 16,
      ag = (ah >> 8) & 0xff,
      ab = ah & 0xff,
      bh = +b.replace("#", "0x"),
      br = bh >> 16,
      bg = (bh >> 8) & 0xff,
      bb = bh & 0xff,
      rr = ar + amount * (br - ar),
      rg = ag + amount * (bg - ag),
      rb = ab + amount * (bb - ab);

    return (
      "#" +
      (((1 << 24) + (rr << 16) + (rg << 8) + rb) | 0).toString(16).slice(1)
    );
  }
}
