import "./styles.css";
import Grid from "./Grid";
import RoomsFirst from "./generators/RoomsFirst";
import {useState} from 'react';

export default function App() {
  const [seed, setSeed] = useState(15);
  const generator = new RoomsFirst(seed);
  const map = generator.generate();
  return (
    <div className="App">
      <Grid level={map.levels[0]} />
      <input
        value={seed}
        onChange={(e) => {
          setSeed(parseInt(e.target.value));
        }}
        type="number"
      />
    </div>
  );
}
