export default class Side {
  static DOOR = new Side("DOOR");
  static STONE = new Side("STONE");
  static LAVA = new Side("LAVA");
  static AIR = new Side("AIR");
  static DOOR = new Side("DOOR");
  static STONE_WALL_TORCH = new Side("STONE_WALL_TORCH");
  static STONE_WALL_DART_TRAP = new Side("STONE_WALL_DART_TRAP");

  constructor(materialName) {
    this.materialName = materialName;
  }
}
