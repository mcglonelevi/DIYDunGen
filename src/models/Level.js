export default class Level {
  constructor(cubes) {
    this.cubes = cubes;
  }

  get width() {
    return this.cubes[0].length;
  }

  get height() {
    return this.cubes.length;
  }
}
