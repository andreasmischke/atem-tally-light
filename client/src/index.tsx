import { render } from "react-dom";
import { AtemConnectionGuard } from "./atem-connection/AtemConnectionGuard";
import { TallyView } from "./TallyView";
import "./index.css";

function App() {
  return (
    <AtemConnectionGuard>
      <TallyView />
    </AtemConnectionGuard>
  );
}

render(<App />, document.getElementById("root"));
