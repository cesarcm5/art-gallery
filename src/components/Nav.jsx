"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Fixed studio header. `tone` flips the whole bar between the paper ground
 * (gallery) and the ink ground (slideshow).
 */
export default function Nav({ tone = "paper" }) {
  const pathname = usePathname();
  const onIt = tone === "ink";
  const [lifted, setLifted] = useState(false);

  // The bar is transparent over the hero, then takes on its own ground so
  // section headings never collide with the links.
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ink = onIt ? "var(--studio-ink-inverse)" : "var(--studio-ink-primary)";
  const muted = onIt
    ? "var(--studio-ink-muted-inverse)"
    : "var(--studio-ink-muted)";
  const rule = onIt
    ? "var(--studio-hairline-inverse)"
    : "var(--studio-hairline)";

  const links = [
    { href: "/", label: "Gallery" },
    { href: "/slideshow", label: "Slideshow" },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="fixed left-0 top-0 w-full"
      style={{
        zIndex: 100,
        borderBottom: `1px solid ${lifted ? rule : "transparent"}`,
        background: lifted
          ? onIt
            ? "var(--studio-bg-ink)"
            : "var(--studio-bg-paper)"
          : "transparent",
        transition:
          "background var(--dur-mid) var(--ease-studio), border-color var(--dur-mid) var(--ease-studio)",
      }}
    >
      <div
        className="safe-top mx-auto flex items-center justify-between"
        style={{
          maxWidth: "var(--content-max)",
          // Longhand so .safe-top keeps control of padding-top.
          paddingBottom: "var(--page-pad-y)",
          paddingLeft: "var(--page-pad-x)",
          paddingRight: "var(--page-pad-x)",
        }}
      >
        {/* The wordmark is the mark — it carries the brand on its own now, so
            it stays at full ink and is never hidden on small screens. */}
        <Link href="/" aria-label="Galleria — home" className="flex items-center">
          <span
            className="t-label"
            style={{
              color: ink,
              letterSpacing: "0.38em",
              fontSize: "clamp(12px, 0.95vw, 15px)",
            }}
          >
            Galleria
          </span>
        </Link>

        <nav className="flex items-center" style={{ gap: "clamp(20px, 3vw, 40px)" }}>
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="t-label link-underline"
                style={{
                  color: active ? ink : muted,
                  letterSpacing: "0.32em",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.header>
  );
}
