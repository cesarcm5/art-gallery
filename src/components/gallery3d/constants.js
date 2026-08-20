/**
 * Shared room geometry. The lamp fixture and the light it emits both read
 * these, so the illumination can never drift away from the luminaire.
 */

export const SPACING = 3.4;
export const WALL_H = 4.6;
export const HALL_DEPTH = 9;

/** Museum hang: centre of every canvas sits at a constant eye height. */
export const HANG_HEIGHT = 1.72;

/**
 * Where the lamp head hangs. Kept low enough to sit inside the camera's
 * frame — the luminaire is meant to be seen, not just inferred from its pool.
 */
export const LAMP_Y = 2.86;
export const LAMP_Z = 0.72;

export const xForIndex = (i) => i * SPACING;
