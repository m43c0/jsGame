export default class MapCell extends HTMLElement {
  static CellType = { GRASS: "grass", TREE: "tree", ROCK: "rock" };
  constructor(cellX, cellY, type) {
    super();

    this.x = cellX;
    this.y = cellY;

    this.cellType = type;
    this.classList.add(type + "_" + (Math.floor(Math.random() * 3) + 1));

    this.currentEntity = null;
  }
}
