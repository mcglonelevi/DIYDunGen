import Level from "../models/Level";
import Cube from "../models/Cube";
import Side from "../models/Side";

export default class BasicGenerator {
  generateBlankLevel() {
    const cubes = [];
  
    for (let i = 0; i < 15; i++) {
      cubes[i] = [];
      for (let j = 0; j < 15; j++) {
        cubes[i][j] = new Cube({
          bottom: Side.AIR,
          x: j,
          y: i,
        });
      }
    }

    return new Level(cubes);
  }
}