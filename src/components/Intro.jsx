"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";

const WORD = "GALLERIA";
const SESSION_KEY = "galleria:intro-played";

/**
 * Opening curtain: letters rise out of their masks, hold, then the ink panel
 * lifts away to reveal the paper ground beneath.
 */
export default function Intro() {
  const [visible, setVisible] = useState(false);
  const lettersRef = useRef([]);
  const metaRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced || sessionStorage.getItem(SESSION_KEY)) return;

    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;

    document.documentElement.style.overflow = "hidden";

    const letters = lettersRef.current.filter(Boolean);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => setVisible(false),
      });

      tl.fromTo(
        letters,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.9,
          stagger: 0.055,
          ease: "power3.out",
        }
      )
        .fromTo(
          metaRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          "-=0.45"
        )
        .to({}, { duration: 0.75 })
        .to(letters, {
          yPercent: -110,
          duration: 0.65,
          stagger: 0.03,
          ease: "power3.in",
        })
        .to(metaRef.current, { opacity: 0, duration: 0.3 }, "<");
    });

    return () => {
      ctx.revert();
      document.documentElement.style.overflow = "";
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          className="fixed inset-0 flex flex-col items-center justify-center"
          style={{ background: "var(--studio-bg-ink)", zIndex: 9999 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1
            className="t-display flex"
            style={{
              fontSize: "clamp(3.5rem, 13vw, 13rem)",
              color: "var(--studio-ink-inverse)",
            }}
            aria-label={WORD}
          >
            {WORD.split("").map((char, i) => (
              <span key={i} className="intro-letter-mask" aria-hidden="true">
                <span
                  className="intro-letter"
                  ref={(el) => (lettersRef.current[i] = el)}
                >
                  {char}
                </span>
              </span>
            ))}
          </h1>

          <div
            ref={metaRef}
            className="t-label mt-8 flex items-center gap-3"
            style={{ color: "var(--studio-ink-muted-inverse)", opacity: 0 }}
          >
            <span>Fifteen Masterworks</span>
            <span className="flex gap-1" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="intro-loading-dot"
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 999,
                    background: "var(--studio-accent-gold)",
                    animationDelay: `${i * 0.16}s`,
                  }}
                />
              ))}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
