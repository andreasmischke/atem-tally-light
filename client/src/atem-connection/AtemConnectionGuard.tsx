import { PropsWithChildren } from "react";
import { useTallyLightClient } from "../tally-light-client/useTallyLightClient";
import styles from "./AtemConnectionGuard.module.scss";

export function AtemConnectionGuard({ children }: PropsWithChildren<{}>) {
  const connected = useTallyLightClient((state) => state.connected);

  if (connected) {
    return <>{children}</>;
  }

  return (
    <div className={styles.wrapper}>No Connection to ATEM Mini Switcher</div>
  );
}
