export default class LootCategory {
  constructor(possibleItems, min, max, prng) {
    this.possibleItems = possibleItems;
    this.min = min;
    this.max = max;
    this.prng = prng;
  }

  generateLoot() {
    const loot = [];

    const numberOfItemsToGenerate = this.prng.rand(this.min, this.max);

    for (let i = 0; i < numberOfItemsToGenerate; i++) {
      loot.push(this.possibleItems[this.prng.rand(this.possibleItems.length - 1)]);
    }

    return loot;
  }
}