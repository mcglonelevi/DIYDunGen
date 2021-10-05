export default class Side {
  static DOOR = new Side("DOOR");
  static STONE = new Side("STONE");
  static LAVA = new Side("LAVA");
  static AIR = new Side("AIR");
  static DOOR = new Side("DOOR");

  constructor(materialName) {
    this.materialName = materialName;
  }
}
