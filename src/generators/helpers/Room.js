import Side from "../../models/Side";
import Item from "../../models/Item";
import LootCategory from "./LootCategory";
import LootTable from "./LootTable";

export default class Room {
  static CATEGORIES = {
    SM: "SM",
    M: "M",
    L: "L",
    XL: "XL",
  };

  static DISPOSITIONS = {
    BIG_FIGHT: "BIG_FIGHT",
    SMALL_FIGHT: "SMALL_FIGHT",
    LOOT: "LOOT",
    ADVANCE: "ADVANCE",
    ENTRY: "ENTRY",
    HALLWAY: "HALLWAY",
  };

  static DISPOSITION_MAPPINGS = {
    [Room.CATEGORIES.SM]: [
      Room.DISPOSITIONS.LOOT,
      Room.DISPOSITIONS.ADVANCE,
    ],
    [Room.CATEGORIES.M]: [
      Room.DISPOSITIONS.LOOT,
      Room.DISPOSITIONS.ADVANCE,
      Room.DISPOSITIONS.SMALL_FIGHT,
    ],
    [Room.CATEGORIES.L]: [
      Room.DISPOSITIONS.SMALL_FIGHT,
    ],
    [Room.CATEGORIES.XL]: [
      Room.DISPOSITIONS.BIG_FIGHT,
    ],
  };

  static DISPOSITION_LOOT_MAPPINGS = {
    [Room.DISPOSITIONS.BIG_FIGHT]: [
      {
        possibleItems: [Item.ENEMY],
        min: 2,
        max: 4,
      },
      {
        possibleItems: [Item.CHEST, Item.BOX],
        min: 0,
        max: 1,
      },
      {
        possibleItems: [Item.PILLAR],
        min: 4,
        max: 8,
      },
    ],
    [Room.DISPOSITIONS.SMALL_FIGHT]: [
      {
        possibleItems: [Item.ENEMY],
        min: 1,
        max: 2,
      },
      {
        possibleItems: [Item.CHEST, Item.BOX, Item.BOOKSHELF],
        min: 0,
        max: 1,
      },
      {
        possibleItems: [Item.PILLAR],
        min: 0,
        max: 2,
      },
    ],
    [Room.DISPOSITIONS.LOOT]: [
      {
        possibleItems: [Item.DART_TRAP],
        min: 0,
        max: 1,
      },
      {
        possibleItems: [Item.CHEST, Item.BOX, Item.BOOKSHELF],
        min: 1,
        max: 2,
      },
    ],
    [Room.DISPOSITIONS.ADVANCE]: [
      {
        possibleItems: [Item.LADDER, Item.LEVER, Item.HOLE, Item.KEY],
        min: 1,
        max: 1,
      },
    ],
    [Room.DISPOSITIONS.ENTRY]: [
      {
        possibleItems: [Item.START],
        min: 1,
        max: 1,
      },
    ],
    [Room.DISPOSITIONS.HALLWAY]: [
      {
        possibleItems: [Item.ENEMY, Item.CHEST, Item.BOX, Item.DART_TRAP],
        min: 0,
        max: 3,
      },
    ],
  };

  constructor(width, height, offsetX, offsetY, map, disposition = null) {
    this.width = width;
    this.height = height;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.map = map;
    this.disposition = disposition === null ? this.generateDisposition() : disposition;
    this.lootTable = this.generateLootTable();
    this.loot = this.lootTable.generateLoot();
    this.placements = this.generatePlacements();
  }

  get corners() {
    return [
      {x: this.offsetX, y: this.offsetY},
      {x: this.offsetX + this.width, y: this.offsetY},
      {x: this.offsetX, y: this.offsetY + this.height},
      {x: this.offsetX + this.width, y: this.offsetY + this.height},
    ];
  }

  get minCorner() {
    return {
      x: this.offsetX,
      y: this.offsetY,
    };
  }

  get maxCorner() {
    return {
      x: this.offsetX + this.width,
      y: this.offsetY +  this.height,
    };
  }

  get roomSize() {
    return this.width * this.height;
  }

