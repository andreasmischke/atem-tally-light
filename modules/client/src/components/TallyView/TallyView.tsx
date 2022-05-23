import cx from "classnames";
import { useTallyLightClient } from "../../domain/TallyLightClient";
import { EyeIcon, EyeStrikedIcon } from "../../ui";
import { EditModeSection } from "./EditModeSection";
import styles from "./TallyView.module.scss";

export function TallyView() {
  const [tallies, selectTally] = useTallyLightClient((state) => [
    state.tallies,
    state.selectTally,
  ]);

  return (
    <EditModeSection threshold={1500}>
      {(inEditMode) => (
        <div className={styles.wrapper}>
          {inEditMode
            ? tallies.map(({ inputId, shortName, selected }) => (
                <div
                  key={inputId}
                  className={cx(styles.tally, {
                    [styles.hidden]: !selected,
                  })}
                  onMouseDown={() => selectTally(inputId, !selected)}
                >
                  {shortName}
                  {selected ? <EyeIcon /> : <EyeStrikedIcon />}
                </div>
              ))
            : tallies
                .filter((tally) => tally.selected)
                .map(({ inputId, shortName, isPreview, isProgram }) => (
                  <div
                    key={inputId}
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
