import { render } from "react-dom";
import { AtemConnectionGuard } from "./atem-connection/AtemConnectionGuard";
import { TallyView } from "./TallyView";
import { SettingsBar } from "./SettingsBar/SettingsBar";
import "./index.css";

function App() {
  return (
    <AtemConnectionGuard>
      <SettingsBar>
        <TallyView />
      </SettingsBar>
    </AtemConnectionGuard>
  );
}

render(<App />, document.getElementById("root"));
