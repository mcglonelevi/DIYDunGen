import DungeonMap from "../models/DungeonMap";
import BasicGenerator from "./BasicGenerator";
import PRNG from "prng";
import Room from "./helpers/Room";
import Side from "../models/Side";
import Item from "../models/Item";

// This generation strategy places rooms first -- other areas are open hallways
export default class RoomsFirst extends BasicGenerator {
  constructor(seed = 15) {
    super();
    this.map = new DungeonMap([super.generateBlankLevel()]);
    this.level = this.map.levels[0];
    this.prng = new PRNG(seed);
  }

  generate() {
    const numberOfRooms = this.prng.rand(2, 6);
    const rooms = this.generateRooms(numberOfRooms);

    rooms.forEach((room) => {
      for (let x = room.offsetX; x < room.offsetX + room.width; x++) {
        for (let y = room.offsetY; y < room.offsetY + room.height; y++) {
          this.level.cubes[y][x].bottom = Side.STONE;
          if (x == room.offsetX) {
            this.level.cubes[y][x].left = Side.STONE;
          }
          if (x == room.offsetX + room.width - 1) {
            this.level.cubes[y][x].right = Side.STONE;
          }
          if (y == room.offsetY) {
            this.level.cubes[y][x].front = Side.STONE;
          }
          if (y == room.offsetY + room.height - 1) {
            this.level.cubes[y][x].back = Side.STONE;
          }
        }
      }
    });

    // now that we have our rooms placed, time to generate some doors
    rooms.forEach((room) => {
      const doorWayCubes = room.getCubesForDoorway(this.level);
      const doorWayCubesArray = [...doorWayCubes.front, ...doorWayCubes.back, ...doorWayCubes.left, ...doorWayCubes.right];
      const doorCube = doorWayCubesArray[this.prng.rand(doorWayCubesArray.length - 1)];

      // now that we have our door cube, we need to determine what direction it is in relative to the room, we'll use this to place the door
      if (doorWayCubes.front.includes(doorCube)) {
        this.level.cubes[doorCube.y + 1][doorCube.x].front = Side.DOOR;
      }
      if (doorWayCubes.back.includes(doorCube)) {
        this.level.cubes[doorCube.y - 1][doorCube.x].back = Side.DOOR;
      }
      if (doorWayCubes.left.includes(doorCube)) {
        this.level.cubes[doorCube.y][doorCube.x + 1].left = Side.DOOR;
      }
      if (doorWayCubes.right.includes(doorCube)) {
        this.level.cubes[doorCube.y][doorCube.x - 1].right = Side.DOOR;
      }
    });

    const items = [
      Item.CHEST,
      Item.TABLE,
      Item.BOX,
      Item.LEVER,
      Item.BOOKSHELF,
      Item.KEY,
      Item.DART_TRAP,
      Item.LADDER,
      Item.HOLE,
      Item.ENEMY,
      Item.PILLAR,
      Item.START,
    ];

    for (let i = 0; i < items.length; i++) {
      this.level.cubes[0][i].item = items[i];
    }

    return this.map;
  }

  generateRooms(numberOfRooms) {
    const rooms = [];

    for (let i = 0; i < numberOfRooms; i++) {
      const roomWidth = this.prng.rand(Math.floor(this.level.width / (i + 3)), Math.floor(this.level.width / (i + 2)));
      const roomHeight = this.prng.rand(Math.floor(this.level.height / (i + 3)), Math.floor(this.level.height / (i + 2)));
      const room = new Room(
        roomWidth,
        roomHeight,
        this.prng.rand(this.level.width - roomWidth),
        this.prng.rand(this.level.height - roomHeight),
      );

      // We'll try to place the room 5 times.
      for (let attempts = 0; attempts < 5; attempts++) {
        // if the room is in bounds and does not intersect another room, we're good to go
        if (room.inBounds(this.level) && rooms.every((otherRoom) => !otherRoom.intersects(room))) {
          rooms.push(room);
          break;
        } else {
          room.offsetX = this.prng.rand(this.level.width - roomWidth);
          room.offsetY = this.prng.rand(this.level.height - roomHeight);
        }
      }
    }

    return rooms;
  }
}

