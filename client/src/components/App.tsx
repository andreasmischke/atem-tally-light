import { FC } from "react";
import { AtemConnectionGuard } from "../atem-connection/AtemConnectionGuard";
import { TallyView } from "../TallyView/TallyView";

export const App: FC = () => {
  return (
    <AtemConnectionGuard>
      <TallyView />
    </AtemConnectionGuard>
  );
};
