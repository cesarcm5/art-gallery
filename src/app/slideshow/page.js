"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useProgress } from "@react-three/drei";
import Nav from "@/components/Nav";
import Icon from "@/components/Icon";
import { useLenis } from "@/components/SmoothScroll";
import { paintings } from "@/lib/paintings";
import { useStage, useStageFrame } from "@/components/gallery3d/StageContext";

const EASE = [0.22, 1, 0.36, 1];
const WHEEL_THRESHOLD = 90;

function GalleryRoom() {
  const searchParams = useSearchParams();
  const lenis = useLenis();

  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const [closeUp, setCloseUp] = useState(false);

  // Take the room over full-screen and square on to the work. Because the
  // canvas lives in the layout, this reads as the camera walking round from
  // the profile view on the index rather than a cut.
  const stage = useStage();
  const stageFrame = useStageFrame("front");

  // The 3D rig reads position from a ref, so camera motion never depends on
  // React's render cadence.
  const indexRef = stage.indexRef;
  const total = paintings.length;

  const { active: loading, progress } = useProgress();

  const goTo = useCallback(
    (target) => {
      const clamped = Math.max(0, Math.min(total - 1, target));
      if (clamped !== indexRef.current) setCloseUp(false);
      indexRef.current = clamped;
      setIndex(clamped);
    },
    [total, indexRef]
  );

  // The ref is shared with the index page, so adopt whatever it already holds.
  useEffect(() => {
    setIndex(indexRef.current);
  }, [indexRef]);

  useEffect(() => {
    stage.closeUpRef.current = closeUp;
  }, [stage, closeUp]);

  // Backing out of close-up should not also leave the deck behind.
  useEffect(() => {
    if (lightbox !== null) setCloseUp(false);
  }, [lightbox]);

  // Clicking a canvas: the active work steps in, a neighbour walks over to it.
  useEffect(() => {
    stage.onSelectRef.current = (i) =>
      i === indexRef.current ? setCloseUp((v) => !v) : goTo(i);
    return () => {
      stage.onSelectRef.current = null;
    };
  }, [stage, indexRef, goTo]);

  // This page is a fixed viewport, so page scrolling would do nothing.
  useEffect(() => {
    if (!lenis) return;
    lenis.stop();
    return () => lenis.start();
  }, [lenis]);

  // Deep link in from the gallery index.
  useEffect(() => {
    const slug = searchParams.get("work");
    if (!slug) return;
    const target = paintings.findIndex((p) => p.slug === slug);
    if (target >= 0) goTo(target);
  }, [searchParams, goTo]);

  useEffect(() => {
    const onKey = (e) => {
      if (lightbox !== null) {
        if (e.key === "Escape") setLightbox(null);
        return;
      }
      if (e.key === "Escape" && closeUp) {
        setCloseUp(false);
        return;
      }
      if (e.key === "ArrowRight") goTo(indexRef.current + 1);
      if (e.key === "ArrowLeft") goTo(indexRef.current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, lightbox, closeUp, indexRef]);

  // Trackpad / wheel walks the wall one work at a time.
  useEffect(() => {
    if (lightbox !== null) return;
    let acc = 0;
    let locked = false;
    let unlockTimer;

    const onWheel = (e) => {
      acc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (locked || Math.abs(acc) < WHEEL_THRESHOLD) return;

      goTo(indexRef.current + Math.sign(acc));
      acc = 0;
      locked = true;
      unlockTimer = window.setTimeout(() => (locked = false), 420);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.clearTimeout(unlockTimer);
      window.removeEventListener("wheel", onWheel);
    };
  }, [goTo, lightbox, indexRef]);

  const current = paintings[index];

  return (
    <>
      <Nav tone="ink" />

      <main
        className="h-viewport relative w-screen overflow-hidden"
        style={{ background: "var(--studio-bg-ink)" }}
      >
        {/* The shared room is clipped to this box */}
        <div ref={stageFrame} className="absolute inset-0" />

        {/* Curtain held over the room while textures decode */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: "var(--studio-bg-ink)", zIndex: 80 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <span
                className="t-display"
                style={{
                  fontSize: "clamp(2rem, 5vw, 4rem)",
                  color: "var(--studio-ink-inverse)",
                }}
              >
                Hanging the collection
              </span>
              <span
                className="t-mono mt-6"
                style={{ color: "var(--studio-accent-gold)" }}
              >
                {Math.round(progress)}%
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------------------------------------------------------------
            OVERLAY — the reading matter stays in the DOM rather than the
            canvas, so it remains selectable and reachable by assistive tech.
        --------------------------------------------------------------- */}
        <div
          className="pointer-events-none absolute inset-0 flex flex-col justify-end"
          style={{ zIndex: 60 }}
        >
          <div
            className="safe-bottom mx-auto w-full"
            style={{
              maxWidth: "var(--content-max)",
              // Longhand: the `padding` shorthand would reset padding-bottom
              // to 0 and silently defeat .safe-bottom.
              paddingLeft: "var(--page-pad-x)",
              paddingRight: "var(--page-pad-x)",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current.slug}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: closeUp ? 0 : 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: EASE }}
                style={{ maxWidth: "44ch" }}
              >
                <div className="flex items-center" style={{ gap: 14 }}>
                  <span
                    className="t-mono"
                    style={{ color: "var(--studio-accent-gold)" }}
                  >
                    {String(index + 1).padStart(2, "0")} / {total}
                  </span>
                  <span
                    style={{
                      width: 36,
                      height: 1,
                      background: "var(--studio-hairline-inverse)",
                    }}
                  />
                  <span
                    className="t-label"
                    style={{ color: "var(--studio-ink-muted-inverse)" }}
                  >
                    {current.year}
                  </span>
                </div>

                <h2
                  className="t-display mt-3"
                  style={{
                    fontSize: "clamp(1.9rem, 3.4vw, 3.4rem)",
                    color: "var(--studio-ink-inverse)",
                  }}
                >
                  {current.name}
                </h2>

                <p
                  className="t-label mt-3"
                  style={{ color: "var(--studio-ink-muted-inverse)" }}
                >
                  {current.artist.name}
                </p>
              </motion.div>
            </AnimatePresence>

            <div
              className="control-row mt-8"
            >
              <div className="pointer-events-auto flex items-center" style={{ gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setCloseUp((v) => !v)}
                  className="btn-round"
                  style={{ width: "auto", padding: "0 22px", gap: 12 }}
                  aria-pressed={closeUp}
                >
                  <span className="t-label">
                    {closeUp ? "Step Back" : "Close Up"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setLightbox(index)}
                  className="btn-round"
                  style={{ width: "auto", padding: "0 22px", gap: 12 }}
                  aria-label={`View ${current.name} full size`}
                >
                  <Icon src="/assets/shared/icon-view-image.svg" size={12} />
                  <span className="t-label label-optional">View Image</span>
                </button>
              </div>

              <div
                className="pointer-events-auto flex items-center"
                style={{ gap: 12 }}
              >
                <button
                  type="button"
                  className="btn-round"
                  onClick={() => goTo(index - 1)}
                  disabled={index === 0}
                  aria-label="Previous work"
                >
                  <Icon
                    src="/assets/shared/icon-back-button.svg"
                    style={{ filter: "invert(1)" }}
                  />
                </button>
                <button
                  type="button"
                  className="btn-round"
                  onClick={() => goTo(index + 1)}
                  disabled={index === total - 1}
                  aria-label="Next work"
                >
                  <Icon
                    src="/assets/shared/icon-next-button.svg"
                    style={{ filter: "invert(1)" }}
                  />
                </button>
              </div>
            </div>

            {/* Position along the wall */}
            <div
              className="mt-6"
              style={{
                height: 1,
                background: "var(--studio-hairline-inverse)",
                position: "relative",
              }}
            >
              <motion.div
                initial={false}
                animate={{ scaleX: (index + 1) / total }}
                transition={{ duration: 0.5, ease: EASE }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "var(--studio-accent-gold)",
                  transformOrigin: "left",
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* ----------------------------------------------------------------- */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            className="fixed inset-0 flex flex-col items-center justify-center"
            style={{ zIndex: 200, background: "rgba(15, 15, 15, 0.94)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
            aria-label={paintings[lightbox].name}
          >
            <motion.div
              className="flex flex-col items-end"
              style={{ maxWidth: "min(90vw, 720px)" }}
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.52, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="t-label link-underline"
                style={{
                  color: "var(--studio-ink-inverse)",
                  marginBottom: 16,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <Image
                src={paintings[lightbox].images.gallery.src}
                alt={paintings[lightbox].name}
                width={paintings[lightbox].images.gallery.width}
                height={paintings[lightbox].images.gallery.height}
                sizes="(max-width: 768px) 90vw, 720px"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "78vh",
                  objectFit: "contain",
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function SlideshowPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-viewport" style={{ background: "var(--studio-bg-ink)" }} />
      }
    >
      <GalleryRoom />
    </Suspense>
  );
}
