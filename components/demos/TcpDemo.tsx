"use client";

import { useMemo, useState } from "react";

// A toy discrete-event model of the transfer our Rust TCP performs: handshake,
// a sliding window of segments, cumulative ACKs with out-of-order buffering on
// the receiver, retransmission of the oldest unacked segment on RTO (with
// exponential backoff), then the four-step teardown. This is a teaching sim,
// not the course code.

type Kind = "SYN" | "SYN-ACK" | "ACK" | "DATA" | "FIN";
type Pkt = { kind: Kind; label: string; from: "S" | "R"; t0: number; t1: number; lost: boolean; retx: boolean };
type Mark = { side: "S" | "R"; t: number; state: string };

const ONE_WAY = 10;
const GAP = 4; // serialization gap between back-to-back packets
const RTO0 = 2.5 * 2 * ONE_WAY;
const SEGMENTS = 10;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function simulate(loss: number, windowSize: number, seed: number) {
  const rand = mulberry32(seed);
  const pkts: Pkt[] = [];
  const marks: Mark[] = [
    { side: "S", t: 0, state: "SYN_SENT" },
    { side: "R", t: 0, state: "LISTEN" },
  ];
  const free = { S: 0, R: 0 };
  // Teardown is kept lossless so every run terminates; data, ACKs and the SYN can drop.
  const send = (from: "S" | "R", kind: Kind, label: string, t: number, retx = false, lossy = true) => {
    const t0 = Math.max(t, free[from]);
    free[from] = t0 + GAP;
    const lost = lossy && rand() < loss;
    const p: Pkt = { kind, label, from, t0, t1: t0 + ONE_WAY, lost, retx };
    pkts.push(p);
    return p;
  };

  let phase = "syn" as "syn" | "est" | "fin" | "done";
  let base = 0;
  let next = 0;
  let expected = 0;
  const ooo = new Set<number>();
  let rto = RTO0;
  let deadline: number | null = RTO0;
  let synAcked = false;
  let retransmits = 0;
  send("S", "SYN", "SYN", 0);

  const handled = new Set<Pkt>();
  for (let t = 0; t < 5000 && phase !== "done"; t++) {
    for (const p of pkts) {
      if (handled.has(p) || p.lost || p.t1 > t) continue;
      handled.add(p);
      if (p.from === "S") {
        if (p.kind === "SYN") {
          if (!synAcked) marks.push({ side: "R", t, state: "SYN_RECEIVED" });
          send("R", "SYN-ACK", "SYN-ACK", t, synAcked, false);
          synAcked = true;
        } else if (p.kind === "DATA") {
          const s = Number(p.label.split(" ")[1]);
          if (s === expected) {
            expected++;
            while (ooo.delete(expected)) expected++;
          } else if (s > expected) ooo.add(s);
          send("R", "ACK", `ACK ${expected}`, t);
        } else if (p.kind === "FIN") {
          marks.push({ side: "R", t, state: "CLOSE_WAIT" });
          send("R", "ACK", "ACK FIN", t, false, false);
          send("R", "FIN", "FIN", t + 4, false, false);
          marks.push({ side: "R", t: t + 4, state: "LAST_ACK" });
        } else if (p.kind === "ACK" && p.label === "ACK") {
          marks.push({ side: "R", t, state: "ESTABLISHED" });
        } else if (p.kind === "ACK" && p.label === "ACK FIN") {
          marks.push({ side: "R", t, state: "CLOSED" });
          phase = "done";
        }
      } else {
        if (p.kind === "SYN-ACK" && phase === "syn") {
          phase = "est";
          marks.push({ side: "S", t, state: "ESTABLISHED" });
          send("S", "ACK", "ACK", t, false, false);
          rto = RTO0;
          deadline = null;
        } else if (p.kind === "ACK" && phase === "est") {
          const n = Number(p.label.split(" ")[1]);
          if (n > base) {
            base = n;
            rto = RTO0;
            deadline = base < next ? t + rto : null;
          }
          if (base === SEGMENTS) {
            phase = "fin";
            marks.push({ side: "S", t, state: "FIN_WAIT_1" });
            send("S", "FIN", "FIN", t, false, false);
            deadline = null;
          }
        } else if (p.kind === "ACK" && p.label === "ACK FIN") {
          marks.push({ side: "S", t, state: "FIN_WAIT_2" });
        } else if (p.kind === "FIN") {
          marks.push({ side: "S", t, state: "TIME_WAIT" });
          send("S", "ACK", "ACK FIN", t, false, false);
        }
      }
    }

    if (phase === "est") {
      while (next < SEGMENTS && next < base + windowSize) {
        send("S", "DATA", `DATA ${next}`, t);
        next++;
        if (deadline === null) deadline = t + rto;
      }
    }

    if (deadline !== null && t >= deadline) {
      if (phase === "syn") send("S", "SYN", "SYN", t, true);
      else if (phase === "est") send("S", "DATA", `DATA ${base}`, t, true);
      retransmits++;
      rto = Math.min(rto * 2, 4 * RTO0); // exponential backoff, capped
      deadline = t + rto;
    }
  }

  const end = Math.max(...pkts.map((p) => p.t1));
  return { pkts, marks, end, retransmits, lost: pkts.filter((p) => p.lost).length };
}

