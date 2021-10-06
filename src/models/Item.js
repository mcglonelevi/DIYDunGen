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

  static ITEM_LINKS = new Map([
    [Item.CHEST, 'https://www.thingiverse.com/search?q=28mm+chest&type=things&sort=relevant'],
    [Item.BOX, 'https://www.thingiverse.com/search?q=28mm+crate&type=things&sort=relevant'],
    [Item.PILLAR, 'https://www.thingiverse.com/search?q=28mm+pillar&type=things&sort=relevant'],
    [Item.ENEMY, 'http://briteminis.com/'],
    [Item.LEVER, 'https://www.thingiverse.com/search?q=28mm+lever&type=things&sort=relevant'],
    [Item.DART_TRAP, 'https://www.thingiverse.com/search?q=spike+trap&type=things&sort=relevant'],
    [Item.KEY, 'https://www.thingiverse.com/thing:3023612'],
    [Item.HOLE, 'https://www.thingiverse.com/thing:3043099'],
    [Item.TABLE, 'https://www.thingiverse.com/search?q=28mm+table&type=things&sort=relevant'],
    [Item.BOOKSHELF, 'https://www.thingiverse.com/search?q=28mm+bookshelf&type=things&sort=relevant'],
    [Item.LADDER, 'https://www.thingiverse.com/search?q=ladder+dnd&type=things&sort=relevant'],
  ]);

  constructor(itemName) {
    this.itemName = itemName;
  }
}
