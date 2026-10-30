"use client";

import { useEffect, useRef, useState } from "react";
import { animate, type AnimationPlaybackControls } from "motion/react";
import { useRouter } from "next/navigation";
import { NodeId, route } from "@/lib/site";
import { Camera, closeUp, lerpCamera, overview, toTransform } from "@/lib/camera";
import { BoardWorld, edgeKey } from "./BoardWorld";
import { Place, useSite } from "./SiteProvider";

const EASE = [0.65, 0, 0.35, 1] as const;

/**
 * The Prezi-style move: the current page shrinks back into its card, the
 * camera pulls out to reveal the whole board, the route along the strings is
 * drawn, and the camera dives into the destination card.
 */
export function ZoomTransition() {
  const { transition, endTransition } = useSite();
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const [here, setHere] = useState<Place | null>(null);
  const [routeKeys, setRouteKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!transition) return;
    const overlay = overlayRef.current!;
    const world = worldRef.current!;
    const { from, to, href, hash } = transition;
    const target = hash ? `${href}#${hash}` : href;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const ov = overview(vw, vh);
    const start = from === "board" ? ov : closeUp(from, vw, vh);
    const end = to === "board" ? ov : closeUp(to, vw, vh);

    let cancelled = false;
    let pushed = false;
    const running = new Set<AnimationPlaybackControls>();
    const timers: number[] = [];
    const place = (c: Camera) => (world.style.transform = toTransform(c, vw, vh));
    const push = () => {
      if (!pushed) {
        pushed = true;
        router.push(target);
      }
    };
    const track = (c: AnimationPlaybackControls) => {
      running.add(c);
      return c.finished.then(() => running.delete(c));
    };
    const tween = (a: Camera, b: Camera, duration: number) =>
      track(animate(0, 1, { duration, ease: EASE, onUpdate: (t) => place(lerpCamera(a, b, t)) }));
    const fade = (opacity: number, duration: number) => track(animate(overlay, { opacity }, { duration }));
    const wait = (s: number) => new Promise<void>((r) => timers.push(window.setTimeout(r, s * 1000)));

    setRouteKeys([]);
    setHere(from);
    place(start);
    overlay.style.opacity = "0";

    (async () => {
      await fade(1, 0.18);
      if (cancelled) return;
      if (from !== "board") await tween(start, ov, 0.75);
      if (cancelled) return;
      const path = from !== "board" && to !== "board" ? route(from as NodeId, to as NodeId) : [];
      const keys = path.slice(1).map((id, i) => edgeKey(path[i], id));
      setRouteKeys(keys);
      await wait(keys.length ? 0.25 + keys.length * 0.22 : 0.2);
      if (cancelled) return;
      setHere(to);
      push();
      if (to !== "board") await tween(ov, end, 0.8);
      if (cancelled) return;
      await fade(0, 0.25);
      if (!cancelled) endTransition();
    })();

    // Any key or click skips straight to the destination.
    const skip = () => {
      cancelled = true;
      running.forEach((c) => c.stop());
      timers.forEach(clearTimeout);
      push();
      overlay.style.opacity = "0";
      endTransition();
    };
    window.addEventListener("keydown", skip);
    overlay.addEventListener("pointerdown", skip);
    return () => {
      cancelled = true;
      running.forEach((c) => c.stop());
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", skip);
      overlay.removeEventListener("pointerdown", skip);
    };
  }, [transition, endTransition, router]);

  if (!transition) return null;
  return (
    <div ref={overlayRef} className="zoom-overlay" role="presentation">
      <div ref={worldRef} className="zoom-overlay__world">
        <BoardWorld here={here === "board" ? null : here} route={routeKeys} />
      </div>
      <p className="zoom-overlay__hint">Press any key to skip</p>
    </div>
  );
}
