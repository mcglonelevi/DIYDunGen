import Side from "../../models/Side";

export default class Room {
  constructor(width, height, offsetX, offsetY) {
    this.width = width;
    this.height = height;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
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

  intersects(otherRoom) {
    const minCorner = this.minCorner;
    const maxCorner = this.maxCorner;
    
    // check if one room contains a corner from another room or if the other room contains this corner.
    return otherRoom.corners.some(({x, y}) => {
      return x > minCorner.x && x < maxCorner.x && y > minCorner.y && y < maxCorner.y;
    }) || this.corners.some(({x, y}) => {
      return x > otherRoom.minCorner.x && x < otherRoom.maxCorner.x && y > otherRoom.minCorner.y && y < otherRoom.maxCorner.y;
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
    groupedCubes.front = groupedCubes.front.filter((i) => i.back === Side.AIR);
    groupedCubes.back = groupedCubes.back.filter((i) => i.front === Side.AIR);
    groupedCubes.left = groupedCubes.left.filter((i) => i.right === Side.AIR);
    groupedCubes.right = groupedCubes.right.filter((i) => i.left === Side.AIR);
    return groupedCubes;
  }
}
