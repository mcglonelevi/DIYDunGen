import "./styles.css";
import Box from "./Box";

export default function Grid({ level }) {
  const boxWidth = level.cubes[0].length;
  const boxHeight = level.cubes.length;
  const elems = [];

  for (let i = 0; i < boxHeight; i++) {
    for (let j = 0; j < boxWidth; j++) {
      elems.push(<Box cube={level.cubes[i][j]} key={`x:${i}y:${j}`} />);
    }
  }

  return (
    <div
      className="grid"
      style={{
        width: `${boxWidth * 50}px`,
        height: `${boxHeight * 50}px`,
        gridTemplateColumns: `repeat(${boxWidth}, 50px)`
      }}
    >
      {elems}
    </div>
  );
}
