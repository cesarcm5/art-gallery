import raw from "../../starter-code/data.json";
import sizes from "./image-sizes.json";

/** Source data ships "./assets/…" paths, which break on nested routes. */
const abs = (p) => (typeof p === "string" ? p.replace(/^\.\//, "/") : p);

/**
 * Pairs a path with its measured intrinsic size so next/image can reserve
 * exact space and avoid layout shift. Sizes come from scripts/measure-images.mjs.
 */
const asset = (p) => {
  const src = abs(p);
  const size = sizes[src];
  if (!size) throw new Error(`Missing measured size for ${src} — run: npm run measure:images`);
  return { src, ...size };
};

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const paintings = raw.map((painting, index) => ({
  ...painting,
  index,
  slug: slugify(painting.name),
  artist: { ...painting.artist, image: asset(painting.artist.image) },
  images: {
    thumbnail: asset(painting.images.thumbnail),
    gallery: asset(painting.images.gallery),
    hero: {
      small: asset(painting.images.hero.small),
      large: asset(painting.images.hero.large),
    },
  },
}));

export default paintings;
