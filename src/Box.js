function getFloorColor(side) {
  switch (side.materialName) {
    case "STONE":
      return "#aaa";
    case "LAVA":
      return "#f00";
    case "AIR":
      return "transparent";
    default:
      throw new Error("INVALD SIDE TYPE");
  }
}

function getWallColor(side, bottom) {
  switch (side.materialName) {
    case "STONE":
      return "#333";
    case "AIR":
      return bottom.materialName === "AIR" ? "transparent" : "rgba(0, 0, 0, 0.1)";
    case "DOOR":
      return "rgb(203 107 0)";
    default:
      throw new Error("INVALD SIDE TYPE");
  }
}

export default function Box({ cube }) {
  return (
    <div
      className="pixel"
      style={{
        backgroundColor: getFloorColor(cube.bottom),
        borderTopColor: getWallColor(cube.front, cube.bottom),
        borderBottomColor: getWallColor(cube.back, cube.bottom),
        borderLeftColor: getWallColor(cube.left, cube.bottom),
        borderRightColor: getWallColor(cube.right, cube.bottom),
      }}
    >
      {/* {`${cube.x},${cube.y}`} */}
      {cube.item && <img src={`img/${cube.item.itemName.toLowerCase()}.svg`} />}
    </div>
  );
}
