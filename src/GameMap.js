import Constants from "./Constants";
import GameManager from "./GameManager";
import Player from "./Player";
import Enemy from "./Enemy";

export default class GameMap {
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

    this.playerStatsRef = playerStats;

    // MAP DOM elements
    const rootElement = document.getElementById("root");
    rootElement.innerHTML = ""; // clear everything

    // world container -> contiene il div del cielo, i 2 div che limitano il movimento sopra e sotto la mappa (montagne) e la mappa stessa
    this.world_container = document.createElement("div");
    this.world_container.id = "world_container";
    this.sky = document.createElement("div");
    this.sky.id = "sky";
    const border_top = document.createElement("div");
    border_top.id = "map_border_top";
    for (let h = 0; h < 2; h++)
      for (let v = 0; v < this.cols; v++) {
        let b = document.createElement("div");
        border_top.appendChild(b);
      }

    const border_bottom = document.createElement("div");
    border_bottom.id = "map_border_bottom";
    for (let h = 0; h < this.cols; h++) {
      let b = document.createElement("div");
      border_bottom.appendChild(b);
    }

    this.map_container = document.createElement("div");
    this.map_container.id = "map_container";
    document.documentElement.style.setProperty("--map-columns", this.cols);

    this.world_container.appendChild(this.sky);
    this.world_container.appendChild(border_top);
    this.world_container.appendChild(this.map_container);
    this.world_container.appendChild(border_bottom);

    rootElement.appendChild(this.world_container);

    for (let y = 0; y < this.rows; y++)
      for (let x = 0; x < this.cols; x++) {
        let s = document.createElement("cell");
        s.addEventListener("click", (e) => {
          this.#setPlayerCurrentTarget(e.target);
        });
        s.setAttribute("pos-x", x);
        s.setAttribute("pos-y", y);
        this.map_container.appendChild(s);
      }

    window.addEventListener("resize", (event) => {
      this.setupSizes();
    });
    this.setupSizes();

    // create player
    this.player = new Player();
    this.map_container.appendChild(this.player);
    this.#setGameEntityPositionInMap(this.player, 1, 3); // starting cell x:1, y:3

    //enemies
    const totalEnemiesOnMap = Math.floor(Math.random() * 2) + 3;
    for (let i = 0; i < totalEnemiesOnMap; i++) {
      // FIXME:
      const eCoords = {
        x: Math.round(Math.random() * this.cols - 1),
        y: Math.round(Math.random() * this.rows - 1),
      };

      const enemy = new Enemy(this.playerStatsRef.mapLevel, "slime");

      this.enemies.push(enemy);
      this.map_container.appendChild(enemy);
      this.#setGameEntityPositionInMap(enemy, eCoords.x, eCoords.y);
      enemy.addEventListener("click", (e) => this.#enemyClicked(e.target));
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

  update() {}

  turnUpdate() {
    if (this.player.hasTarget()) this.#movePlayerAvatar();

    this.enemies.forEach((e) => e.turnUpdate());
  }

  #getCellPositionFromCoords(xCoordinate, yCoordinate) {
    return { x: xCoordinate * this.cell_size, y: yCoordinate * this.cell_size };
  }

  // set the position (left and top pixels) and the coordinates of the given gameEntity
  #setGameEntityPositionInMap(gameEntity, xCoords, yCoords) {
    console.log("ENT: " + JSON.stringify(gameEntity), xCoords, yCoords);

    const cellPosition = this.#getCellPositionFromCoords(xCoords, yCoords);
    console.log("POS: ", cellPosition);

    console.log("___");
    gameEntity.style.left = cellPosition.x + "px";
    gameEntity.style.top = cellPosition.y + "px";
    gameEntity.currentX = xCoords;
    gameEntity.currentY = yCoords;
  }

  #movePlayerAvatar() {
    // imposto direzione
    this.player.setDirection();
    const nextCell = this.player.getNextCellCoordsInCurrentDirection();

    // check se mi posso muovere in quella direzione
    if (this.#canPlayerMoveToCell(nextCell.x, nextCell.y)) {
      // si -> mi muovo in quella direzione
      this.#setGameEntityPositionInMap(this.player, nextCell.x, nextCell.y);

      this.#checkIfPlayerArrivedAtDestination();
    }
  }

  #checkIfPlayerArrivedAtDestination() {
    // se sono sull'ultima colonna -> prossima mappa
    if (this.currentX >= this.cols - 1) {
      GameManager.getInstance().nextMap();
      return;
    }

    if (this.player.isAtTargetCoords()) {
      // arrivato a destinazione
      this.#resetPlayerTarget();
    }
  }

  #setPlayerCurrentTarget(cellNode) {
    // set player current target
    const targetX = parseInt(cellNode.getAttribute("pos-x"));
    const targetY = parseInt(cellNode.getAttribute("pos-y"));
    console.log("X: ", targetX, "Y: ", targetY);

    // remove class from current target cell
    this.#resetPlayerTarget();

    cellNode.classList.add("current_target");

    this.player.setCurrentTarget(targetX, targetY);
  }

  #enemyClicked(enemy) {
    console.log(JSON.stringify(enemy));
  }

  #resetPlayerTarget() {
    const currentTargetCell = document.querySelector("cell.current_target");
    if (currentTargetCell) currentTargetCell.classList.remove("current_target");
    this.player.resetCurrentTarget();
  }

  #attack(target) {}

  #canPlayerMoveToCell(x, y) {
    // TODO:
    return true;
  }
  #canEnemyMoveToCell(x, y) {
    // TODO:
    return true;
  }
}
