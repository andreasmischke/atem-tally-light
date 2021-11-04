import { FC, useState } from "react";
import classNames from "classnames";
import styles from "./SettingsBar.module.scss";

interface SettingsBarProps {}

export const SettingsBar: FC<SettingsBarProps> = ({ children }) => {
  const [visible, setVisible] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <>
      <div className={styles.content} onClick={() => setVisible((x) => !x)}>
        {children}
      </div>
      <div
        className={classNames(styles.shadow, {
          [styles.shadowVisible]: settingsVisible,
        })}
        onClick={() => setSettingsVisible(false)}
      >
        <div
          className={classNames(styles.settingsPane, {
            [styles.settingsVisible]: settingsVisible,
          })}
        >
          Settings here
        </div>
      </div>
      <div className={classNames(styles.bar, { [styles.visible]: visible })}>
        <div className={styles.title}>Tally Light</div>
        <div
          className={styles.settingsLink}
          onClick={() => setSettingsVisible(true)}
        >
          Settings
        </div>
      </div>
    </>
  );
};
