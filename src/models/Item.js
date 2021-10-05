export default class Item {
  static CHEST = new Item('CHEST');
  static TABLE = new Item('TABLE');
  static BOX = new Item('BOX');
  static LEVER = new Item('LEVER');
  static BOOKSHELF = new Item('BOOKSHELF');
  static KEY = new Item('KEY');
  static DART_TRAP = new Item('DART_TRAP');
  static LADDER = new Item('LADDER');
  static HOLE = new Item('HOLE');
  static ENEMY = new Item('ENEMY');
  static PILLAR = new Item('PILLAR');
  static START = new Item('START');

  constructor(itemName) {
    this.itemName = itemName;
  }
}
