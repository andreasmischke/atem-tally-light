import { FC } from "react";
import { AtemConnectionGuard, TallyView } from "..";

export const App: FC = () => {
  return (
    <AtemConnectionGuard>
      <TallyView />
    </AtemConnectionGuard>
  );
};
