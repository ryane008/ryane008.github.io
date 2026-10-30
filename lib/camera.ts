// A camera over the board world: the world point (cx, cy) sits at the center
// of the viewport, magnified by s.

import { NodeId, WORLD, nodeById } from "./site";

export type Camera = { cx: number; cy: number; s: number };
export type Rect = { x: number; y: number; w: number; h: number };

export function fit(r: Rect, vw: number, vh: number, mode: "contain" | "cover", pad = 0): Camera {
  const sx = vw / (r.w + pad * 2);
  const sy = vh / (r.h + pad * 2);
  return { cx: r.x + r.w / 2, cy: r.y + r.h / 2, s: mode === "contain" ? Math.min(sx, sy) : Math.max(sx, sy) };
}

export const WORLD_RECT: Rect = { x: 0, y: 0, w: WORLD.w, h: WORLD.h };

export function overview(vw: number, vh: number): Camera {
  return fit(WORLD_RECT, vw, vh, "contain", 40);
}

/** Camera where a card fills the viewport, as if the page were that card. */
export function closeUp(id: NodeId, vw: number, vh: number): Camera {
  return fit(nodeById[id].box, vw, vh, "cover");
}

/** Interpolate in log-scale so zooming feels uniform. */
export function lerpCamera(a: Camera, b: Camera, t: number): Camera {
  return {
    cx: a.cx + (b.cx - a.cx) * t,
    cy: a.cy + (b.cy - a.cy) * t,
    s: Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * t),
  };
}

export function toTransform(c: Camera, vw: number, vh: number): string {
  const tx = vw / 2 - c.cx * c.s;
  const ty = vh / 2 - c.cy * c.s;
  return `translate3d(${tx}px, ${ty}px, 0) scale(${c.s})`;
}
