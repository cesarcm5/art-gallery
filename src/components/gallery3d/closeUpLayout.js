import { HANG_HEIGHT } from "./constants";
import { WALL_TEXT_ASPECT } from "./wallTextTexture";

const GAP_BESIDE = 0.26;
const GAP_BELOW = 0.14;

const PANEL_H_BESIDE = 1.34;
const PANEL_H_BELOW = 0.62;

const MARGIN_BESIDE = 1.14;
const MARGIN_BELOW = 1.06;

/** How much of the work is left showing above the panel on a narrow screen. */
const PEEK = 0.22;

/**
 * Where the didactic hangs, and where the camera must stand.
 *
 * Landscape screens hold the work and the panel side by side. Portrait screens
 * cannot, so the panel drops beneath the work and the shot frames *the panel*,
 * letting the painting run off the top — at phone width, fitting the whole
 * canvas as well pushes the camera so far back the lettering is unreadable,
 * and the text is the thing you opened the close-up to read.
 *
 * Camera distance is derived from the framed box and the live aspect ratio, so
 * it holds up at any viewport instead of only the one it was tuned on.
 *
 * All coordinates are relative to the centre of the work.
 */
export function closeUpLayout(size, fovDeg, aspect) {
  const beside = aspect >= 1.15;

  const gap = beside ? GAP_BESIDE : GAP_BELOW;
  const panelH = beside ? PANEL_H_BESIDE : PANEL_H_BELOW;
  const panelW =
    panelH * (beside ? WALL_TEXT_ASPECT.beside : WALL_TEXT_ASPECT.below);

  const { w, h, moulding } = size;
  const half = w / 2 + moulding; // outer half-width, frame included

  const panelX = beside ? -(half + gap + panelW / 2) : 0;
  const panelY = beside ? 0 : -(h / 2 + gap + panelH / 2);

  // The box the shot has to hold.
  let left;
  let right;
  let top;
  let bottom;

  if (beside) {
    left = -(half + gap + panelW);
    right = half;
    top = Math.max(h, panelH) / 2;
    bottom = -top;
  } else {
    left = -panelW / 2;
    right = panelW / 2;
    top = panelY + panelH / 2 + PEEK;
    bottom = panelY - panelH / 2;
  }

  const margin = beside ? MARGIN_BESIDE : MARGIN_BELOW;
  const centreX = (left + right) / 2;
  const centreY = (top + bottom) / 2;
  const contentW = (right - left) * margin;
  const contentH = (top - bottom) * margin;

  // Fit: whichever axis needs the camera further back wins.
  const vHalf = (fovDeg * Math.PI) / 360;
  const hHalf = Math.atan(Math.tan(vHalf) * aspect);
  const distV = contentH / 2 / Math.tan(vHalf);
  const distH = contentW / 2 / Math.tan(hHalf);

  return {
    beside,
    panelW,
    panelH,
    panelX,
    panelY,
    camX: centreX,
    camY: HANG_HEIGHT + centreY,
    camZ: Math.max(0.8, Math.max(distV, distH)),
  };
}
