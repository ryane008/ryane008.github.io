/** Architecture of the multimodal BBF agent, drawn from networks.py. */
export function AtariDiagram({ compact = false }: { compact?: boolean }) {
  const box = (x: number, y: number, w: number, h: number, title: string, sub?: string, accent = false) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3} fill="var(--card)" stroke={accent ? "var(--red)" : "var(--ink)"} strokeWidth={accent ? 2 : 1.2} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 3 : h / 2 + 5)} textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--ink)">
        {title}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" fontSize="10.5" fill="var(--ink-3)" fontFamily="var(--mono)">
          {sub}
        </text>
      )}
    </g>
  );
  const arrow = (x1: number, y1: number, x2: number, y2: number, red = false) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={red ? "var(--red)" : "var(--ink-2)"} strokeWidth={1.4} markerEnd={`url(#atari-arr${red ? "-red" : ""})`} />
  );
  return (
    <svg
      viewBox="0 0 720 300"
      role="img"
      aria-label="Pixels go through an Impala CNN and audio through a 1-D conv encoder; the two latents are concatenated, then feed a Q-head and a self-predictive transition model"
      style={{ width: "100%", height: "auto", fontFamily: "var(--serif)", maxWidth: compact ? 520 : 720 }}
    >
      <defs>
        {["", "-red"].map((s) => (
          <marker key={s} id={`atari-arr${s}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={s ? "var(--red)" : "var(--ink-2)"} />
          </marker>
        ))}
      </defs>
      {box(10, 40, 130, 56, "Pixels", "4 stacked frames")}
      {box(10, 196, 130, 56, "Audio", "ALE sound samples", true)}
      {box(190, 40, 150, 56, "Impala CNN", "15-layer ResNet, 4× wide")}
      {box(190, 196, 150, 56, "Audio encoder", "3× Conv1D → dense", true)}
      {box(390, 118, 120, 56, "Concat", "spatial latent")}
      {box(560, 50, 150, 56, "Q-head", "dueling · 51 atoms")}
      {box(560, 186, 150, 56, "Transition model", "SPR, 5 steps ahead")}
      {arrow(140, 68, 188, 68)}
      {arrow(140, 224, 188, 224, true)}
      {arrow(340, 68, 388, 136)}
      {arrow(340, 224, 388, 156, true)}
      {arrow(510, 140, 558, 82)}
      {arrow(510, 152, 558, 210)}
      <text x={635} y={278} textAnchor="middle" fontSize="11" fill="var(--ink-3)" fontFamily="var(--mono)">
        self-predictive loss (×5)
      </text>
      {!compact && (
        <text x={10} y={22} fontSize="11" fill="var(--red-ink)" fontFamily="var(--mono)">
          RED = WHAT WE ADDED TO BBF
        </text>
      )}
    </svg>
  );
}
