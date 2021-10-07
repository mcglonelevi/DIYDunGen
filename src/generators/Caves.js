import DungeonMap from "../models/DungeonMap";
import BasicGenerator from "./BasicGenerator";
import SimplexNoise from 'simplex-noise';
import Room from "./helpers/Room";
import Side from "../models/Side";
import LootCategory from "./helpers/LootCategory";
import LootTable from "./helpers/LootTable";
import Item from "../models/Item";

// This generation strategy places rooms first -- other areas are open hallways
export default class Caves extends BasicGenerator {
  constructor(seed = 62343466) {
    super();
    this.map = new DungeonMap(seed);
    this.level = super.generateBlankLevel(this.map);
    this.map.levels.push(this.level);
    this.simplex = new SimplexNoise(seed);
    this.stoneCubes = new Set();
    this.airCubes = new Set();
    this.islands = null;
    this.lootTable = new LootTable([
      new LootCategory([Item.START], 1, 1, this.map.prng),
      new LootCategory([Item.ENEMY], 3, 5, this.map.prng),
      new LootCategory([Item.HOLE, Item.CHEST, Item.BOX, Item.TABLE], 5, 8, this.map.prng),
      new LootCategory([Item.MIMIC], 0, 2, this.map.prng),
    ]);
    this.loot = this.lootTable.generateLoot();
  }

  generate() {
    this.generateSimplexNoiseBlocks();
    this.deleteOrphans();

    this.islands = this.findIslands();
    this.mergeIslands();

    this.placeLoot();
    this.placeLanterns();

    return this.map;
  }

  findIslands() {
    const islands = [];
    const stoneBlocks = [...this.stoneCubes];

    for (let i = 0; i < stoneBlocks.length; i++) {
      const block = stoneBlocks[i];
      // if the block we are looking at is in an island, we can skip.
      if (islands.some((i) => i.has(block))) {
        continue;
      }
      const island = new Set();

      let neighbors = this.getStoneNeighborsNotInIsland(block, island);
      while (neighbors.length > 0) {
        neighbors.forEach((n) => island.add(n));

        const newNeighbors = new Set();

        neighbors.forEach((n) => {
          const neighborsForBlock = this.getStoneNeighborsNotInIsland(n, island);
          neighborsForBlock.forEach((b) => {
            newNeighbors.add(b);
          });
        });

        neighbors = [...newNeighbors];
      }

      islands.push(island);
    }

    return islands;
  }

  // to merge the islands, we will find air blocks who have neighbors on both.
  mergeIslands() {
    console.log(this.islands.length > 1);
    while (this.islands.length > 1) {
      const [firstIsland, secondIsland, ...restIslands] = this.islands;
      const commonCube = [...this.airCubes].find((c) => {
        const notNullNeighbors = Object.values(this.getNeighbors(c)).filter(() => !!c);
        const firstIslandContainsNeighbors = [...firstIsland].some((c) => notNullNeighbors.includes(c));
        const secondIslandContainsNeighbors = [...secondIsland].some((c) => notNullNeighbors.includes(c));

        return firstIslandContainsNeighbors && secondIslandContainsNeighbors;
      });
      this.airCubes.delete(commonCube);
      this.stoneCubes.add(commonCube);
      commonCube.bottom = Side.STONE;
      this.islands = [new Set([commonCube, ...firstIsland, ...secondIsland]), ...restIslands];
    }
  }

  generateSimplexNoiseBlocks() {
    for (let y = 0; y < this.level.cubes.length; y++) {
      for (let x = 0; x < this.level.cubes[0].length; x++) {
        const heightValue = this.simplex.noise2D(x * 10, y * 10);
        // we track which values are stone and air for easy lookup later
        if (heightValue < 0.4) {
          this.level.cubes[y][x].bottom = Side.STONE;
          this.stoneCubes.add(this.level.cubes[y][x]);
        } else {
          this.airCubes.add(this.level.cubes[y][x]);
        }
      }
    }
  }

  deleteOrphans() {
    for (let y = 0; y < this.level.cubes.length; y++) {
      for (let x = 0; x < this.level.cubes[0].length; x++) {
        const cube = this.getCube(x, y);
        const neighbors = Object.values(this.getNeighbors(cube));

        if (neighbors.filter((c) => !c || c.bottom === Side.AIR).length === 4) {
          cube.bottom = Side.AIR;
          this.stoneCubes.delete(cube);
          this.airCubes.add(cube);
        }
      }
    }
  }

  getNeighbors(cube) {
    return {
      right: this.getCube(cube.x + 1, cube.y),
      left: this.getCube(cube.x - 1, cube.y),
      front: this.getCube(cube.x, cube.y - 1),
      back: this.getCube(cube.x, cube.y + 1),
    };
  }

  getStoneNeighborsNotInIsland(cube, island) {
    return Object.values(this.getNeighbors(cube)).filter((c) => !!c && c.bottom === Side.STONE && !island.has(c));
  }

  getCube(x, y) {
    try {
      return this.level.cubes[y][x] || null;
    } catch(e) {
      return null;
    }
  }

  placeLoot() {
    const placeableBlocks = [...this.stoneCubes];
    this.loot.forEach((item) => {
      let index = this.map.prng.rand(placeableBlocks.length - 1);

      while (placeableBlocks[index].item) {
        index = this.map.prng.rand(placeableBlocks.length - 1);
      }

      placeableBlocks[index].item = item;
    });
  }

  placeLanterns() {
    const placeableBlocks = [...this.stoneCubes].filter((c) => !c.item)
    const cubesWithLantern = [];

    // place torches
    placeableBlocks.forEach((c) => {
      if (this.map.prng.rand(0, 99) === 99) {
        cubesWithLantern.push(c);
        c.item = Item.LANTERN;
      }
    });

    // now let's calculate some light levels
    cubesWithLantern.forEach((c) => {
      const {nearestNeighbors, distantNeighbors} = this.getNeighborsForLighting(c); // we can abuse the hallway code to find neighbors nearby
      c.lightLevel = Math.min(6, c.lightLevel + 5);
      nearestNeighbors.forEach((n) => {
        n.lightLevel = Math.min(6, n.lightLevel + 3);
      });
      distantNeighbors.forEach((n) => {
        n.lightLevel = Math.min(6, n.lightLevel + 2);
      });
    });
  }

  getNeighborsForLighting(cubeWithTorch) {
    const nearIsland = new Set([cubeWithTorch]);
    // we're going to do a 2-pass grab of neighbors
    const nearestNeighbors = this.getStoneNeighborsNotInIsland(cubeWithTorch, nearIsland);
    const farNeighbors = [];

    // loop over the nearest neighbors to build up far neighbors
    nearestNeighbors.forEach((nn) => {
      farNeighbors.push(...this.getStoneNeighborsNotInIsland(nn, nearIsland));
    });

    // the problem now is that we have duplicated neighbors in the far neighbors bucket, so let's remove nearest neighbors and cubeWithTorch from that list.
    const filteredFarNeighbors = farNeighbors.filter((i) => i != cubeWithTorch && !nearestNeighbors.includes(i));

    return {
      nearestNeighbors,
      distantNeighbors: filteredFarNeighbors,
    };
  }
}
