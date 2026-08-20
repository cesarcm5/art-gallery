"use client";

import { Fragment, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Icon from "@/components/Icon";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion } from "framer-motion";
import Nav from "@/components/Nav";
import { useLenis } from "@/components/SmoothScroll";
import { paintings } from "@/lib/paintings";

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.22, 1, 0.36, 1];

/** Word-mask markup. Animation is driven by the deck, not by itself. */
function Words({ text, className, style, as: Tag = "span" }) {
  const words = String(text).split(" ");
  return (
    <Tag className={className} style={style}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="mask-line" aria-hidden="true">
            <span className="mask-line__inner">{word}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
      <span className="sr-only">{text}</span>
    </Tag>
  );
}

function SlideshowDeck() {
  const searchParams = useSearchParams();
  const lenis = useLenis();

  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const stRef = useRef(null);
  const progressRef = useRef(null);

  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(null);

  const total = paintings.length;

  /* ---------------------------------------------------------------------
     The horizontal deck: vertical scroll is translated into lateral travel.
     Per-panel content is revealed via containerAnimation so each canvas
     composes itself as it slides into frame.
  --------------------------------------------------------------------- */
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      const distance = () => track.scrollWidth - window.innerWidth;

      const horizontal = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: prefersReduced ? true : 0.8,
          start: "top top",
          end: () => `+=${distance()}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setIndex(Math.round(self.progress * (total - 1)));
            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${self.progress})`;
            }
          },
          onRefresh: (self) => {
            stRef.current = self;
          },
        },
      });

      stRef.current = horizontal.scrollTrigger;

      // Per-panel composition as each slides into the viewport centre.
      // The opening panel is already in frame at scroll zero, so it plays on
      // its own rather than waiting for a trigger it has already passed.
      gsap.utils.toArray(".deck-panel").forEach((panel, i) => {
        const words = panel.querySelectorAll(".mask-line__inner");
        const blocks = panel.querySelectorAll("[data-panel-block]");
        const art = panel.querySelector("[data-panel-art]");

        const tl = gsap.timeline({
          delay: i === 0 ? 0.25 : 0,
          scrollTrigger:
            i === 0
              ? undefined
              : {
                  trigger: panel,
                  containerAnimation: horizontal,
                  start: "left 78%",
                  once: true,
                },
        });

        tl.fromTo(
          art,
          { scale: 1.12, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.9, ease: "power3.out" }
        )
          .fromTo(
            words,
            { yPercent: 105, y: 0 },
            { yPercent: 0, y: 0, duration: 0.8, stagger: 0.04, ease: "power3.out" },
            "-=0.6"
          )
          .fromTo(
            blocks,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.62, stagger: 0.08, ease: "power3.out" },
            "-=0.5"
          );
      });
    }, section);

    // Panel geometry depends on loaded artwork, so re-measure once it lands.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [total]);

  /* --------------------------------------------------------------------
     Navigation: buttons, keyboard and deep links all resolve to a scroll
     position, so there is exactly one source of truth.
  -------------------------------------------------------------------- */
  const goTo = useCallback(
    (target, { immediate = false } = {}) => {
      const st = stRef.current;
      if (!st) return;

      const clamped = Math.max(0, Math.min(total - 1, target));
      const y = st.start + (clamped / (total - 1)) * (st.end - st.start);

      // An immediate jump bypasses Lenis so it lands without waiting on a frame.
      if (immediate) {
        window.scrollTo({ top: y, behavior: "auto" });
        if (lenis) lenis.scrollTo(y, { immediate: true });
      } else if (lenis) {
        lenis.scrollTo(y, { duration: 1.1 });
      } else {
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    },
    [lenis, total]
  );

  // Deep link from the gallery index (?work=slug).
  useEffect(() => {
    const slug = searchParams.get("work");
    if (!slug) return;

    const target = paintings.findIndex((p) => p.slug === slug);
    if (target < 0) return;

    // Arrive directly at the requested work rather than travelling the deck.
    const id = window.setTimeout(() => {
      ScrollTrigger.refresh();
      goTo(target, { immediate: true });
    }, 300);

    return () => window.clearTimeout(id);
  }, [searchParams, goTo]);

  useEffect(() => {
    const onKey = (e) => {
      if (lightbox !== null) {
        if (e.key === "Escape") setLightbox(null);
        return;
      }
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, index, lightbox]);

  // Freeze the page behind the lightbox.
  useEffect(() => {
    if (!lenis) return;
    if (lightbox !== null) lenis.stop();
    else lenis.start();
  }, [lightbox, lenis]);

  const current = paintings[index];

  return (
    <>
      <Nav tone="ink" />

      <main style={{ background: "var(--studio-bg-ink)" }}>
        <section
          ref={sectionRef}
          className="relative h-screen w-screen overflow-hidden"
          style={{ background: "var(--studio-bg-ink)" }}
          aria-roledescription="carousel"
          aria-label="Masterworks slideshow"
        >
          <div
            ref={trackRef}
            className="flex h-full items-center"
            style={{
              gap: "var(--panel-gap)",
              paddingLeft: "var(--panel-gap)",
              paddingRight: "var(--panel-gap)",
              paddingTop: "clamp(72px, 8vh, 104px)",
              paddingBottom: "clamp(96px, 12vh, 136px)",
              willChange: "transform",
            }}
          >
            {paintings.map((painting, i) => (
              <article
                key={painting.slug}
                className="deck-panel h-panel"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${total}: ${painting.name}`}
              >
                <div className="panel-glow" aria-hidden="true" />

                <div
                  className="relative mx-auto flex h-full flex-col justify-center"
                  style={{
                    maxWidth: "var(--content-max)",
                    padding: "clamp(24px, 4vw, 64px)",
                  }}
                >
                  {/* Ghost year numeral, sunk behind the type */}
                  <span
                    className="t-display pointer-events-none absolute select-none"
                    aria-hidden="true"
                    style={{
                      right: "clamp(16px, 3vw, 56px)",
                      top: 0,
                      transform: "translateY(-0.3em)",
                      fontSize: "clamp(5rem, 15vw, 15rem)",
                      color: "rgba(15, 15, 15, 0.05)",
                      zIndex: 0,
                      fontStyle: "normal",
                      lineHeight: 0.8,
                    }}
                  >
                    {painting.year}
                  </span>

                  <div
                    className="relative grid h-full items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]"
                    style={{ zIndex: 2 }}
                  >
                    {/* ---- Canvas ---- */}
                    <div className="relative flex h-full items-center">
                      <div
                        className="relative overflow-hidden"
                        style={{
                          borderRadius: "clamp(12px, 1vw, 16px)",
                          maxHeight: "100%",
                          boxShadow: "var(--shadow-overlay)",
                        }}
                      >
                        <Image
                          data-panel-art
                          src={painting.images.hero.large.src}
                          alt={painting.name}
                          width={painting.images.hero.large.width}
                          height={painting.images.hero.large.height}
                          // Height-constrained by maxHeight:62vh, so the
                          // rendered width is well under half the viewport.
                          sizes="(max-width: 900px) 80vw, 34vw"
                          className="block h-full w-full object-cover"
                          style={{ maxHeight: "62vh", opacity: 0 }}
                          priority={i < 2}
                        />

                        <button
                          type="button"
                          onClick={() => setLightbox(i)}
                          className="t-label absolute flex items-center"
                          style={{
                            left: 16,
                            bottom: 16,
                            gap: 12,
                            padding: "12px 20px",
                            borderRadius: 999,
                            background: "rgba(15, 15, 15, 0.72)",
                            color: "var(--studio-ink-inverse)",
                            cursor: "pointer",
                            transition:
                              "background var(--dur-mid) var(--ease-studio)",
                          }}
                        >
                          <Icon src="/assets/shared/icon-view-image.svg" size={12} />
                          View Image
                        </button>
                      </div>
                    </div>

                    {/* ---- Reading column ---- */}
                    <div className="flex flex-col justify-center">
                      <div data-panel-block className="flex items-center" style={{ gap: 16, opacity: 0 }}>
                        <span
                          className="t-mono"
                          style={{ color: "var(--studio-accent-gold)" }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          style={{
                            width: 40,
                            height: 1,
                            background: "var(--studio-hairline)",
                          }}
                        />
                        <span className="t-label">{painting.year}</span>
                      </div>

                      <Words
                        as="h2"
                        text={painting.name}
                        className="t-display"
                        style={{
                          marginTop: 24,
                          fontSize: "clamp(2.25rem, 4.4vw, 4.5rem)",
                        }}
                      />

                      <div
                        data-panel-block
                        className="mt-6 flex items-center"
                        style={{ gap: 16, opacity: 0 }}
                      >
                        <Image
                          src={painting.artist.image.src}
                          alt=""
                          width={48}
                          height={48}
                          aria-hidden="true"
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 999,
                            objectFit: "cover",
                            filter: "grayscale(1)",
                          }}
                        />
                        <span
                          className="t-label"
                          style={{ color: "var(--studio-ink-secondary)" }}
                        >
                          {painting.artist.name}
                        </span>
                      </div>

                      <p
                        data-panel-block
                        className="t-body mt-8"
                        style={{
                          opacity: 0,
                          maxWidth: "52ch",
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 7,
                          overflow: "hidden",
                        }}
                      >
                        {painting.description}
                      </p>

                      <div data-panel-block style={{ opacity: 0, marginTop: 32 }}>
                        <a
                          href={painting.source}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="t-label link-underline"
                        >
                          Go to source
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* -------------------------------------------------------------
              CONTROL BAR
          ------------------------------------------------------------- */}
          <div
            className="absolute bottom-0 left-0 w-full"
            style={{ zIndex: 60, pointerEvents: "none" }}
          >
            <div
              style={{
                height: 1,
                background: "var(--studio-hairline-inverse)",
                position: "relative",
              }}
            >
              <div
                ref={progressRef}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "var(--studio-accent-gold)",
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                }}
              />
            </div>

            <div
              className="mx-auto flex items-center justify-between"
              style={{
                maxWidth: "var(--content-max)",
                padding: "clamp(16px, 2vw, 24px) var(--page-pad-x)",
                pointerEvents: "auto",
              }}
            >
              <div className="flex items-baseline" style={{ gap: 16 }}>
                <span
                  className="t-mono"
                  style={{ color: "var(--studio-accent-gold)" }}
                >
                  {String(index + 1).padStart(2, "0")} / {total}
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={current.slug}
                    className="t-label hidden sm:block"
                    style={{ color: "var(--studio-ink-muted-inverse)" }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    {current.name} — {current.artist.name}
                  </motion.span>
                </AnimatePresence>
              </div>

              <div className="flex items-center" style={{ gap: 12 }}>
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
          </div>
        </section>
      </main>

      {/* -----------------------------------------------------------------
          LIGHTBOX
      ----------------------------------------------------------------- */}
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
      fallback={<div style={{ minHeight: "100vh", background: "var(--studio-bg-ink)" }} />}
    >
      <SlideshowDeck />
    </Suspense>
  );
}
