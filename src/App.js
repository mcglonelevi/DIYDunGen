import "./styles.css";
import Grid from "./Grid";
import Caves from "./generators/Caves";
import RoomsFirst from "./generators/RoomsFirst";
import {useState} from 'react';

export default function App() {
  const [seed, setSeed] = useState(15);
  const [algorithm, setAlgorithm] = useState("ROOMS_FIRST");
  const generator = algorithm === "ROOMS_FIRST" ? new RoomsFirst(seed) : new Caves(seed);
  const map = generator.generate();
  return (
    <div className="App">
      <img src="img/logo.png" width="300" />
      <Grid level={map.levels[0]} />
      <input
        value={seed}
        onChange={(e) => {
          setSeed(parseInt(e.target.value));
        }}
        type="number"
      />
      <select value={algorithm} onChange={(e) => {
        setAlgorithm(e.target.value);
      }}>
        <option value="ROOMS_FIRST">ROOMS FIRST</option>
        <option value="CAVES">CAVES</option>
      </select>
    </div>
  );
}
