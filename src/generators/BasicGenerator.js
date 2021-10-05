import Level from "../models/Level";
import Cube from "../models/Cube";
import Side from "../models/Side";

export default class BasicGenerator {
  generateBlankLevel() {
    const cubes = [];
  
    for (let i = 0; i < 18; i++) {
      cubes[i] = [];
      for (let j = 0; j < 24; j++) {
        cubes[i][j] = new Cube({
          bottom: Side.STONE,
          x: j,
          y: i,
        });
      }
    }

    cubes[0].forEach((c) => {
      c.front = Side.STONE;
    });
    cubes[cubes.length - 1].forEach((c) => {
      c.back = Side.STONE;
    });
    for (let row = 0; row < cubes.length; row++) {
      cubes[row][0].left = Side.STONE;
      cubes[row][cubes[row].length - 1].right = Side.STONE;
    }

    return new Level(cubes);
  }
}