const COLOR: Record<Kind, string> = {
  SYN: "var(--blue)",
  "SYN-ACK": "var(--blue)",
  FIN: "var(--blue)",
  DATA: "var(--ink)",
  ACK: "var(--ink-3)",
};

export function TcpDemo() {
  const [loss, setLoss] = useState(0.1);
  const [win, setWin] = useState(4);
  const [seed, setSeed] = useState(12); // a run that shows data loss and recovery
  const sim = useMemo(() => simulate(loss, win, seed), [loss, win, seed]);

  const W = 640;
  const xs = 150;
  const xr = 490;
  const top = 46;
  const scale = 3;
  // Squeeze idle stretches (a backed-off timer waiting) so the busy parts stay legible.
  const { y, breaks, H } = useMemo(() => {
    const MAXGAP = 16;
    const ts = [...new Set([0, ...sim.pkts.flatMap((p) => [p.t0, p.t1]), ...sim.marks.map((m) => m.t)])].sort((a, b) => a - b);
    const at: number[] = [0];
    const breaks: { y: number; span: number }[] = [];
    for (let i = 1; i < ts.length; i++) {
      const span = ts[i] - ts[i - 1];
      at.push(at[i - 1] + Math.min(span, MAXGAP));
      if (span > MAXGAP) breaks.push({ y: top + (at[i - 1] + MAXGAP / 2) * scale, span });
    }
    const y = (t: number) => {
      const i = ts.findIndex((x) => x >= t);
      if (i <= 0) return top + (i === 0 ? at[0] : at[at.length - 1]) * scale;
      const frac = (t - ts[i - 1]) / (ts[i] - ts[i - 1]);
      return top + (at[i - 1] + frac * (at[i] - at[i - 1])) * scale;
    };
    return { y, breaks, H: top + at[at.length - 1] * scale + 30 };
  }, [sim]);

  return (
    <div className="demo" id="demo">
      <div className="demo__head">
        <h3>Try it: a 10-segment transfer over a lossy link</h3>
        <p>Toy model of the protocol · seeded, so runs are reproducible</p>
      </div>
      <div className="demo__body">
        <div className="demo__controls">
          <label>
            Loss {Math.round(loss * 100)}%
            <input type="range" min={0} max={0.35} step={0.01} value={loss} onChange={(e) => setLoss(Number(e.target.value))} />
          </label>
          <label>
            Window {win}
            <input type="range" min={1} max={8} step={1} value={win} onChange={(e) => setWin(Number(e.target.value))} />
          </label>
          <button type="button" className="button" onClick={() => setSeed((s) => s + 1)}>
            Roll the dice again
          </button>
        </div>
        <div className="stats" style={{ margin: 0 }}>
          <div className="stat">
            <span className="stat__value">{sim.pkts.length}</span>
            <span className="stat__label">packets on the wire</span>
          </div>
          <div className="stat">
            <span className="stat__value">{sim.lost}</span>
            <span className="stat__label">dropped</span>
          </div>
          <div className="stat">
            <span className="stat__value">{sim.retransmits}</span>
            <span className="stat__label">retransmissions</span>
          </div>
          <div className="stat">
            <span className="stat__value">{(sim.end / (2 * ONE_WAY)).toFixed(1)}</span>
            <span className="stat__label">RTTs to close</span>
          </div>
        </div>
        <svg className="seqdiagram" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Sequence diagram of the simulated transfer">
          <defs>
            {(["ink", "ink-3", "blue", "red"] as const).map((c) => (
              <marker key={c} id={`arr-${c}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill={`var(--${c})`} />
              </marker>
            ))}
          </defs>
          <text x={xs} y={22} textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--ink)">
            sender (h1)
          </text>
          <text x={xr} y={22} textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--ink)">
            receiver (h2)
          </text>
          <line x1={xs} x2={xs} y1={top - 8} y2={H - 10} stroke="var(--ink)" strokeWidth="1.5" />
          <line x1={xr} x2={xr} y1={top - 8} y2={H - 10} stroke="var(--ink)" strokeWidth="1.5" />

          {breaks.map((b, i) => (
            <g key={`brk-${i}`}>
              {[xs, xr].map((x) => (
                <rect key={x} x={x - 6} y={b.y - 5} width={12} height={10} fill="var(--paper)" />
              ))}
              <text x={(xs + xr) / 2} y={b.y + 4} textAnchor="middle" fontSize="10" fill="var(--ink-3)">
                ⋯ {(b.span / (2 * ONE_WAY)).toFixed(1)} RTTs of silence: waiting on the timer ⋯
              </text>
            </g>
          ))}
          {sim.marks.map((m, i) => (
            <text
              key={i}
              x={m.side === "S" ? xs - 10 : xr + 10}
              y={y(m.t) + 4}
              textAnchor={m.side === "S" ? "end" : "start"}
              fontSize="10"
              fill="var(--ink-3)"
            >
              {m.state}
            </text>
          ))}

          {sim.pkts.map((p, i) => {
            const [x0, x1] = p.from === "S" ? [xs, xr] : [xr, xs];
            const color = p.retx ? "var(--red)" : COLOR[p.kind];
            const markerKey = p.retx ? "red" : p.kind === "ACK" ? "ink-3" : p.kind === "DATA" ? "ink" : "blue";
            const frac = p.lost ? 0.55 : 1;
            const ex = x0 + (x1 - x0) * frac;
            const ey = y(p.t0) + (y(p.t1) - y(p.t0)) * frac;
            const lx = x0 + (x1 - x0) * 0.22;
            const ly = y(p.t0) + (y(p.t1) - y(p.t0)) * 0.22;
            return (
              <g key={i}>
                <line
                  x1={x0}
                  y1={y(p.t0)}
                  x2={ex}
                  y2={ey}
                  stroke={color}
                  strokeWidth={p.kind === "DATA" ? 1.6 : 1.1}
                  strokeDasharray={p.kind === "ACK" ? "4 3" : undefined}
                  markerEnd={p.lost ? undefined : `url(#arr-${markerKey})`}
                />
                {p.lost && (
                  <text x={ex} y={ey + 4} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--red)">
                    ✕
                  </text>
                )}
                {p.kind !== "ACK" || p.from === "R" ? (
                  <text x={lx} y={ly - 3} textAnchor="middle" fontSize="9.5" fill={color} paintOrder="stroke" stroke="var(--paper)" strokeWidth="3">
                    {p.retx ? `↻ ${p.label}` : p.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
        <p className="demo__note">
          Red is a retransmission after the timer fires; ✕ is a drop. Because the receiver buffers out-of-order
          segments (our implementation keeps them in a <code>BTreeMap</code> keyed by sequence number), resending just
          the oldest missing segment is often enough: one cumulative ACK then jumps the window forward. Raise the loss
          and the doubling timeout shows up as long silent gaps.
        </p>
      </div>
    </div>
  );
}
