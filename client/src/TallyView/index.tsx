import { useTallyLightClient } from "../tally-light-client";
import cx from "classnames";
import styles from "./TallyView.module.scss";

export function TallyView() {
  const tallies = useTallyLightClient((state) => state.tallies);

  return (
    <div className={styles.wrapper}>
      {tallies
        .filter((tally) => tally.selected)
        .map((tally) => (
          <div
            className={cx(styles.tally, {
              [styles.isPreview]: tally.isPreview,
              [styles.isProgram]: tally.isProgram,
            })}
          >
            {tally.shortName}
          </div>
        ))}
    </div>
  );
}
