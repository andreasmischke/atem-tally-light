import { useState } from "react";
import cx from "classnames";
import { useTallyLightClient } from "../tally-light-client";
import styles from "./TallyView.module.scss";
import { EditModeSection } from "./EditModeSection";
import { EyeStrikedIcon } from "../ui/icons/EyeStrikedIcon";
import { EyeIcon } from "../ui/icons/EyeIcon";

export function TallyView() {
  const tallies = useTallyLightClient((state) => state.tallies);
  const [hiddenTallies, setHiddenTallies] = useState<number[]>([]);

  return (
    <EditModeSection threshold={1500}>
      {(inEditMode) => (
        <div className={styles.wrapper}>
          {inEditMode
            ? tallies.map(({ inputId, shortName }) => {
                const hidden = hiddenTallies.includes(inputId);
                return (
                  <div
                    className={cx(styles.tally, {
                      [styles.hidden]: hidden,
                    })}
                    onClick={() => {
                      console.log("click");
                      setHiddenTallies((arr) =>
                        hidden
                          ? arr.filter((i) => i !== inputId)
                          : arr.concat(inputId)
                      );
                    }}
                  >
                    {shortName}
                    {hidden ? <EyeStrikedIcon /> : <EyeIcon />}
                  </div>
                );
              })
            : tallies
                .filter((tally) => !hiddenTallies.includes(tally.inputId))
                .map(({ shortName, isPreview, isProgram }) => (
                  <div
                    className={cx(styles.tally, {
                      [styles.isPreview]: isPreview,
                      [styles.isProgram]: isProgram,
                    })}
                  >
                    {shortName}
                  </div>
                ))}
        </div>
      )}
    </EditModeSection>
  );
}
