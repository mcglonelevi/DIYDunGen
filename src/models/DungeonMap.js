import PRNG from "prng";

export default class DungeonMap {
  constructor(seed = 15) {
    this.levels = [];
    this.prng = new PRNG(seed);
  }
}
