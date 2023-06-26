import Constants from "./Constants";
import GameManager from "./GameManager";

export default class ShopMenu extends HTMLElement {
  constructor() {
    super();

    this.maxWeaponLv = Constants.get("maxWeaponLevel");
    this.weaponPrices = Constants.get("weaponCost");
    this.playerRef = null;

    // create ui
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

    // buttons row
    const buttonsRow = document.createElement("div");
    buttonsRow.classList.add("buttons_row");
    menuContent.appendChild(buttonsRow);
    this.upgradeButton = document.createElement("div");
    this.upgradeButton.innerHTML = "Upgrade";
    buttonsRow.appendChild(this.upgradeButton);
    this.upgradeButton.addEventListener("click", () => {
      this.upgradeWeapon();
    });
    const closeButton = document.createElement("div");
    closeButton.innerHTML = "Leave";
    buttonsRow.appendChild(closeButton);
    closeButton.addEventListener("click", () => {
      this.closeMenu();
    });

    this.appendChild(menuContent);
  }

  openMenu(player) {
    this.playerRef = player;
    this.updateMenu();
    this.classList.add("open");
  }

  updateMenu() {
    const currentWeaponLv = this.playerRef.weaponLv;
    this.menuTitle.innerHTML = "Weapon at maximum";
    this.currentWeaponUI.src = "/assets/ui/sword_" + currentWeaponLv + ".png";

    this.upgradeButton.className = "";
    this.upgradeCostText.innerHTML = "0";
    this.nextWeaponUI.src = "";
    if (currentWeaponLv < this.maxWeaponLv) {
      this.menuTitle.innerHTML = "Upgrade weapon?";
      this.upgradeCostText.innerHTML = this.weaponPrices[currentWeaponLv];
      this.nextWeaponUI.src =
        "/assets/ui/sword_" + (currentWeaponLv + 1) + ".png";
      return;
    }
    if (
      GameManager.getInstance().currentGold <
      this.weaponPrices[currentWeaponLv + 1]
    )
      this.upgradeButton.classList.add("locked");
  }

  closeMenu() {
    this.playerRef = null;
    this.classList.remove("open");

    GameManager.getInstance().playerExitFromCity();
  }

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
