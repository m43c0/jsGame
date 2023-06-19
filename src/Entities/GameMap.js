import Constants from "../Constants";
import GameManager from "./GameManager";
import { Direction } from "../Direction";
import Enemy from "./Enemy";

export default class GameMap {
  constructor(mapLevel) {
    "use strict";
    this.cols = Constants.get("map_columns");
    this.rows = Constants.get("map_rows");
    this.cell_size;
    this.world_container = null;
    this.sky = null;
    this.map_container = null;
    this.enemies = [];
    this.locations = [];

    // this.mapCells = new Map();

    // player
    this.playerCurrentDirection = Direction.Down;
    this.playerAvatar = null;
    this.playerCurrentPosition = { x: 0, y: 0 };
    this.playerCurrentTarget = null;

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

        // const cellKey = x + "-" + y;
        // this.mapCells.set(cellKey, { cell: s, cellX: x, cellY: y });
      }

    window.addEventListener("resize", (event) => {
      this.setupSizes();
    });
    this.setupSizes();

    // imposto la velocità di transazione del player (la velocità con la quale si muoverà tra le celle)
    // all'80% del tempo di un turno, così alla fine del turno il player sarà sicuramente in una casella, e non a metà tra due
    const turnTime = Constants.get("turnTime") * 0.8;
    this.playerAvatar = document.createElement("player");
    this.playerAvatar.style.setProperty("--player-move-speed", turnTime + "ms");

    this.map_container.appendChild(this.playerAvatar);
    this.#setPlayerPosition(1, 3); // starting cell x:1, y:3

    //enemies
    for (let i = 0; i < 1; i++) {
      const enemy = new Enemy(1, "slime", 20, 20); // fix

      this.enemies.push(enemy);
      this.map_container.appendChild(enemy);
    }
  }

  #setPlayerCurrentTarget(cellNode) {
    // set player current target
    const targetX = parseInt(cellNode.getAttribute("pos-x"));
    const targetY = parseInt(cellNode.getAttribute("pos-y"));
    console.log("X: ", targetX, "Y: ", targetY);

    if (this.playerCurrentTarget != null)
      this.playerCurrentTarget.cell.classList.remove("current_target");

    this.playerCurrentTarget = { cell: cellNode, x: targetX, y: targetY };
    cellNode.classList.add("current_target");
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
    if (this.playerCurrentTarget != null) this.#movePlayerAvatar();

    this.enemies.forEach((e) => e.turnUpdate());
  }

  #getCellPositionFromCoords(x, y) {
    return { x: x * this.cell_size, y: y * this.cell_size };
  }

  // #getCellNodeFromCoords(x, y) {
  //   return this.mapCells.get(x + "-" + y);
  // }

  // #getCellCoordsFromPosition(xPos, yPos) {}

  /* --------------------------------------------------------------------------------------------- */
  /* PLAYER MOVEMENTS */

  #setPlayerPosition(x, y) {
    const cellPosition = this.#getCellPositionFromCoords(x, y);
    this.playerAvatar.style.left = cellPosition.x + "px";
    this.playerAvatar.style.top = cellPosition.y + "px";
    this.playerCurrentPosition.x = x;
    this.playerCurrentPosition.y = y;
  }

  #movePlayerAvatar() {
    // imposto direzione
    this.#setPlayerDirection();

    // check se mi posso muovere in quella direzione
    const nextCell = {
      x: this.playerCurrentPosition.x + this.playerCurrentDirection.x,
      y: this.playerCurrentPosition.y + this.playerCurrentDirection.y,
    };

    if (this.#canPlayerMoveToCell(nextCell.x, nextCell.y)) {
      // si -> mi muovo in quella direzione
      this.#setPlayerPosition(nextCell.x, nextCell.y);

      this.#checkIfPlayerArrivedAtDestination();
    }
  }

  #setPlayerDirection() {
    if (this.playerCurrentTarget.y < this.playerCurrentPosition.y)
      this.playerCurrentDirection = Direction.Up;
    else if (this.playerCurrentTarget.x > this.playerCurrentPosition.x)
      this.playerCurrentDirection = Direction.Right;
    else if (this.playerCurrentTarget.y > this.playerCurrentPosition.y)
      this.playerCurrentDirection = Direction.Down;
    else if (this.playerCurrentTarget.x < this.playerCurrentPosition.x)
      this.playerCurrentDirection = Direction.Left;
  }

  #checkIfPlayerArrivedAtDestination() {
    // se sono sull'ultima colonna -> prossima mappa
    if (this.playerCurrentPosition.x >= this.cols - 1) {
      GameManager.getInstance().nextMap();
      return;
    }

    if (
      this.playerCurrentPosition.x == this.playerCurrentTarget.x &&
      this.playerCurrentPosition.y == this.playerCurrentTarget.y
    ) {
      // arrivato a destinazione
      this.#stopPlayerMovement();
    }
  }

  #stopPlayerMovement() {
    this.playerCurrentTarget.cell.classList.remove("current_target");
    this.playerCurrentTarget = null;
  }

  #attack(target) {}

  #canPlayerMoveToCell(x, y) {
    return true;
  }
}
