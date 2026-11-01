"use client";

import { useEffect, useRef, useState } from "react";
import { DECOR, EDGES, NODES, NodeId, WORLD, hrefFor, neighbors, pinOf } from "@/lib/site";
import { Clipping } from "./Clipping";

export const edgeKey = (a: NodeId, b: NodeId) => [a, b].sort().join("|");

function stringPath(p: { x: number; y: number }, q: { x: number; y: number }, sagRatio: number) {
  const len = Math.hypot(q.x - p.x, q.y - p.y);
  const mx = (p.x + q.x) / 2;
  const my = (p.y + q.y) / 2 + len * sagRatio;
  return `M ${p.x} ${p.y} Q ${mx} ${my} ${q.x} ${q.y}`;
}

type Props = {
  /** Marks "you are here". */
  here?: NodeId | null;
  /** Edges to draw on in order, as an animated route. */
  route?: string[];
  routeDelay?: number;
  /** Cards become real links when interactive; the transition overlay is decorative. */
  interactive?: boolean;
  onActivate?: (id: NodeId, e: React.MouseEvent) => void;
};

export function BoardWorld({ here, route = [], routeDelay = 0, interactive = false, onActivate }: Props) {
  const [hover, setHover] = useState<NodeId | null>(null);
  const lit = new Set<string>(hover ? neighbors(hover).map((n) => edgeKey(hover, n.id)) : []);
  const litNodes = new Set<NodeId>(hover ? [hover, ...neighbors(hover).map((n) => n.id)] : []);
  const worldRef = useRef<HTMLDivElement>(null);

  // Cards have fixed heights, so clamp each dek to the whole lines that fit and end it with an ellipsis.
  useEffect(() => {
    const clamp = () =>
      worldRef.current?.querySelectorAll<HTMLElement>(".card__dek").forEach((el) => {
        // Measure the space left in the card, then shrink the dek to the clamped lines.
        el.style.webkitLineClamp = "";
        el.style.flex = "";
        const lh = parseFloat(getComputedStyle(el).lineHeight);
        el.style.webkitLineClamp = String(Math.max(1, Math.floor(el.clientHeight / lh)));
        el.style.flex = "none";
      });
    clamp();
    document.fonts?.ready.then(clamp);
  }, []);

  return (
    <div ref={worldRef} className="world" style={{ width: WORLD.w, height: WORLD.h }} aria-hidden={!interactive || undefined}>
      <svg className="world__strings" width={WORLD.w} height={WORLD.h} viewBox={`0 0 ${WORLD.w} ${WORLD.h}`}>
        {DECOR.map((d, i) =>
          d.kind === "clipping" ? (
            <path
              key={`tie-${i}`}
              className="string string--tie"
              d={stringPath({ x: d.x + d.w / 2, y: d.y + 14 }, pinOf(d.tie), 0.06)}
            />
          ) : null,
        )}
        {EDGES.map(([a, b, s]) => {
          const k = edgeKey(a, b);
          return (
            <path
              key={k}
              className={`string string--s${s}${lit.has(k) ? " is-lit" : ""}${hover && !lit.has(k) ? " is-dim" : ""}`}
              d={stringPath(pinOf(a), pinOf(b), s === 2 ? 0.035 : 0.08)}
            />
          );
        })}
        {route.map((k, i) => {
          const [a, b] = k.split("|") as [NodeId, NodeId];
          const e = EDGES.find(([x, y]) => edgeKey(x, y) === k);
          // Draw from the route's direction, not the edge's stored direction.
          const forward = i === 0 || route[i - 1].split("|").includes(a);
          const [p, q] = forward ? [a, b] : [b, a];
          return (
            <path
              key={`route-${k}`}
              className="string string--route"
              pathLength={1}
              style={{ animationDelay: `${routeDelay + i * 0.22}s` }}
              d={stringPath(pinOf(p), pinOf(q), e && e[2] === 2 ? 0.035 : 0.08)}
            />
          );
        })}
      </svg>

      {DECOR.map((d, i) =>
        d.kind === "photo" ? (
          <figure
            key={i}
            className="polaroid"
            style={{ left: d.x, top: d.y, width: d.w, transform: `rotate(${d.rotate}deg)` }}
          >
            <span className="tape" />
            <img src={d.src} alt="" width={d.w} height={d.h} loading="lazy" draggable={false} />
          </figure>
        ) : (
          <div key={i} className="world__clipping" style={{ left: d.x, top: d.y, width: d.w, transform: `rotate(${d.rotate}deg)` }}>
            <span className="pin pin--small" />
            <Clipping compact />
          </div>
        ),
      )}

      {NODES.map((n) => {
        const b = n.box;
        const cls = [
          "card",
          `card--${n.kind}`,
          n.id === "home" ? "card--home" : "",
          n.image && n.kind === "main" ? "card--thumb" : "",
          n.id === here ? "is-here" : "",
          litNodes.has(n.id) ? "is-lit" : "",
          hover && !litNodes.has(n.id) ? "is-dim" : "",
        ].join(" ");
        const style = { left: b.x, top: b.y, width: b.w, height: b.h, transform: `rotate(${b.rotate}deg)` };
        const body = (
          <>
            <span className={`pin${n.kind === "spoke" ? " pin--spoke" : ""}`} />
            {n.id === here && <span className="card__here">You are here</span>}
            <span className="card__kicker">~/{n.fsPath}</span>
            <span className="card__title">{n.title}</span>
            <span className="card__dek">{n.dek}</span>
            {n.image && n.kind === "main" && (
              <img className="card__thumb" src={n.image} alt="" loading="lazy" draggable={false} />
            )}
          </>
        );
        return interactive ? (
          <a
            key={n.id}
            href={hrefFor(n.id)}
            className={cls}
            style={style}
            onMouseEnter={() => setHover(n.id)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(n.id)}
            onBlur={() => setHover(null)}
            onClick={(e) => onActivate?.(n.id, e)}
            draggable={false}
          >
            {body}
          </a>
        ) : (
          <div key={n.id} className={cls} style={style}>
            {body}
          </div>
        );
      })}
      <div className="world__legend">
        <span className="world__legend-title">Legend</span>
        <span><i className="swatch swatch--s2" /> close tie</span>
        <span><i className="swatch swatch--s1" /> related</span>
        <span><i className="swatch swatch--s0" /> subnet (via projects)</span>
      </div>
    </div>
  );
}
