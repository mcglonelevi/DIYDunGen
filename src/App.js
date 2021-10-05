import "./styles.css";
import Grid from "./Grid";
import RoomsFirst from "./generators/RoomsFirst";

export default function App() {
  const generator = new RoomsFirst();
  const map = generator.generate();
  return (
    <div className="App">
      <Grid level={map.levels[0]} />
    </div>
  );
}
