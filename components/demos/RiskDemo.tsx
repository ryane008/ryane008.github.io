"use client";

import { useState } from "react";

// A miniature Barra-style model on a made-up universe. Same math as the real
// one (Σ = X F Xᵀ + Δ, Euler variance attribution), none of the licensed data.

const FACTORS = ["market", "Tech", "Health", "Energy", "size", "value", "momentum", "volatility"] as const;
const GROUP: Record<(typeof FACTORS)[number], "market" | "industry" | "style"> = {
  market: "market",
  Tech: "industry",
  Health: "industry",
  Energy: "industry",
  size: "style",
  value: "style",
  momentum: "style",
  volatility: "style",
};

// Annualized factor vols and a few correlations.
const VOL = [0.16, 0.08, 0.06, 0.11, 0.04, 0.05, 0.065, 0.05];
const CORR: [number, number, number][] = [
  [5, 6, -0.35], // value vs momentum
  [0, 7, 0.3], // market vs volatility
  [1, 7, 0.25], // tech vs volatility
  [3, 5, 0.2], // energy vs value
];

type Stock = { t: string; sector: "Tech" | "Health" | "Energy"; size: number; value: number; momentum: number; volatility: number; spec: number };
const STOCKS: Stock[] = [
  { t: "TEC1", sector: "Tech", size: 1.4, value: -0.9, momentum: 0.8, volatility: 0.2, spec: 0.2 },
  { t: "TEC2", sector: "Tech", size: 0.3, value: -0.5, momentum: 1.1, volatility: 0.9, spec: 0.3 },
  { t: "TEC3", sector: "Tech", size: -0.8, value: 0.1, momentum: -0.4, volatility: 1.4, spec: 0.38 },
  { t: "HLT1", sector: "Health", size: 1.1, value: 0.2, momentum: -0.2, volatility: -0.8, spec: 0.17 },
  { t: "HLT2", sector: "Health", size: -0.6, value: -0.3, momentum: 0.5, volatility: 1.0, spec: 0.42 },
  { t: "HLT3", sector: "Health", size: 0.2, value: 0.7, momentum: -0.6, volatility: -0.3, spec: 0.22 },
  { t: "ENR1", sector: "Energy", size: 0.9, value: 1.2, momentum: -0.3, volatility: 0.1, spec: 0.21 },
  { t: "ENR2", sector: "Energy", size: -0.4, value: 0.9, momentum: 0.6, volatility: 0.7, spec: 0.33 },
  { t: "ENR3", sector: "Energy", size: -1.1, value: 1.5, momentum: -1.0, volatility: 1.2, spec: 0.4 },
];

const K = FACTORS.length;
const N = STOCKS.length;

const F: number[][] = (() => {
  const C: number[][] = Array.from({ length: K }, (_, i) => Array.from({ length: K }, (_, j) => (i === j ? 1 : 0)));
  for (const [i, j, r] of CORR) C[i][j] = C[j][i] = r;
  return C.map((row, i) => row.map((c, j) => c * VOL[i] * VOL[j]));
})();

const X: number[][] = STOCKS.map((s) => [
  1,
  s.sector === "Tech" ? 1 : 0,
  s.sector === "Health" ? 1 : 0,
  s.sector === "Energy" ? 1 : 0,
  s.size,
  s.value,
  s.momentum,
  s.volatility,
]);
const DELTA = STOCKS.map((s) => s.spec * s.spec);

const matvec = (M: number[][], v: number[]) => M.map((row) => row.reduce((a, m, j) => a + m * v[j], 0));
const portExposure = (w: number[]) => FACTORS.map((_, k) => w.reduce((a, wi, i) => a + wi * X[i][k], 0));

const SIGMA: number[][] = X.map((xi, i) =>
  X.map((xj, j) => {
    const Fxj = matvec(F, xj);
    return xi.reduce((a, v, k) => a + v * Fxj[k], 0) + (i === j ? DELTA[i] : 0);
  }),
);

/** Euclidean projection onto the probability simplex (long-only, fully invested). */
function projectSimplex(v: number[]): number[] {
  const u = [...v].sort((a, b) => b - a);
  let css = 0;
  let theta = 0;
  for (let i = 0; i < u.length; i++) {
    css += u[i];
    const t = (css - 1) / (i + 1);
    if (u[i] - t > 0) theta = t;
  }
  return v.map((x) => Math.max(0, x - theta));
}

function minVariance(): number[] {
  let w = Array(N).fill(1 / N);
  for (let it = 0; it < 4000; it++) {
    const g = matvec(SIGMA, w);
    w = projectSimplex(w.map((wi, i) => wi - 0.5 * g[i]));
  }
  return w;
}

function analyze(w: number[]) {
  const x = portExposure(w);
  const Fx = matvec(F, x);
  const byFactor = FACTORS.map((f, k) => ({ f, exposure: x[k], contrib: x[k] * Fx[k] }));
  const factorVar = byFactor.reduce((a, b) => a + b.contrib, 0);
  const specVar = w.reduce((a, wi, i) => a + wi * wi * DELTA[i], 0);
  const total = factorVar + specVar;
  const groups = { market: 0, industry: 0, style: 0, specific: specVar };
  for (const r of byFactor) groups[GROUP[r.f]] += r.contrib;
  return { byFactor, factorVar, specVar, total, groups };
}

