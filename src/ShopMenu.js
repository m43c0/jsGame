import GameManager from "./GameManager";

export default class ShopMenu extends HTMLElement {
  constructor() {
    super();

    // create ui
  }

  openMenu(player, currentGold) {}

  closeMenu() {
    // close menu ui

    GameManager.getInstance().playerExitFromCity();
  }
}
