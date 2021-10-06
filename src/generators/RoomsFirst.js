import DungeonMap from "../models/DungeonMap";
import BasicGenerator from "./BasicGenerator";
import Room from "./helpers/Room";
import Side from "../models/Side";
import LootCategory from "./helpers/LootCategory";
import LootTable from "./helpers/LootTable";

// This generation strategy places rooms first -- other areas are open hallways
export default class RoomsFirst extends BasicGenerator {
  constructor(seed = 62343466) {
    super();
    this.map = new DungeonMap(seed);
    this.level = super.generateBlankLevel(this.map);
    this.map.levels.push(this.level);
    this.cachedDoorCubes = [];
  }

  generate() {
    const numberOfRooms = this.map.prng.rand(4, 6);
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

      const numberOfDoors = this.map.prng.rand(1, room.roomSize > 30 ? 2 : 1);

      for (let i = 0; i < numberOfDoors; i++) {
        const doorCube = doorWayCubesArray[this.map.prng.rand(doorWayCubesArray.length - 1)];

        this.cachedDoorCubes.push(doorCube); // We cache these for lookup later

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

    this.generateHallways();
    this.placeTorches();

    return this.map;
  }

  placeTorches() {
    const cubes = this.level.cubes.flat();
    const cubesWithWall = cubes.filter((c) => c.hasWall())
    const cubesWithTorch = [];

    // place torches
    cubesWithWall.forEach((c) => {
      const value = this.map.prng.rand(0, 99);
      const shouldPlace = value <= 10;
      if (shouldPlace) {
        const wall = c.getSidesWithWall()[0];
        c[wall] = Side.STONE_WALL_TORCH;
        cubesWithTorch.push(c)
      }
    });

    // now let's calculate some light levels
    cubesWithTorch.forEach((c) => {
      const {nearestNeighbors, distantNeighbors} = this.getNeighborsForLighting(c); // we can abuse the hallway code to find neighbors nearby
      c.lightLevel = Math.min(6, c.lightLevel + 6);
      nearestNeighbors.forEach((n) => {
        n.lightLevel = Math.min(6, n.lightLevel + 4);
      });
      distantNeighbors.forEach((n) => {
        n.lightLevel = Math.min(6, n.lightLevel + 2);
      });
    });
  }

  generateRooms(numberOfRooms) {
    const rooms = [];

    // generate other rooms
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
        this.map,
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

  generateHallways() {
    const cubesToCheck = []; // we need to fill in walls for these at the end
    // we're going to randomly sort the doors to get some fun maze effects
    const doors = [...this.cachedDoorCubes].sort(() => {
      this.map.prng.rand(0, 2) > 1 ? 1 : -1;
    });
    // start by path-finding some hallways
    for (let i = 0; i < doors.length - 1; i++) {
      const startingCube = doors[i];
      const endingCube = doors[i + 1];

      let currentCube = startingCube;
      let breadCrumbs = [currentCube];
      let visited = [currentCube];
      
      while (currentCube != endingCube) {
        // Find open block
        let openBlocks = this.getNeighborsOpenForHallway(currentCube).filter((i) => !visited.includes(i));

        // if open blocks is empty, then we know that we need to backtrack to the last cube that has neighbors
        while (openBlocks.length === 0) {
          // pop off breadcrumb to retrace our steps
          breadCrumbs.pop();
          currentCube = breadCrumbs[breadCrumbs.length - 1];
          openBlocks = this.getNeighborsOpenForHallway(currentCube).filter((i) => !visited.includes(i));
        }

        const newCube = this.findNeighborClosestToEnd(endingCube, openBlocks);
        newCube.bottom = Side.STONE;
        currentCube = newCube;
        breadCrumbs.push(currentCube);
        visited.push(currentCube);
      }

      breadCrumbs.forEach((cube) => {
        cube.bottom = Side.STONE;
      });
      cubesToCheck.push(...breadCrumbs);
    }

    // fill in the walls for these
    cubesToCheck.forEach((cube) => {
      const {left, right, front, back} = this.getNeighbors(cube);

      if (!left || left.bottom === Side.AIR || left.right === Side.STONE) {
        cube.left = Side.STONE;
      }
      if (!right || right.bottom === Side.AIR || right.left === Side.STONE) {
        cube.right = Side.STONE;
      }
      if (!front || front.bottom === Side.AIR || front.back === Side.STONE) {
        cube.front = Side.STONE;
      }
      if (!back || back.bottom === Side.AIR || back.front === Side.STONE) {
        cube.back = Side.STONE;
      }
    });

    // let's throw some loot, traps, and enemies in the hallways
    const mappings = Room.DISPOSITION_LOOT_MAPPINGS[Room.DISPOSITIONS.HALLWAY];
    const lootCategories = mappings.map(({min, max, possibleItems}) => {
      return new LootCategory(possibleItems, min, max, this.map.prng);
    });
    const lootTable = new LootTable(lootCategories);
    const loot = lootTable.generateLoot();

    for (let i = 0; i < loot.length; i++) {
      const hallwaySpots = cubesToCheck.filter((i) => !this.cachedDoorCubes.includes(i)); // filter for spots in the hallway that are not next to a door
      const cube = hallwaySpots[this.map.prng.rand(hallwaySpots.length - 1)]
      cube.item = loot[i];
    }
  }

  findNeighborClosestToEnd(endCube, openBlocks) {
    const distanceArray = openBlocks.map((cube) => {
      return {
        distance: Math.sqrt(Math.pow(endCube.x - cube.x, 2) + Math.pow(endCube.y - cube.y, 2)),
        cube,
      };
    });

    const sortedArray = distanceArray.sort((first, second) => {
      return first.distance < second.distance ? -1 : 1;
    });

    return sortedArray[0].cube;
  }
  
  getCube(x, y) {
    try {
      return this.level.cubes[y][x] || null;
    } catch(e) {
      return null;
    }
  }

  getNeighborsForLighting(cubeWithTorch) {
    // we're going to do a 2-pass grab of neighbors
    const nearestNeighbors = this.getNeighborsOpenForHallway(cubeWithTorch);
    const farNeighbors = [];

    // loop over the nearest neighbors to build up far neighbors
    nearestNeighbors.forEach((nn) => {
      farNeighbors.push(...this.getNeighborsOpenForHallway(nn));
    });

    // the problem now is that we have duplicated neighbors in the far neighbors bucket, so let's remove nearest neighbors and cubeWithTorch from that list.
    const filteredFarNeighbors = farNeighbors.filter((i) => i != cubeWithTorch && !nearestNeighbors.includes(i));

    return {
      nearestNeighbors,
      distantNeighbors: filteredFarNeighbors,
    };
  }

  getNeighborsOpenForHallway(cube) {
    const { left, right, front, back } = this.getNeighbors(cube);
    const options = [];

    if (left && left.right === Side.AIR) {
      options.push(left);
    }
    if (right && right.left === Side.AIR) {
      options.push(right);
    }
    if (front && front.back === Side.AIR) {
      options.push(front);
    }
    if (back && back.front === Side.AIR) {
      options.push(back);
    }

    return options;
  }

  getNeighbors(cube) {
    return {
      right: this.getCube(cube.x + 1, cube.y),
      left: this.getCube(cube.x - 1, cube.y),
      front: this.getCube(cube.x, cube.y - 1),
      back: this.getCube(cube.x, cube.y + 1),
    };
  }

  findFirstCubeForHallway(cube) {
    if (cube.front === Side.DOOR) {
      return this.level.cubes[cube.y - 1][cube.x];
    } else if (cube.back === Side.DOOR) {
      return this.level.cubes[cube.y + 1][cube.x];
    } else if (cube.left === Side.DOOR) {
      return this.level.cubes[cube.y][cube.x - 1];
    } else if (cube.right === Side.DOOR) {
      return this.level.cubes[cube.y][cube.x + 1];
    }
  }
}
