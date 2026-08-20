/**
 * Measures every artwork asset once and writes the intrinsic dimensions to
 * src/lib/image-sizes.json, so next/image can reserve exact space and the
 * masonry grid keeps each painting's true aspect ratio.
 *
 * Run with: npm run measure:images
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const data = JSON.parse(
  await readFile(path.join(root, "starter-code/data.json"), "utf8")
);

const abs = (p) => p.replace(/^\.\//, "/");

const targets = new Set();
for (const painting of data) {
  targets.add(abs(painting.images.thumbnail));
  targets.add(abs(painting.images.gallery));
  targets.add(abs(painting.images.hero.small));
  targets.add(abs(painting.images.hero.large));
  targets.add(abs(painting.artist.image));
}

const sizes = {};
for (const src of [...targets].sort()) {
  const file = path.join(root, "public", src);
  const { width, height } = await sharp(file).metadata();
  sizes[src] = { width, height };
}

await writeFile(
  path.join(root, "src/lib/image-sizes.json"),
  JSON.stringify(sizes, null, 2) + "\n"
);

console.log(`measured ${Object.keys(sizes).length} images`);
