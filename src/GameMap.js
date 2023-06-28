import Constants from "./Constants";
import GameManager from "./GameManager";
import MapCell from "./MapCell";
import Player from "./Player";
import Enemy from "./Enemy";
import Boss from "./Boss";

export default class GameMap extends HTMLElement {
  #cells = [];
  constructor(
    currentMapLevel,
    mapChangeIncrement,
    currentTimeOfDay,
    playerLevel,
    playerHp,
    playerExp,
    playerWeaponLevel
  ) {
    super();

    this.cols = Constants.get("map_columns");
    this.rows = Constants.get("map_rows");
    this.cell_size;
    this.sky = null;
    this.map_container = null;
    this.enemies = [];
    this.locations = [];
    this.mapLevel = currentMapLevel;

    this.timeOfDay = currentTimeOfDay;

    // MAP elements

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

    this.appendChild(this.sky);
    this.appendChild(this.map_container);
    this.appendChild(border_bottom);

    const dayNightOverlay = document.createElement("div");
    dayNightOverlay.id = "daynight_overlay";
    this.appendChild(dayNightOverlay);

    for (let y = 0; y < this.rows; y++)
      for (let x = 0; x < this.cols; x++) {
        const randomType = Math.random();
        let cellType = MapCell.CellType.GRASS;
        if (randomType > 0.9) cellType = MapCell.CellType.TREE;
        if (randomType > 0.99) cellType = MapCell.CellType.ROCK;

        const c = new MapCell(x, y, cellType);

        c.addEventListener("click", () => {
          this.#setPlayerCurrentTarget(c);
        });
        this.map_container.appendChild(c);
        this.#cells.push(c);
      }

    window.addEventListener("resize", (event) => {
      this.setupSizes(true);
    });
    this.setupSizes(false);

    // create player
    this.player = new Player(
      playerLevel,
      playerHp,
      playerExp,
      playerWeaponLevel,
      mapChangeIncrement < 0
    );
    this.map_container.appendChild(this.player);

    GameManager.getInstance().updatePlayerWeaponUI(playerWeaponLevel);

    let playerStartPositionX = Constants.get("playerStartPositionX");
    const playerStartPositionY = Constants.get("playerStartPositionY");

    // se sto tornando indietro posiziono il player a destra della mappa
    if (mapChangeIncrement < 0) playerStartPositionX = this.cols - 2;

    this.#setGameEntityPositionInMap(
      this.player,
      this.#getCellFromCoords(playerStartPositionX, playerStartPositionY)
    );
    this.#setParallaxShift(); // reset parallax (for successive maps)

    // enemies
    const mapLv = this.mapLevel;
    const isCity = mapLv === 3 || mapLv === 7 || mapLv === 13 || mapLv === 16;

    if (isCity) {
      const cityX = parseInt(this.cols / 2);
      const cityY = parseInt(this.rows / 2);
      const cellToPlaceCity = this.#getCellFromCoords(cityX, cityY);
      cellToPlaceCity.setupCity();
      return;
    }
    if (mapLv === 17) {
      const bossX = GameMap.#randomIntFromInterval(8, this.cols - 5);
      const bossY = GameMap.#randomIntFromInterval(2, this.rows - 5);
      const cellToPlaceBoss = this.#getCellFromCoords(cityX, cityY);
      const boss = new Boss();
      this.enemies.push(boss);
      this.map_container.appendChild(boss);
      this.#setGameEntityPositionInMap(boss, cellToPlaceBoss);
      return;
    }

    const totalEnemiesOnMap = Math.floor((mapLv + 2) / 2);

    const enemiesMinLevel = Math.floor(mapLv / 5 + 1);
    const enemiesMaxLevel = Math.floor(mapLv / 3 + 1);

    let enemiesPlaced = totalEnemiesOnMap;

    while (enemiesPlaced > 0) {
      const enemyPositionX = GameMap.#randomIntFromInterval(4, this.cols - 2);
      const enemyPositionY = GameMap.#randomIntFromInterval(1, this.rows - 3);

      const cellToPlaceEnemy = this.#getCellFromCoords(
        enemyPositionX,
        enemyPositionY
      );

