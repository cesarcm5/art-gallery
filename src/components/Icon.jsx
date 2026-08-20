import Image from "next/image";

/**
 * Small local SVG glyph. Served unoptimized on purpose: these are ~1KB vector
 * files, so running them through the image optimizer costs more than it saves
 * (and Next declines to rasterise SVG by default anyway).
 */
export default function Icon({ src, size = 14, alt = "", style, className }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      aria-hidden={alt === "" ? "true" : undefined}
      className={className}
      style={style}
    />
  );
}
