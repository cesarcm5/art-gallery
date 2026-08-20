"use client";

import Link from "next/link";
import MaskedText from "./MaskedText";

const COLLECTIONS = 4;

export default function Footer() {
  return (
    <footer
      className="relative isolate flex flex-col overflow-hidden"
      style={{
        background: "var(--studio-bg-ink)",
        color: "var(--studio-ink-inverse)",
        paddingTop: "clamp(80px, 10vw, 160px)",
        // Clears the 3D stage while the pinned room is releasing.
        zIndex: 8,
      }}
    >
      <div
        className="mx-auto w-full"
        style={{
          maxWidth: "var(--content-max)",
          padding: "0 var(--page-pad-x)",
        }}
      >
        <MaskedText
          as="h2"
          className="t-display"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 5.5rem)",
            color: "var(--studio-ink-inverse)",
          }}
        >
          Look slowly. The paint is still wet.
        </MaskedText>

        <div
          className="mt-16 flex flex-wrap items-end justify-between"
          style={{
            gap: 32,
            borderTop: "1px solid var(--studio-hairline-inverse)",
            paddingTop: 32,
          }}
        >
          <div className="flex flex-col" style={{ gap: 12 }}>
            <span className="t-label" style={{ color: "var(--studio-ink-muted-inverse)" }}>
              Index
            </span>
            <Link
              href="/"
              className="t-label link-underline"
              style={{ color: "var(--studio-ink-inverse)" }}
            >
              Gallery
            </Link>
            <Link
              href="/slideshow"
              className="t-label link-underline"
              style={{ color: "var(--studio-ink-inverse)" }}
            >
              Slideshow
            </Link>
          </div>

          <div className="flex flex-col items-end" style={{ gap: 8 }}>
            <span className="t-label" style={{ color: "var(--studio-ink-muted-inverse)" }}>
              Colophon
            </span>
            <span
              className="t-mono"
              style={{ color: "var(--studio-ink-muted-inverse)" }}
            >
              React · GSAP · Lenis · Framer Motion
            </span>
          </div>
        </div>
      </div>

      <div
        className="mt-20 select-none"
        aria-hidden="true"
        style={{ maskImage: "linear-gradient(to bottom, black 40%, transparent)" }}
      >
        <div className="marquee-track">
          {Array.from({ length: COLLECTIONS }).map((_, i) => (
            <div key={i} className="marquee-word">
              <span>Galleria</span>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
