import { render } from "react-dom";
import { AtemConnectionGuard } from "./atem-connection/AtemConnectionGuard";
import { TallyView } from "./TallyView";
import { SettingsBar } from "./SettingsBar/SettingsBar";
import "./index.css";

function App() {
  return (
    <SettingsBar>
      <AtemConnectionGuard>
        <TallyView />
      </AtemConnectionGuard>
    </SettingsBar>
  );
}

render(<App />, document.getElementById("root"));