  get category() {
    switch (true) {
      case this.roomSize <= 12:
        return Room.CATEGORIES.SM;
      case this.roomSize <= 20:
        return Room.CATEGORIES.M;
      case this.roomSize <= 48:
        return Room.CATEGORIES.L;
      default:
        return Room.CATEGORIES.XL;
    }
  }

  generateDisposition() {
    const possibleDispositions = Room.DISPOSITION_MAPPINGS[this.category];
    const selection = this.map.prng.rand([possibleDispositions.length - 1]);
    return possibleDispositions[selection];
  }

  generateLootTable() {
    const mappings = Room.DISPOSITION_LOOT_MAPPINGS[this.disposition];
    const lootCategories = mappings.map(({min, max, possibleItems}) => {
      return new LootCategory(possibleItems, min, max, this.map.prng);
    });
    return new LootTable(lootCategories);
  }

  // this method will generate the placements of items in the room by using relative offsets
  generatePlacements() {
    const numberOfPlacementsToGenerate = this.loot.length;
    const placements = [];

    for (let i = 0; i < numberOfPlacementsToGenerate; i++) {
      let placement = {
        x: this.map.prng.rand(this.width - 1),
        y: this.map.prng.rand(this.height - 1),
      };

      while (!!placements.find((p) => { p.x === placement.x && p.y === placement.y })) {
        placement = {
          x: this.map.prng.rand(this.width - 1),
          y: this.map.prng.rand(this.height - 1),
        }
      }

      placements.push(placement);
    }

    return placements;
  }

  intersects(otherRoom) {
    const minCorner = this.minCorner;
    const maxCorner = this.maxCorner;
    
    // check if one room contains a corner from another room or if the other room contains a corner from this room. Also check if two or more corners are the same.
    return otherRoom.corners.some(({x, y}) => {
      return x >= minCorner.x && x <= maxCorner.x && y >= minCorner.y && y <= maxCorner.y;
    }) || this.corners.some(({x, y}) => {
      return x >= otherRoom.minCorner.x && x <= otherRoom.maxCorner.x && y >= otherRoom.minCorner.y && y <= otherRoom.maxCorner.y;
    });
  }

  inBounds(level) {
    const maxCorner = this.maxCorner;
    return maxCorner.x <= level.width && maxCorner.y <= level.height;
  }

  // returns an object containing 4 arrays with cubes on each side
  getCubesOutsideBorder(level) {
    const minOutsideCorner = {
      x: this.minCorner.x - 1,
      y: this.minCorner.y - 1,
    }
    const maxOutsideCorner = {
      x: this.maxCorner.x,
      y: this.maxCorner.y,
    }

    const returnValue = {
      front: [],
      back: [],
      left: [],
      right: [],
    };

    // populate top values
    for (let x = minOutsideCorner.x + 1; x < maxOutsideCorner.x; x++) {
      try {
        returnValue.front.push(level.cubes[minOutsideCorner.y][x]);
      } catch (e) {

      }
    }

    // populate bottom values
    for (let x = minOutsideCorner.x + 1; x < maxOutsideCorner.x; x++) {
      try {
        returnValue.back.push(level.cubes[maxOutsideCorner.y][x]);
      } catch(e) {

      }
    }

    // populate left and right values
    for (let y = minOutsideCorner.y + 1; y < maxOutsideCorner.y; y++) {
      try {
        returnValue.left.push(level.cubes[y][minOutsideCorner.x]);
      } catch(e) {

      }

      try {
        returnValue.right.push(level.cubes[y][maxOutsideCorner.x]);
      } catch(e) {
        console.log(`ERROR: ${maxOutsideCorner.x}, ${y}`);
      }
    }

    return returnValue;
  }

  getCubesForDoorway(level) {
    const groupedCubes = this.getCubesOutsideBorder(level);
    groupedCubes.front = groupedCubes.front.filter((i) => !!i && i.back === Side.AIR);
    groupedCubes.back = groupedCubes.back.filter((i) => !!i && i.front === Side.AIR);
    groupedCubes.left = groupedCubes.left.filter((i) => !!i && i.right === Side.AIR);
    groupedCubes.right = groupedCubes.right.filter((i) => !!i && i.left === Side.AIR);
    
    return groupedCubes;
  }
}
