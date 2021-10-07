import Item from './models/Item';

function getFloorColor(side) {
  switch (side.materialName) {
    case "STONE":
      return '#888 url("img/stone-texture.png")';
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
    case "STONE_WALL_DART_TRAP":
    case "STONE_WALL_TORCH":
    case "STONE":
      return "#111";
    case "AIR":
      return bottom.materialName === "AIR" ? "transparent" : "rgba(0, 0, 0, 0.1)";
    case "DOOR":
      return "rgb(203 107 0)";
    default:
      throw new Error("INVALD SIDE TYPE");
  }
}

function Torch({cube}) {
  const side = cube.getSideWithTorch();

  return <img className={`torch torch-${side}`} src="img/flame.gif" />;
}

function DartTrap({cube}) {
  const side = cube.getSideWithDartTrap();

  return <img className={`dart-trap dart-trap-${side}`} src="img/dart_trap.svg" />;
}

function calculateBrightness(cube) {
  const brightness = 80 + (cube.lightLevel * 10);
  return `brightness(${brightness}%)`;
}

export default function Box({ cube, debug = false } = {}) {
  return (
    <div
      className="pixel"
      style={{
        background: getFloorColor(cube.bottom),
        borderTopColor: getWallColor(cube.front, cube.bottom),
        borderBottomColor: getWallColor(cube.back, cube.bottom),
        borderLeftColor: getWallColor(cube.left, cube.bottom),
        borderRightColor: getWallColor(cube.right, cube.bottom),
        filter: calculateBrightness(cube),
      }}
      onClick={() => {
        if (cube.item && Item.ITEM_LINKS.has(cube.item)) {
          window.open(Item.ITEM_LINKS.get(cube.item), '_blank');
        }
      }}
    >
      {debug && `${cube.x},${cube.y}`}
      {cube.item && <img className="item" src={`img/${cube.item.itemName.toLowerCase()}.svg`} />}
      {cube.hasTorch() && <Torch cube={cube} />}
      {cube.hasDartTrap() && <DartTrap cube={cube} />}
    </div>
  );
}
