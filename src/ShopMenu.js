import Constants from "./Constants";
import GameManager from "./GameManager";

// class to manage the shopping menu that is showed when player enter a city.
// in this menu it is possible to upgrade the player's weapon and save the game
export default class ShopMenu extends HTMLElement {
  constructor() {
    super();

    // create and initialize the shop menu and all its elements
    // initially the menu will be hidden; when the player reaches a city, the GameManager
    // will call the openMenu method that will update menu data and display it on screen;
    // a reference to the player object is passed to the open method to access
    // some of its stats (eg: current player weapon level)

    this.maxWeaponLv = Constants.get("maxWeaponLevel");
    this.weaponPrices = Constants.get("weaponCost");
    this.playerRef = null;

    // create menu ui
    this.classList.add("shop_menu");

    const menuContent = document.createElement("div");
    menuContent.classList.add("shop_menu_content");

    this.menuTitle = document.createElement("div");
    menuContent.appendChild(this.menuTitle);

    // weapon upgrade row
    const weaponUpgradeRow = document.createElement("div");
    weaponUpgradeRow.classList.add("weapon_upgrade_row");
    menuContent.appendChild(weaponUpgradeRow);
    this.currentWeaponUI = document.createElement("img");
    this.currentWeaponUI.classList.add("current_weapon");
    weaponUpgradeRow.appendChild(this.currentWeaponUI);

    this.upgradeCostText = document.createElement("p");
    this.upgradeCostText.classList.add("cost_text");
    const arrows1 = document.createElement("span");
    arrows1.innerHTML = ">>";
    weaponUpgradeRow.appendChild(arrows1);
    weaponUpgradeRow.appendChild(this.upgradeCostText);
    const arrows2 = document.createElement("span");
    arrows2.innerHTML = ">>";
    weaponUpgradeRow.appendChild(arrows2);

    this.nextWeaponUI = document.createElement("img");
    this.nextWeaponUI.classList.add("next_weapon");
    weaponUpgradeRow.appendChild(this.nextWeaponUI);

    this.upgradeButton = document.createElement("div");
    this.upgradeButton.classList.add("btn");
    this.upgradeButton.innerHTML = "Upgrade";
    this.upgradeButton.addEventListener("click", () => {
      this.upgradeWeapon();
    });
    menuContent.appendChild(this.upgradeButton);

    // buttons row
    const buttonsRow = document.createElement("div");
    buttonsRow.classList.add("buttons_row");
    menuContent.appendChild(buttonsRow);
    this.saveButton = document.createElement("div");
    this.saveButton.innerHTML = "Save Game";
    this.saveButton.classList.add("btn");
    this.saveButton.classList.add("save_btn");
    buttonsRow.appendChild(this.saveButton);
    this.saveButton.addEventListener("click", () => {
      this.saveButton.classList.add("locked");
      GameManager.getInstance().saveGame(this.playerRef);
    });
    const closeButton = document.createElement("div");
    closeButton.innerHTML = "Leave";
    closeButton.classList.add("btn");
    buttonsRow.appendChild(closeButton);
    closeButton.addEventListener("click", () => {
      this.closeMenu();
    });

    // add all menu content to the ShopMenu HTMLElement
    this.appendChild(menuContent);
  }

  // method to display the menu
  // a reference to the player object is passed to the open method to access
  // some of its stats (eg: current player weapon level)
  openMenu(player) {
    this.playerRef = player;
    this.updateMenu();
    this.saveButton.classList.remove("locked");
    this.classList.add("open");
  }

  // update all menu stats (text) and buttons
  updateMenu() {
    const currentWeaponLv = this.playerRef.weaponLv;
    this.menuTitle.innerHTML = "Weapon at maximum";
    this.currentWeaponUI.src = "/assets/ui/sword_" + currentWeaponLv + ".png";

    this.upgradeButton.className = "btn";
    this.upgradeCostText.innerHTML = "0";
    this.nextWeaponUI.src = "";
    if (currentWeaponLv < this.maxWeaponLv) {
      this.menuTitle.innerHTML = "Upgrade weapon?";
      this.upgradeCostText.innerHTML = this.weaponPrices[currentWeaponLv];
      this.nextWeaponUI.src =
        "/assets/ui/sword_" + (currentWeaponLv + 1) + ".png";
    } else {
      this.upgradeButton.classList.add("locked");
      return;
    }

    if (
      GameManager.getInstance().currentGold < this.weaponPrices[currentWeaponLv]
    )
      this.upgradeButton.classList.add("locked");
  }

  // close menu and signals the GameManager that the player can be controlled again (the player has exited the city)
  closeMenu() {
    this.playerRef = null;
    this.classList.remove("open");

    GameManager.getInstance().playerExitFromCity();
  }

  // upgrade player weapon
  // if player has enough gold and doesn't already have the best weapon, remove gold and
  // update player weapon through its reference, then signals the GameManager to update the UI
  upgradeWeapon() {
    const currentWeaponLv = this.playerRef.weaponLv;
    if (
      currentWeaponLv >= this.maxWeaponLv ||
      GameManager.getInstance().currentGold < this.weaponPrices[currentWeaponLv]
    )
      return;

    GameManager.getInstance().addGold(-1 * this.weaponPrices[currentWeaponLv]);

    this.playerRef.weaponLv = currentWeaponLv + 1;
    GameManager.getInstance().updatePlayerWeaponUI(currentWeaponLv + 1);
    this.updateMenu();
  }
}
