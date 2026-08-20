import * as THREE from "three";

/* Two layouts: a tall panel for the wall beside the work, and a wide one for
   the wall beneath it — which is where it has to go on a phone, since a
   portrait screen cannot hold the work and a column of text side by side. */
const LAYOUT = {
  beside: { w: 900, h: 1200, artist: 34, title: 82, body: 31, lead: 46 },
  // Near square rather than wide: on a narrow screen the panel's *width* is
  // what forces the camera back, so a wide panel would shrink the lettering.
  below: { w: 1000, h: 1080, artist: 36, title: 84, body: 33, lead: 48 },
};

/** Wraps `text` to `maxWidth`, returning the lines. */
function wrap(ctx, text, maxWidth) {
  const lines = [];
  let line = "";

  for (const word of text.split(/\s+/)) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Draws a museum didactic as vinyl lettering: ink on a transparent ground, so
 * it sits *on* the wall rather than on a card floating in front of it. That
 * way the room's own lights fall across the text like they do the plaster.
 *
 * Returns a texture the caller owns — dispose it when the work changes.
 */
export function makeWallTextTexture(painting, orientation = "beside") {
  const L = LAYOUT[orientation] ?? LAYOUT.beside;
  const { w: W, h: H } = L;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const ink = "#141210";
  const pad = 8;
  let y = 96;

  // Artist — letterspaced small caps
  ctx.fillStyle = "rgba(20,18,16,0.68)";
  ctx.font = `400 ${L.artist}px Jost, Helvetica, Arial, sans-serif`;
  ctx.letterSpacing = "9px";
  ctx.fillText(painting.artist.name.toUpperCase(), pad, y);
  ctx.letterSpacing = "0px";

  // Title — the one big voice on the wall
  y += L.title + 14;
  ctx.fillStyle = ink;
  ctx.font = `italic 400 ${L.title}px 'Cormorant Garamond', Georgia, serif`;
  for (const line of wrap(ctx, painting.name, W - pad * 2)) {
    ctx.fillText(line, pad, y);
    y += L.title + 4;
  }

  // Year
  y += 14;
  ctx.fillStyle = "rgba(20,18,16,0.6)";
  ctx.font = `400 ${Math.round(L.artist * 0.94)}px 'Space Mono', ui-monospace, monospace`;
  ctx.fillText(String(painting.year), pad, y);

  // Hairline rule
  y += 46;
  ctx.fillStyle = "rgba(20,18,16,0.28)";
  ctx.fillRect(pad, y, W - pad * 2, 2);

  // Description
  y += 62;
  ctx.fillStyle = "rgba(20,18,16,0.82)";
  ctx.font = `300 ${L.body}px Jost, Helvetica, Arial, sans-serif`;

  const lines = wrap(ctx, painting.description, W - pad * 2);
  for (const line of lines) {
    if (y > H - 70) {
      ctx.fillText("…", pad, y);
      break;
    }
    ctx.fillText(line, pad, y);
    y += L.lead;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

export const WALL_TEXT_ASPECT = {
  beside: LAYOUT.beside.w / LAYOUT.beside.h,
  below: LAYOUT.below.w / LAYOUT.below.h,
};
