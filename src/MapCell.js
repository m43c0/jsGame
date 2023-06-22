export default class MapCell extends HTMLElement {
  static CellType = { GRASS: "grass", TREE: "tree", ROCK: "rock" };
  constructor(cellX, cellY, type) {
    super();

    this.x = cellX;
    this.y = cellY;

    this.cellType = type;
    this.classList.add(type + "_" + (Math.floor(Math.random() * 3) + 1));

    this.isWalkable = true;
    if (type == MapCell.CellType.ROCK) this.isWalkable = false;

    this.currentEntity = null;
  }
  getX() {
    return this.x;
  }
}
