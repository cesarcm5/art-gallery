"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const StageContext = createContext(null);

export const useStage = () => useContext(StageContext);

/**
 * Holds the one 3D room that both routes share. It lives in the root layout,
 * so navigating from the gallery to the slideshow never unmounts the canvas —
 * which is what lets the camera fly between the two viewpoints instead of
 * cutting.
 */
export function StageProvider({ children }) {
  const [mode, setMode] = useState("front");
  const [mounted, setMounted] = useState(false);

  // The DOM element the canvas should currently be clipped to.
  const frameRef = useRef(null);
  const indexRef = useRef(0);
  // Registered by whichever page wants clicks on the canvas.
  const onSelectRef = useRef(null);
  // Close-up: read by the rig every frame, so it never costs a re-render.
  const closeUpRef = useRef(false);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      frameRef,
      indexRef,
      onSelectRef,
      closeUpRef,
      mounted,
      setMounted,
    }),
    [mode, mounted]
  );

  return (
    <StageContext.Provider value={value}>{children}</StageContext.Provider>
  );
}

/**
 * A page calls this to say "show the room here, from this viewpoint".
 * Returns a ref to attach to the element the room should fill.
 */
export function useStageFrame(mode) {
  const stage = useStage();
  const ref = useRef(null);

  useEffect(() => {
    if (!stage) return;
    stage.frameRef.current = ref.current;
    stage.setMode(mode);
    stage.setMounted(true);

    return () => {
      if (stage.frameRef.current === ref.current) stage.frameRef.current = null;
    };
  }, [stage, mode]);

  return ref;
}
