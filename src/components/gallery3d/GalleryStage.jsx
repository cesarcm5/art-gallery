"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { useStage } from "./StageContext";
import { paintings } from "@/lib/paintings";

const GalleryCanvas = dynamic(() => import("./GalleryCanvas"), { ssr: false });

/**
 * The persistent 3D room. It is always a full-viewport canvas; what changes is
 * the clip rectangle, which tracks whichever element the current page handed
 * over. Clipping rather than resizing keeps the renderer from reallocating its
 * drawing buffer on every frame of the transition.
 */
export default function GalleryStage() {
  const stage = useStage();
  const boxRef = useRef(null);

  const modeRef = useRef("front");
  modeRef.current = stage?.mode ?? "front";

  useEffect(() => {
    if (!stage) return;

    const tick = () => {
      const box = boxRef.current;
      if (!box) return;

      const el = stage.frameRef.current;
      // clientWidth/Height, not innerWidth/Height: the latter include the
      // scrollbar, which left a permanent sliver clipped off the right edge.
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;

      let top = 0;
      let right = 0;
      let bottom = 0;
      let left = 0;

      if (el) {
        const r = el.getBoundingClientRect();
        // Snapped, never eased. Easing the clip makes it trail the frame while
        // scrolling — the window drifts down on the way down and up on the way
        // up, which reads as the room itself sliding.
        top = Math.max(0, Math.min(r.top, vh));
        right = Math.max(0, Math.min(vw - r.right, vw));
        bottom = Math.max(0, Math.min(vh - r.bottom, vh));
        left = Math.max(0, Math.min(r.left, vw));
      }

      box.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round 20px)`;
    };

    // On GSAP's ticker rather than a bare rAF, so it runs after Lenis has
    // written the frame's scroll position and never reads a stale rect.
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [stage]);

  if (!stage?.mounted) return null;

  return (
    <div
      ref={boxRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        // Ground for the room, so nothing flashes through before first paint.
        background: "var(--studio-bg-ink)",
        // Above the page's section backgrounds, which are positioned and would
        // otherwise paint over the room. Safe because the clip confines the
        // canvas to the frame the current page handed over; anything that must
        // sit on top of it (nav, overlays, captions) carries a higher index.
        zIndex: 5,
        pointerEvents: stage.mode === "front" ? "auto" : "none",
      }}
    >
      <GalleryCanvas
        paintings={paintings}
        indexRef={stage.indexRef}
        modeRef={modeRef}
        closeUpRef={stage.closeUpRef}
        onSelect={(i) => stage.onSelectRef.current?.(i)}
      />
    </div>
  );
}
