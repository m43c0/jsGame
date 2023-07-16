import Enemy from "./Enemy";

// HTMLElement representing a single cell in the map.
// Used to add data and functionality such as coordinates (in the map grid) of the cell
// and information about the GameEntity currently in it
export default class MapCell extends HTMLElement {
  #currentEntity = null;

  // types of cell (it only affects the .png sprite used as background)
  static CellType = { GRASS: "grass", TREE: "tree", ROCK: "rock" };

  constructor(cellX, cellY, type) {
    super();

    this.x = cellX;
    this.y = cellY;

    this.cellType = type;

    // each cell type has 3 slightly different .png sprites can be used as background
    this.classList.add(type + "_" + (Math.floor(Math.random() * 3) + 1));

    this.isCity = false;
  }

  // set cell as City (css class .city change the background sprite)
  setupCity() {
    this.isCity = true;
    this.classList.add("city");
  }

  // sets the GameEntity currently on the cell
  // and the css classes for mouse hover effects
  setCurrentEntity(entity) {
    this.#currentEntity = entity;

    // add/remove css class
    this.classList.remove("has_enemy");
    if (entity instanceof Enemy) {
      this.classList.add("has_enemy");
    }
  }

  // gets the GameEntity currently on the cell
  // used by GameMap to get a reference to the current GameEntity
  getCurrentEntity() {
    return this.#currentEntity;
  }
}
