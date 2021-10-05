export default class LootTable {
  constructor(lootCategories) {
    this.lootCategories = lootCategories;
  }

  generateLoot() {
    let loot = [];

    this.lootCategories.forEach(category => {
      loot = [...loot, ...category.generateLoot()]
    });

    return loot;
  }
}

