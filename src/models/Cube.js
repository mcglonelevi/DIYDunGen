import Side from "./Side";

export default class Cube {
  constructor({
    front = Side.AIR,
    back = Side.AIR,
    left = Side.AIR,
    right = Side.AIR,
    top = Side.AIR,
    bottom = Side.AIR,
    item = null,
    x = 0,
    y = 0,
  } = {}) {
    this.front = front;
    this.back = back;
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.item = item;
    this.x = x;
    this.y = y;
    this.lightLevel = 0;
  }

  hasWall() {
    return [this.front, this.back, this.left, this.right].some((wall) => wall === Side.STONE);
  }

  hasTorch() {
    return [this.front, this.back, this.left, this.right].some((wall) => wall === Side.STONE_WALL_TORCH);
  }

  hasDartTrap() {
    return [this.front, this.back, this.left, this.right].some((wall) => wall === Side.STONE_WALL_DART_TRAP);
  }

  getSidesWithWall() {
    return [
      this.front === Side.STONE ? 'front' : null,
      this.back === Side.STONE ? 'back' : null,
      this.left === Side.STONE ? 'left' : null,
      this.right === Side.STONE ? 'right' : null,
    ].filter((v) => !!v);
  }

  getSideWithTorch() {
    return [
      this.front === Side.STONE_WALL_TORCH ? 'front' : null,
      this.back === Side.STONE_WALL_TORCH ? 'back' : null,
      this.left === Side.STONE_WALL_TORCH ? 'left' : null,
      this.right === Side.STONE_WALL_TORCH ? 'right' : null,
    ].filter((v) => !!v)[0];
  }

  getSideWithDartTrap() {
    return [
      this.front === Side.STONE_WALL_DART_TRAP ? 'front' : null,
      this.back === Side.STONE_WALL_DART_TRAP ? 'back' : null,
      this.left === Side.STONE_WALL_DART_TRAP ? 'left' : null,
      this.right === Side.STONE_WALL_DART_TRAP ? 'right' : null,
    ].filter((v) => !!v)[0];
  }
}
