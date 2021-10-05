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
  }
}