      if (!GameMap.#isCellFree(cellToPlaceEnemy)) continue;

      let enemyLevel = 0;
      if (enemiesPlaced < totalEnemiesOnMap / 2) enemyLevel = enemiesMinLevel;
      else enemyLevel = enemiesMaxLevel;
      const enemy = new Enemy(enemyLevel);
      this.enemies.push(enemy);
      this.map_container.appendChild(enemy);
      this.#setGameEntityPositionInMap(enemy, cellToPlaceEnemy);
      enemiesPlaced--;
    }
  }

  setupSizes(repositionEntitiesOnMap) {
    // to avoid gaps betweens elements caused by float errors,
    // cell size must be an integer, and world container must be an integer multiple of cell size
    this.cell_size = parseInt(window.innerWidth / this.cols);
    const worlContainerWidth = this.cell_size * this.cols;
    // console.log("resize map: ", window.innerWidth, this.cols, this.cell_size);
    document.documentElement.style.setProperty(
      "--world-width",
      worlContainerWidth + "px"
    );
    document.documentElement.style.setProperty(
      "--cell-size",
      this.cell_size + "px"
    );

    if (repositionEntitiesOnMap) {
      this.player.style.left = this.player.cell.x * this.cell_size + "px";
      this.player.style.top = this.player.cell.y * this.cell_size + "px";
      this.enemies.forEach((e) => {
        e.style.left = e.cell.x * this.cell_size + "px";
        e.style.top = e.cell.y * this.cell_size + "px";
      });
    }
  }

  update() {
    this.#dayNightCycle();
  }

  turnUpdate() {
    if (this.player.hasTarget() && !this.player.isAttacking)
      this.#movePlayerAvatar();

    this.enemies.forEach((e) => this.#enemyUpdate(e));
  }

  #enemyUpdate(enemy) {
    if (enemy.hp <= 0) return;
    if (GameMap.#areCellContiguous(enemy.cell, this.player.cell))
      this.#attack(enemy, this.player);

    if (
      Math.abs(enemy.cell.x - this.player.cell.x) < 4 &&
      Math.abs(enemy.cell.y - this.player.cell.y) < 4
    ) {
      enemy.setCurrentTargetCell(this.player.cell);
      this.#moveEnemyAvatar(enemy);
    }
  }

  #dayNightCycle() {
    // timeOfDay:
    // 0: 6AM
    // 100: 6PM
    // 200: 6AM
    this.timeOfDay += 0.05;
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
    if (gameEntity.cell != null) gameEntity.cell.setCurrentEntity(null);
    gameEntity.style.left = destinationCell.x * this.cell_size + "px";
    gameEntity.style.top = destinationCell.y * this.cell_size + "px";
    destinationCell.setCurrentEntity(gameEntity);
    gameEntity.cell = destinationCell;
  }

  #movePlayerAvatar() {
    // imposto direzione
    this.player.setDirection(this.player.getCurrentTargetCell());
    const nextCellCoords = this.player.getNextCellCoordsInCurrentDirection();
    const nextCell = this.#getCellFromCoords(
      nextCellCoords.x,
      nextCellCoords.y
    );

    // check se mi posso muovere in quella direzione
    if (GameMap.#isCellFree(nextCell)) {
      // si -> mi muovo in quella direzione
      this.#setGameEntityPositionInMap(this.player, nextCell);
      this.#setParallaxShift();
      this.#checkIfPlayerArrivedAtDestination();
      this.#checkIfPlayerArrivedInCity();
    } else {
      // no -> mi fermo
      this.#stopPlayerMovements();
    }
  }

  #moveEnemyAvatar(e) {
    e.setDirection(e.getCurrentTargetCell());
    const nextCellCoords = e.getNextCellCoordsInCurrentDirection();
    const nextCell = this.#getCellFromCoords(
      nextCellCoords.x,
      nextCellCoords.y
    );

    // check se nemico si puo muovere in quella direzione
    if (GameMap.#isCellFree(nextCell)) {
      // si -> mi muovo in quella direzione
      this.#setGameEntityPositionInMap(e, nextCell);
    } else {
      // no -> mi fermo
      e.resetCurrentTargetCell();
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
    let nextMap = 0;
    if (this.player.cell.x >= this.cols - 1) nextMap = 1;

    if (this.player.cell.x <= 0 && this.mapLevel > 1) nextMap = -1;

    if (nextMap != 0) {
      GameManager.getInstance().changeMap(
        nextMap,
        this.currentTimeOfDay,
        this.player.level,
        this.player.hp,
        this.player.currentExp,
        this.player.weaponLv
      );
      return;
    }

    if (this.player.isAtTargetCoords()) {
      // arrivato a destinazione
      this.#stopPlayerMovements();
    }
  }
  #checkIfPlayerArrivedInCity() {
    if (this.player.cell.isCity) {
      this.#stopPlayerMovements();
      this.player.recoverAllHp();

      GameManager.getInstance().playerEnterInCity(this.player);
    }
  }

  #setPlayerCurrentTarget(cell) {
    if (GameManager.getInstance().gameState != GameManager.GameState.PLAY)
      return;

    // fermo il Player se per caso si stava già muovendo
    this.#stopPlayerMovements();
    if (
      cell.getCurrentEntity() instanceof Enemy &&
      cell.getCurrentEntity().hp > 0
    )
      if (GameMap.#areCellContiguous(this.player.cell, cell)) {
        this.#attack(this.player, cell.getCurrentEntity());
        return;
      }

    cell.classList.add("current_target");
    this.player.setCurrentTargetCell(cell);
  }

  #stopPlayerMovements() {
    const currentTargetCell = document.querySelector("map-cell.current_target");
    if (currentTargetCell) currentTargetCell.classList.remove("current_target");
    this.player.resetCurrentTargetCell();
  }

  async #attack(attackingEntity, target) {
    if (attackingEntity.isAttacking) return;

    attackingEntity.isAttacking = true;
    attackingEntity.setDirection(target.cell);

    // attack takes 3 turns
    const turnTime = GameManager.getInstance().turnTime;

    let entityFolderName = "player";
    if (attackingEntity instanceof Enemy)
      entityFolderName = "eLv" + attackingEntity.level;

    attackingEntity.style.backgroundImage =
      "url(assets/characters/" + entityFolderName + "/attack1.png)";

    await this.aspetta(turnTime);

    target.getHit(attackingEntity);

    attackingEntity.style.backgroundImage =
      "url(assets/characters/" + entityFolderName + "/attack2.png)";
    await this.aspetta(turnTime);

    attackingEntity.style.backgroundImage =
      "url(assets/characters/" + entityFolderName + "/attack3.png)";
    await this.aspetta(turnTime);

    attackingEntity.isAttacking = false;
    attackingEntity.style.backgroundImage = null;
  }

  static #isCellFree(cell) {
    return cell.getCurrentEntity() == null;
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

  static #areCellContiguous(cell1, cell2) {
    return (
      (Math.abs(cell1.x - cell2.x) == 1 && Math.abs(cell1.y - cell2.y) == 0) ||
      (Math.abs(cell1.y - cell2.y) == 1 && Math.abs(cell1.x - cell2.x) == 0)
    );
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

  aspetta(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
}
