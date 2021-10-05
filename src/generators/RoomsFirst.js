import DungeonMap from "../models/DungeonMap";
import BasicGenerator from "./BasicGenerator";
import Room from "./helpers/Room";
import Side from "../models/Side";

// This generation strategy places rooms first -- other areas are open hallways
export default class RoomsFirst extends BasicGenerator {
  constructor(seed = 14) {
    super();
    this.map = new DungeonMap(seed);
    this.level = super.generateBlankLevel(this.map);
    this.map.levels.push(this.level);
  }

  generate() {
    const numberOfRooms = this.map.prng.rand(4, 8);
    const rooms = this.generateRooms(numberOfRooms);

    // place the walls that define the room
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
      const doorCube = doorWayCubesArray[this.map.prng.rand(doorWayCubesArray.length - 1)];

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

    // now let's place the loot
    rooms.forEach((room) => {
      const loot = room.loot;
      const placements = room.placements;

      for (let i = 0; i < loot.length; i++) {
        let { x, y } = placements[i];
        // x and y are relative to room origin, so we'll account for that
        let cube = this.level.cubes[room.offsetY + y][room.offsetX + x];

        // try to find a spot not next to the door or already has an item
        while (cube.item || cube.front === Side.DOOR || cube.back === Side.DOOR || cube.left === Side.DOOR || cube.right === Side.DOOR) {
          x = this.map.prng.rand(room.width - 1);
          y = this.map.prng.rand(room.height - 1)
          cube = this.level.cubes[room.offsetY + y][room.offsetX + x];
        }

        cube.item = loot[i];
      }
    });

    return this.map;
  }

  generateRooms(numberOfRooms) {
    const rooms = [];

    for (let i = 0; i < numberOfRooms; i++) {
      const minWidth = Math.max(Math.floor(this.level.width / (i + 3)), 2);
      const minHeight = Math.max(Math.floor(this.level.height / (i + 3)), 2);
      const roomWidth = this.map.prng.rand(minWidth, Math.floor(this.level.width / (i + 2)));
      const roomHeight = this.map.prng.rand(minHeight, Math.floor(this.level.height / (i + 2)));
      const room = new Room(
        roomWidth,
        roomHeight,
        this.map.prng.rand(this.level.width - roomWidth),
        this.map.prng.rand(this.level.height - roomHeight),
        this.map
      );

      // We'll try to place the room 5 times.
      for (let attempts = 0; attempts < 5; attempts++) {
        // if the room is in bounds and does not intersect another room, we're good to go
        if (room.inBounds(this.level) && rooms.every((otherRoom) => !otherRoom.intersects(room))) {
          rooms.push(room);
          break;
        } else {
          room.offsetX = this.map.prng.rand(this.level.width - roomWidth);
          room.offsetY = this.map.prng.rand(this.level.height - roomHeight);
        }
      }
    }

    return rooms;
  }
}

