"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MaskedText from "@/components/MaskedText";
import Reveal from "@/components/Reveal";
import { paintings } from "@/lib/paintings";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef(null);
  const heroInnerRef = useRef(null);

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
          className="relative flex min-h-screen items-center overflow-hidden"
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
                  <img
                    src="/assets/shared/icon-next-button.svg"
                    alt=""
                    width={12}
                    height={12}
                    aria-hidden="true"
                  />
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
            INDEX GRID
        --------------------------------------------------------------- */}
        <section
          id="index"
          className="relative"
          style={{
            background: "var(--studio-bg-surface)",
            borderTopLeftRadius: "var(--panel-radius)",
            borderTopRightRadius: "var(--panel-radius)",
            paddingTop: "clamp(64px, 8vw, 128px)",
            paddingBottom: "clamp(64px, 8vw, 128px)",
          }}
        >
          <div
            className="mx-auto w-full"
            style={{
              maxWidth: "var(--content-max)",
              padding: "0 var(--page-pad-x)",
            }}
          >
            <div
              className="mb-16 flex items-baseline justify-between"
              style={{
                borderBottom: "1px solid var(--studio-hairline)",
                paddingBottom: 16,
              }}
            >
              <MaskedText as="h2" className="t-label">
                The Index
              </MaskedText>
              <span className="t-mono" style={{ color: "var(--studio-ink-muted)" }}>
                {String(paintings.length).padStart(2, "0")} works
              </span>
            </div>

            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
              {paintings.map((painting, i) => (
                <Reveal
                  key={painting.slug}
                  className="mb-6 break-inside-avoid"
                  delay={(i % 3) * 0.08}
                >
                  <Link
                    href={`/slideshow?work=${painting.slug}`}
                    className="gallery-card"
                  >
                    <img
                      src={painting.images.thumbnail}
                      alt={painting.name}
                      className="gallery-card__media"
                      loading="lazy"
                    />
                    <span className="gallery-card__scrim" aria-hidden="true" />
                    <span className="gallery-card__meta">
                      <span
                        className="t-mono block"
                        style={{ color: "var(--studio-accent-gold)" }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="t-display mt-2 block"
                        style={{
                          fontSize: "clamp(1.5rem, 2.2vw, 2.2rem)",
                          color: "var(--studio-ink-inverse)",
                        }}
                      >
                        {painting.name}
                      </span>
                      <span
                        className="t-label mt-3 block"
                        style={{ color: "var(--studio-ink-muted-inverse)" }}
                      >
                        {painting.artist.name} · {painting.year}
                      </span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
