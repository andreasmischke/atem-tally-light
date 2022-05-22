import { useCallback, useMemo, useState } from "react";

export const useEditMode = (threshold: number) => {
  const [inEditMode, setEditMode] = useState(false);

  const eventHandlers = useMemo(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const isTouch = navigator.maxTouchPoints > 0;
    const downEvent = isTouch ? "onTouchStart" : "onMouseDown";
    const upEvent = isTouch ? "onTouchEnd" : "onMouseUp";

    return {
      [downEvent]: () => {
        timeout = setTimeout(() => setEditMode(true), threshold);
      },
      [upEvent]: () => {
        clearTimeout(timeout);
      },
    };
  }, [threshold]);

  const leaveEditMode = useCallback(() => setEditMode(false), []);

  return {
    inEditMode,
    eventHandlers,
    leaveEditMode,
  };
};
