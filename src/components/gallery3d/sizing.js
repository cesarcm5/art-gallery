/**
 * How big each work hangs, and in what shape.
 *
 * Proportions come from the gallery image, which is the whole artwork. The
 * hero files cannot be used here: they are all cropped to the same 0.85
 * portrait regardless of the piece, so fitting a canvas to one would either
 * squash the painting or cut it — Guernica lost 62% of its width that way.
 *
 * Because the canvas is shaped by the very image stretched over it, nothing is
 * ever cropped: every work is seen in full, in its own format.
 */

/**
 * Every work is given the same canvas *area*, so each carries equal visual
 * weight on the wall while keeping its own shape. A wide painting comes out
 * wide and low, a portrait tall and narrow — but neither dominates and
 * neither disappears.
 */
const TARGET_AREA = 1.8; // square metres

/* Rails, so nothing crowds the lamp above or the skirting below. */
const MAX_H = 1.62;
const MAX_W = 2.2;

/**
 * Museums frame by period rather than hanging everything in matching gilt.
 * Older works get wide ornate gold; the 19th century gets walnut; modern
 * works get a narrow ebonised or pewter profile.
 */
export function frameForYear(year) {
  if (year < 1700) {
    return { color: "#a9885a", metalness: 0.95, roughness: 0.3, widthScale: 1.25, liner: "#3a2c18" };
  }
  if (year < 1850) {
    return { color: "#b8a07a", metalness: 0.9, roughness: 0.36, widthScale: 1.1, liner: "#33291a" };
  }
  if (year < 1900) {
    return { color: "#5a4230", metalness: 0.18, roughness: 0.62, widthScale: 0.95, liner: "#2a2018" };
  }
  return { color: "#8e8b84", metalness: 0.55, roughness: 0.45, widthScale: 0.75, liner: "#15130f" };
}

/** The image hung on the wall — the full work, not a crop. */
export function canvasImage(painting) {
  return painting.images.gallery;
}

/** Proportion of the work, width over height. */
export function canvasAspect(painting) {
  const { width, height } = canvasImage(painting);
  return width / height;
}

/** Canvas size in metres, plus the moulding width that frames it. */
export function paintingSize(painting) {
  const aspect = canvasAspect(painting);

  // Equal area, then held inside the rails.
  let h = Math.sqrt(TARGET_AREA / aspect);
  let w = h * aspect;

  const shrink = Math.min(1, MAX_W / w, MAX_H / h);
  w *= shrink;
  h *= shrink;

  const moulding =
    Math.max(0.06, Math.min(w, h) * 0.085) * frameForYear(painting.year).widthScale;

  return { w, h, moulding };
}
