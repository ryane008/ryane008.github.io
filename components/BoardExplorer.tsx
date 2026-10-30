"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NodeId, hrefFor } from "@/lib/site";
import { Camera, overview, toTransform } from "@/lib/camera";
import { BoardWorld } from "./BoardWorld";
import { useSite } from "./SiteProvider";

const MIN_S = 0.12;
const MAX_S = 2.5;
const clampS = (s: number) => Math.min(MAX_S, Math.max(MIN_S, s));

/** The board at ~: drag to pan, scroll or pinch-zoom with the buttons, click a card to dive in. */
export function BoardExplorer() {
  const { go } = useSite();
  const frameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [cam, setCam] = useState<Camera | null>(null);
  const drag = useRef<{ x: number; y: number; cam: Camera; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    const el = frameRef.current!;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
      setCam(overview(width, height));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const zoomAt = useCallback(
    (factor: number, px: number, py: number) => {
      setCam((c) => {
        if (!c) return c;
        const s = clampS(c.s * factor);
        // Keep the world point under the cursor fixed.
        const wx = c.cx + (px - size.w / 2) / c.s;
        const wy = c.cy + (py - size.h / 2) / c.s;
        return { s, cx: wx - (px - size.w / 2) / s, cy: wy - (py - size.h / 2) / s };
      });
    },
    [size],
  );

  useEffect(() => {
    const el = frameRef.current!;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!cam) return;
    drag.current = { x: e.clientX, y: e.clientY, cam, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    if (!d.moved) frameRef.current?.setPointerCapture(e.pointerId);
    d.moved = true;
    setCam({ ...d.cam, cx: d.cam.cx - dx / d.cam.s, cy: d.cam.cy - dy / d.cam.s });
  };
  const onPointerUp = () => {
    suppressClick.current = !!drag.current?.moved;
    drag.current = null;
  };

  const onActivate = (id: NodeId, e: React.MouseEvent) => {
    e.preventDefault();
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    go(hrefFor(id));
  };

  return (
    <div className="explorer">
      <div
        ref={frameRef}
        className="explorer__frame"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="explorer__world" style={{ transform: cam ? toTransform(cam, size.w, size.h) : undefined, opacity: cam ? 1 : 0 }}>
          <BoardWorld interactive onActivate={onActivate} />
        </div>
      </div>
      <div className="explorer__controls" aria-label="Board zoom">
        <button type="button" onClick={() => zoomAt(1.3, size.w / 2, size.h / 2)} aria-label="Zoom in">+</button>
        <button type="button" onClick={() => zoomAt(1 / 1.3, size.w / 2, size.h / 2)} aria-label="Zoom out">−</button>
        <button type="button" onClick={() => setCam(overview(size.w, size.h))}>Fit</button>
      </div>
    </div>
  );
}
