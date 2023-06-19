import GameManager from "./gameManager";
import Constants from "../Constants";

export default class Map {
  constructor() {
    "use strict";
    this.cols = Constants.get("map_columns");
    this.rows = Constants.get("map_rows");
    this.cell_size;
    this.world_container = null;
    this.sky = null;
    this.map_container = null;
  }

  createMap() {
    const rootElement = GameManager.getInstance().HTMLroot;
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
        s.onclick = this.clicked;
        s.setAttribute("pos-x", x);
        s.setAttribute("pos-y", y);
        this.map_container.appendChild(s);
        // map.push(s);
      }

    window.addEventListener("resize", (event) => {
      this.setupSizes();
    });
    this.setupSizes();
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

  clicked(e) {
    GameManager.getInstance().setPlayerTarget(e.target);
    if (e.target.classList.contains("has_enemy"))
      e.target.classList.add("current_enemy_target");
    else e.target.classList.add("current_target");
  }

  getCellPosition(x, y) {
    return { x: x * this.cell_size, y: y * this.cell_size };
  }
}
