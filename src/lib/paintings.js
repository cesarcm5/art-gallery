import raw from "../../starter-code/data.json";

/** Source data ships "./assets/…" paths, which break on nested routes. */
const abs = (p) => (typeof p === "string" ? p.replace(/^\.\//, "/") : p);

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const paintings = raw.map((painting, index) => ({
  ...painting,
  index,
  slug: slugify(painting.name),
  artist: { ...painting.artist, image: abs(painting.artist.image) },
  images: {
    thumbnail: abs(painting.images.thumbnail),
    gallery: abs(painting.images.gallery),
    hero: {
      small: abs(painting.images.hero.small),
      large: abs(painting.images.hero.large),
    },
  },
}));

export default paintings;
