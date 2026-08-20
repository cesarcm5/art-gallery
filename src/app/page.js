"use client";

import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/Icon";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MaskedText from "@/components/MaskedText";
import Reveal from "@/components/Reveal";
import { paintings } from "@/lib/paintings";
import { useStageFrame } from "@/components/gallery3d/StageContext";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef(null);
  const heroInnerRef = useRef(null);

  // Hands the shared 3D room to the left-hand panel, viewed obliquely.
  const stageFrame = useStageFrame("profile");

  // Hero drifts up and dims as the grid rises over it.
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(heroInnerRef.current, {
        yPercent: -18,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <Nav tone="paper" />

      <main style={{ background: "var(--studio-bg-paper)" }}>
        {/* ---------------------------------------------------------------
            HERO
        --------------------------------------------------------------- */}
        <section
          ref={heroRef}
          className="min-h-viewport relative flex items-center overflow-hidden"
        >
          <div className="panel-glow" aria-hidden="true" />

          <div
            ref={heroInnerRef}
            className="relative mx-auto w-full"
            style={{
              maxWidth: "var(--content-max)",
              padding: "0 var(--page-pad-x)",
            }}
          >
            <MaskedText
              as="p"
              className="t-label"
              trigger={false}
              delay={0.35}
              style={{ marginBottom: 32 }}
            >
              Est. Collection — Fifteen Works
            </MaskedText>

            <MaskedText
              as="h1"
              className="t-display"
              trigger={false}
              delay={0.45}
              stagger={0.06}
              style={{ fontSize: "clamp(3.5rem, 12vw, 13.375rem)" }}
            >
              The quiet company of masterworks.
            </MaskedText>

            <div
              className="mt-16 flex flex-wrap items-end justify-between"
              style={{ gap: 40 }}
            >
              <MaskedText
                as="p"
                className="t-body"
                trigger={false}
                delay={0.7}
                style={{ maxWidth: "42ch" }}
              >
                Fifteen paintings, one uninterrupted reading room. Scroll the
                index below, or let the slideshow carry you through the
                collection one canvas at a time.
              </MaskedText>

              <Reveal delay={0.85}>
                <Link href="/slideshow" className="btn-ghost t-label">
                  Start Slideshow
                  <Icon src="/assets/shared/icon-next-button.svg" size={12} />
                </Link>
              </Reveal>
            </div>
          </div>

          <div
            className="t-label absolute"
            style={{
              bottom: "var(--page-pad-y)",
              left: "var(--page-pad-x)",
              color: "var(--studio-accent-gold)",
            }}
            aria-hidden="true"
          >
            Scroll
          </div>
        </section>

        {/* ---------------------------------------------------------------
            INDEX — the room fills the whole section, seen along the wall.
            The works drift down the right over a gradient to ink.
        --------------------------------------------------------------- */}
        {/* Runway: the section pins for one viewport of scroll, so the room
            is held completely still and completely visible, then releases and
            the footer follows below rather than sliding over it. */}
        <div style={{ height: "200vh", position: "relative" }}>
        <section
          id="index"
          className="h-viewport overflow-hidden"
          style={{
            // Pinned: the room holds still at the top of the viewport while
            // the rest of the page travels over it.
            position: "sticky",
            top: 0,
            borderTopLeftRadius: "var(--panel-radius)",
            borderTopRightRadius: "var(--panel-radius)",
            // sticky creates a stacking context, so the section's inner
            // z-indexes no longer compete with the canvas — the whole section
            // has to clear it as one. Which means it must stay transparent:
            // the stage paints its own ink ground behind the room.
            zIndex: 6,
            background: "transparent",
          }}
        >
          {/* The shared room is clipped to this box */}
          <div ref={stageFrame} className="absolute inset-0" />

          {/* Gradient to ink, so the drifting works have something to sit on */}
          <div
            aria-hidden="true"
            className="room-scrim pointer-events-none absolute inset-0"
            style={{ zIndex: 6 }}
          />

          {/* Caption over the room */}
          <div
            className="room-caption absolute flex flex-col"
            style={{
              zIndex: 7,
              left: "var(--page-pad-x)",
              bottom: "clamp(28px, 8vh, 88px)",
              gap: "clamp(16px, 2.5vh, 24px)",
            }}
          >
            <div>
              <span
                className="t-mono block"
                style={{ color: "var(--studio-accent-gold)" }}
              >
                The room
              </span>
              <span
                className="t-display mt-3 block"
                style={{
                  fontSize: "clamp(1.5rem, 5.5vw, 3.2rem)",
                  color: "var(--studio-ink-inverse)",
                }}
              >
                Fifteen works, one wall.
              </span>
            </div>

            <Link
              href="/slideshow"
              className="btn-round self-start"
              style={{ width: "auto", padding: "0 24px", gap: 12 }}
            >
              <span className="t-label">Start Slideshow</span>
              <Icon
                src="/assets/shared/icon-next-button.svg"
                style={{ filter: "invert(1)" }}
              />
            </Link>
          </div>

          {/* The works, drifting down the right in two offset columns */}
          <div
            className="cascade"
            style={{
              // Inline, because the .cascade rule in globals.css sets
              // position:relative and would otherwise beat Tailwind's class.
              position: "absolute",
              zIndex: 7,
              top: 0,
              bottom: 0,
              right: "var(--page-pad-x)",
            }}
          >
            <div className="cascade__columns">
              {[0, 1].map((col) => (
                <div
                  key={col}
                  className={`cascade__track${col === 1 ? " cascade__track--b" : ""}`}
                >
                  {/* The second column starts midway through the collection so
                      the two never show the same work side by side. */}
                  {(col === 0
                    ? [...paintings, ...paintings]
                    : [
                        ...paintings.slice(7),
                        ...paintings.slice(0, 7),
                        ...paintings.slice(7),
                        ...paintings.slice(0, 7),
                      ]
                  ).map((painting, i) => (
                    <Link
                      key={`${col}-${painting.slug}-${i}`}
                      href={`/slideshow?work=${painting.slug}`}
                      className="gallery-card mb-4 block"
                      aria-hidden={i >= paintings.length ? "true" : undefined}
                      tabIndex={i >= paintings.length ? -1 : undefined}
                    >
                      <Image
                        src={painting.images.thumbnail.src}
                        alt={painting.name}
                        width={painting.images.thumbnail.width}
                        height={painting.images.thumbnail.height}
                        sizes="210px"
                        className="gallery-card__media"
                      />
                      <span className="gallery-card__scrim" aria-hidden="true" />
                      <span className="gallery-card__meta">
                        <span
                          className="t-display block"
                          style={{
                            fontSize: "clamp(0.7rem, 2.4vw, 1.05rem)",
                            color: "var(--studio-ink-inverse)",
                          }}
                        >
                          {painting.name}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
        </div>

        <Footer />
      </main>
    </>
  );
}
