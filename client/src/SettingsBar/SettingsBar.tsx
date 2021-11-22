import { FC, useState } from "react";
import classNames from "classnames";
import styles from "./SettingsBar.module.scss";
import { useTallyLightClient } from "../tally-light-client";

export const SettingsBar: FC = ({ children }) => {
  const tallies = useTallyLightClient((state) => state.tallies);
  const selectTally = useTallyLightClient((state) => state.selectTally);
  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <>
      <div className={styles.content}>{children}</div>
      <div
        className={classNames(styles.shadow, {
          [styles.visible]: settingsVisible,
        })}
        onClick={() => setSettingsVisible((x) => !x)}
      >
        <div className={styles.settingsContainer}>
          <div className={styles.settingsTopBar}>
            <span className={styles.toggleIcon}>⚙</span>
            <span className={styles.closeIcon}>Close ✕</span>
          </div>
          <div
            className={classNames(styles.settingsPane, {
              [styles.settingsVisible]: settingsVisible,
            })}
          >
            Select tallies:
            <br />
            {tallies.map(({ inputId, longName, shortName, selected }) => (
              <label className={styles.settingTallySelection}>
                <input
                  type="checkbox"
                  onChange={(event) => {
                    event.bubbles = false;
                    selectTally(inputId, event.currentTarget.checked);
                  }}
                  checked={selected}
                />
                {longName} ({shortName})
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
