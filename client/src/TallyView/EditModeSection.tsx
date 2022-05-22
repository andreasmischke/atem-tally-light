import { FC, ReactElement } from "react";
import { useEditMode } from "./useEditMode";
import styles from "./EditModeSection.module.scss";

export const EditModeSection: FC<{
  threshold: number;
  children: (active: boolean) => ReactElement;
}> = ({ threshold, children }) => {
  const { inEditMode, eventHandlers, leaveEditMode } = useEditMode(threshold);

  return (
    <>
      {inEditMode && (
        <div className={styles.editModeBar}>
          Edit Mode
          <button
            className={styles.editModeLeaveButton}
            onClick={leaveEditMode}
          >
            Done
          </button>
        </div>
      )}
      <div {...eventHandlers} style={{ display: "contents" }}>
        {children(inEditMode)}
      </div>
    </>
  );
};
