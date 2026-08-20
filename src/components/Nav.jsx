"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

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
        className="mx-auto flex items-center justify-between"
        style={{
          maxWidth: "var(--content-max)",
          padding: "var(--page-pad-y) var(--page-pad-x)",
        }}
      >
        <Link href="/" aria-label="Galleria — home" className="flex items-center gap-4">
          <Image
            src="/assets/shared/logo.svg"
            alt=""
            width={64}
            height={32}
            unoptimized
            aria-hidden="true"
            style={{
              filter: onIt ? "invert(1)" : "none",
              opacity: 0.92,
            }}
          />
          <span
            className="t-label hidden sm:block"
            style={{ color: muted, letterSpacing: "0.32em" }}
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