const pct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;
const COLORS = { market: "#2a5a8a", industry: "#b7791f", style: "#2f7d62", specific: "#7c776d" };

const PRESETS: Record<string, () => number[]> = {
  "Equal weight": () => Array(N).fill(1),
  "Tech-heavy": () => [5, 4, 3, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  "One stock": () => [1, 0, 0, 0, 0, 0, 0, 0, 0],
  "Min variance": () => minVariance().map((x) => x * 10),
};

export function RiskDemo() {
  const [raw, setRaw] = useState<number[]>(PRESETS["Equal weight"]());
  const [preset, setPreset] = useState<string | null>("Equal weight");
  const sum = raw.reduce((a, b) => a + b, 0) || 1;
  const w = raw.map((r) => r / sum);
  const a = analyze(w);

  const choose = (name: string) => {
    setPreset(name);
    setRaw(PRESETS[name]());
  };

  return (
    <div className="demo" id="demo">
      <div className="demo__head">
        <h3>Try it: where does a portfolio&rsquo;s risk come from?</h3>
        <p>Synthetic 9-stock universe · runs in your browser</p>
      </div>
      <div className="demo__body">
        <div className="demo__controls">
          <span>Start from</span>
          <span className="seg" role="group" aria-label="Preset portfolios">
            {Object.keys(PRESETS).map((name) => (
              <button key={name} type="button" aria-pressed={preset === name} onClick={() => choose(name)}>
                {name}
              </button>
            ))}
          </span>
        </div>
        <div className="demo-grid">
          <div className="weights" aria-label="Portfolio weights">
            {STOCKS.map((s, i) => (
              <label key={s.t} className="weights__row">
                <b>{s.t}</b>
                <span className="weights__sector">{s.sector}</span>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.1}
                  value={raw[i]}
                  onChange={(e) => {
                    setPreset(null);
                    setRaw((r) => r.map((x, j) => (j === i ? Number(e.target.value) : x)));
                  }}
                />
                <span className="weights__pct">{pct(w[i], 0)}</span>
              </label>
            ))}
          </div>
          <div>
            <div className="stats" style={{ marginTop: 0 }}>
              <div className="stat">
                <span className="stat__value">{pct(Math.sqrt(a.total))}</span>
                <span className="stat__label">predicted vol</span>
              </div>
              <div className="stat">
                <span className="stat__value">{pct(Math.sqrt(Math.max(a.factorVar, 0)))}</span>
                <span className="stat__label">factor vol</span>
              </div>
              <div className="stat">
                <span className="stat__value">{pct(Math.sqrt(a.specVar))}</span>
                <span className="stat__label">specific vol</span>
              </div>
            </div>
            <div className="bar" role="img" aria-label="Share of variance by source">
              {(Object.keys(a.groups) as (keyof typeof a.groups)[]).map((g) => {
                const share = Math.max(0, a.groups[g] / a.total);
                return (
                  <span key={g} style={{ flexBasis: `${share * 100}%`, background: COLORS[g] }}>
                    {share > 0.12 ? `${g} ${pct(share, 0)}` : ""}
                  </span>
                );
              })}
            </div>
            <p className="legend">
              {(Object.keys(COLORS) as (keyof typeof COLORS)[]).map((g) => (
                <span key={g}>
                  <i style={{ background: COLORS[g] }} />
                  {g} {pct(Math.max(0, a.groups[g]) / a.total, 0)}
                </span>
              ))}
            </p>
            <table className="data-table" style={{ marginTop: 14 }}>
              <thead>
                <tr>
                  <th>Factor</th>
                  <th>Exposure</th>
                  <th>Var contrib</th>
                  <th>% of var</th>
                </tr>
              </thead>
              <tbody>
                {a.byFactor
                  .filter((r) => Math.abs(r.exposure) > 1e-6)
                  .sort((x, y) => Math.abs(y.contrib) - Math.abs(x.contrib))
                  .map((r) => (
                    <tr key={r.f}>
                      <td>{r.f}</td>
                      <td>{r.exposure >= 0 ? "+" : ""}{r.exposure.toFixed(2)}</td>
                      <td className={r.contrib < 0 ? "neg" : undefined}>{r.contrib.toFixed(4)}</td>
                      <td className={r.contrib < 0 ? "neg" : undefined}>{pct(r.contrib / a.total)}</td>
                    </tr>
                  ))}
                <tr>
                  <td>specific</td>
                  <td></td>
                  <td>{a.specVar.toFixed(4)}</td>
                  <td>{pct(a.specVar / a.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p className="demo__note">
          Watch the specific slice: piling into one name makes idiosyncratic risk dominate, and spreading out shrinks it
          roughly with 1/N. That leaves the market and industry bets, which diversification can&rsquo;t remove. Negative
          rows are hedges: a factor bet that offsets another through their correlation. &ldquo;Min variance&rdquo; is a
          long-only optimizer (projected gradient on the simplex) over the full Σ.
        </p>
      </div>
    </div>
  );
}
