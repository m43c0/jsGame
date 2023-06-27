import Enemy from "./Enemy";

export default class MapCell extends HTMLElement {
  #currentEntity = null;

  static CellType = { GRASS: "grass", TREE: "tree", ROCK: "rock" };

  constructor(cellX, cellY, type) {
    super();

    this.x = cellX;
    this.y = cellY;

    this.cellType = type;
    this.classList.add(type + "_" + (Math.floor(Math.random() * 3) + 1));

    this.isCity = false;
  }

  setupCity() {
    this.isCity = true;
    this.classList.add("city");
  }

  // for mouse hover effects
  setCurrentEntity(entity) {
    this.#currentEntity = entity;

    this.classList.remove("has_enemy");

    if (entity instanceof Enemy) {
      this.classList.add("has_enemy");
    }
  }

  getCurrentEntity() {
    return this.#currentEntity;
  }
}
