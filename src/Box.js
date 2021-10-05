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

function getWallColor(side) {
  switch (side.materialName) {
    case "STONE":
      return "#333";
    case "AIR":
      return "transparent";
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
        borderTopColor: getWallColor(cube.front),
        borderBottomColor: getWallColor(cube.back),
        borderLeftColor: getWallColor(cube.left),
        borderRightColor: getWallColor(cube.right),
      }}
    >
      {/* {`${cube.x},${cube.y}`} */}
      {cube.item && <img src={`img/${cube.item.itemName.toLowerCase()}.svg`} />}
    </div>
  );
}
