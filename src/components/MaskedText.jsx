"use client";

import { Fragment, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Splits text into words, each clipped by its own overflow-hidden mask, then
 * rises them into view on scroll. This is the studio's signature text reveal.
 */
export default function MaskedText({
  children,
  as: Tag = "p",
  className = "",
  style,
  delay = 0,
  stagger = 0.045,
  trigger = true,
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const words = el.querySelectorAll(".mask-line__inner");
    if (!words.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(words, { yPercent: 105, y: 0 }, {
        yPercent: 0,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        stagger,
        delay,
        scrollTrigger: trigger
          ? { trigger: el, start: "top 88%", once: true }
          : undefined,
      });
    }, el);

    return () => ctx.revert();
  }, [children, delay, stagger, trigger]);

  const text = typeof children === "string" ? children : String(children ?? "");
  const words = text.split(" ");

  return (
    <Tag ref={rootRef} className={className} style={style}>
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
