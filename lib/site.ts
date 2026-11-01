// Single source of truth for the site's structure.
//
// Two structures live here and are deliberately separate:
//   - the directory tree (`fsPath`), which the shell shows and URLs mirror
//   - the graph (`EDGES`), the "strings" on the bulletin board
// Interests, for example, lives under about/ in the tree but is its own node on
// the board. Projects are spokes: their only string runs to the projects hub,
// like hosts on a subnet behind a router.

export type NodeId =
  | "home"
  | "about"
  | "interests"
  | "experience"
  | "resume"
  | "projects"
  | "barra"
  | "tcp-ip"
  | "atari"
  | "thesis";

export type SiteNode = {
  id: NodeId;
  title: string;
  /** Short label used in the navbar and neighbor chips. */
  short: string;
  /** Path relative to ~ (/portfolios/users/ryaneng). */
  fsPath: string;
  kicker: string;
  dek: string;
  kind: "main" | "spoke";
  /** Card rectangle in board (world) coordinates. */
  box: { x: number; y: number; w: number; h: number; rotate: number };
  image?: string;
};

export const HOME_DIR = "/portfolios/users/ryaneng";
export const WORLD = { w: 2400, h: 1720 };

const main = (cx: number, cy: number, rotate: number, w = 340, h = 210) => ({
  x: cx - w / 2,
  y: cy - h / 2,
  w,
  h,
  rotate,
});
const spoke = (cx: number, cy: number, rotate: number) => main(cx, cy, rotate, 270, 170);

export const NODES: SiteNode[] = [
  {
    id: "home",
    title: "Ryan Eng",
    short: "Home",
    fsPath: "home",
    kicker: "Front page",
    dek: "Computer Science and Applied Math @ Brown. Researcher, engineer, data scientist. Applying quantitative methods to investigate, interpret, learn, and problem-solve the mysteries of yesterday, today, and tomorrow.",
    kind: "main",
    box: main(1200, 720, -0.6, 440, 270),
    image: "/media/photos/ryan-bryce-canyon.jpg",
  },
  {
    id: "about",
    title: "About me",
    short: "About",
    fsPath: "about",
    kicker: "Profile",
    dek: "Where I'm from, Brown, the newsroom \u201cfeatures beat\u201d on me, and where I'm headed.",
    kind: "main",
    box: main(640, 380, 1.4),
    image: "/media/photos/ryan-hiking-boulders.jpg",
  },
  {
    id: "interests",
    title: "Interests",
    short: "Interests",
    fsPath: "about/interests",
    kicker: "Profile / Interests",
    dek: "The technical rabbit holes and the things I do away from a keyboard.",
    kind: "main",
    box: main(390, 800, -1.8),
    image: "/media/photos/ryan-race-finish.jpg",
  },
  {
    id: "experience",
    title: "Professional experience",
    short: "Experience",
    fsPath: "experience",
    kicker: "Record",
    dek: "AWS, Trexquant quantitative research, NFL draft scouting, research at Brown University, and a large language model healthcare startup (top 10%).",
    kind: "main",
    box: main(1780, 380, -1.2),
  },
  {
    id: "resume",
    title: "Resume",
    short: "Resume",
    fsPath: "resume",
    kicker: "Record / PDF",
    dek: "The one-page version.",
    kind: "main",
    box: main(2040, 790, 2.0, 300, 200),
  },
  {
    id: "projects",
    title: "Project work",
    short: "Projects",
    fsPath: "projects",
    kicker: "Investigations",
    dek: "Barra risk models, a TCP stack, sample-efficient RL, and a thesis on climatology.",
    kind: "main",
    box: main(1200, 1150, 0.8),
    image: "/media/projects/barra-dashboard.png",
  },
  {
    id: "barra",
    title: "Barra risk model",
    short: "Barra",
    fsPath: "projects/barra",
    kicker: "Investigation 01",
    dek: "A USE4-style equity factor risk model, from WRDS pull to dashboard.",
    kind: "spoke",
    box: spoke(720, 1450, -2.2),
  },
  {
    id: "tcp-ip",
    title: "TCP/IP in Rust",
    short: "TCP/IP",
    fsPath: "projects/tcp-ip",
    kicker: "Investigation 02",
    dek: "Virtual hosts, RIP routing, and a TCP with sliding windows and retransmission.",
    kind: "spoke",
    box: spoke(1040, 1560, 1.6),
  },
  {
    id: "atari",
    title: "Multimodal Atari RL",
    short: "Atari RL",
    fsPath: "projects/atari",
    kicker: "Investigation 03",
    dek: "Re-implementing BBF in TensorFlow and letting the agent hear the game.",
    kind: "spoke",
    box: spoke(1370, 1560, -1.0),
  },
  {
    id: "thesis",
    title: "Honors thesis",
    short: "Thesis",
    fsPath: "projects/thesis",
    kicker: "Investigation 04",
    dek: "Using quantitative methods (information theory, constrained optimization, data engineering, data science) to inform where Rhode Island should place rain sensors for flood response and climate resilience.",
    kind: "spoke",
    box: spoke(1690, 1450, 2.4),
    image: "/media/projects/thesis-eofs.png",
  },
];

/** [a, b, strength]. Strength 2 = short, tight string; 1 = normal; 0 = spoke. */
export const EDGES: [NodeId, NodeId, 0 | 1 | 2][] = [
  ["experience", "resume", 2],
  ["about", "interests", 2],
  ["home", "about", 1],
  ["home", "experience", 1],
  ["home", "projects", 1],
  ["experience", "projects", 1],
  ["resume", "projects", 1],
  ["interests", "projects", 1],
  ["projects", "barra", 0],
  ["projects", "tcp-ip", 0],
  ["projects", "atari", 0],
  ["projects", "thesis", 0],
];

/** Pinned decorations: not navigable, not in the graph. */
export type Decor =
  | { kind: "photo"; src: string; alt: string; x: number; y: number; w: number; h: number; rotate: number }
  | { kind: "clipping"; x: number; y: number; w: number; rotate: number; tie: NodeId };

export const DECOR: Decor[] = [
  { kind: "clipping", x: 90, y: 90, w: 300, rotate: -3, tie: "about" },
  { kind: "photo", src: "/media/photos/empire-state-night.jpg", alt: "Empire State Building at night", x: 1000, y: 120, w: 170, h: 226, rotate: 3.5 },
  { kind: "photo", src: "/media/photos/bryce-hoodoo-sky.jpg", alt: "Red rock hoodoo against blue sky", x: 1240, y: 90, w: 160, h: 213, rotate: -2.5 },
  { kind: "photo", src: "/media/photos/osprey-perched.jpg", alt: "Osprey on a pine branch", x: 2120, y: 120, w: 220, h: 165, rotate: 2.8 },
  { kind: "photo", src: "/media/photos/autumn-sunrise-maple.jpg", alt: "Sun through red maple leaves", x: 70, y: 1110, w: 230, h: 172, rotate: 2.2 },
  { kind: "photo", src: "/media/photos/beach-sunset-waves.jpg", alt: "Low beach sunset", x: 2050, y: 1180, w: 240, h: 180, rotate: -3 },
  { kind: "photo", src: "/media/photos/deer-in-forest.jpg", alt: "Deer in a forest", x: 120, y: 1420, w: 220, h: 147, rotate: -1.5 },
  { kind: "photo", src: "/media/photos/fireworks-over-water.jpg", alt: "Fireworks over water", x: 2210, y: 420, w: 140, h: 187, rotate: 3 },
];

export const nodeById = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<NodeId, SiteNode>;

export function hrefFor(id: NodeId): string {
  return id === "home" ? "/" : `/${nodeById[id].fsPath}/`;
}

export const BOARD_HREF = "/board/";

/** Map a URL pathname to its node, or "board" for the overview, or null. */
export function nodeForPath(pathname: string): NodeId | "board" | null {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/") return "home";
  if (p === "/board") return "board";
  const hit = NODES.find((n) => `/${n.fsPath}` === p);
  return hit ? hit.id : null;
}

export function neighbors(id: NodeId): { id: NodeId; strength: 0 | 1 | 2 }[] {
  const out: { id: NodeId; strength: 0 | 1 | 2 }[] = [];
  for (const [a, b, s] of EDGES) {
    if (a === id) out.push({ id: b, strength: s });
    else if (b === id) out.push({ id: a, strength: s });
  }
  // Strongest ties first, then board order.
  const order = NODES.map((n) => n.id);
  return out.sort((x, y) => y.strength - x.strength || order.indexOf(x.id) - order.indexOf(y.id));
}

/** Shortest route along the strings (BFS). Used by traceroute and the zoom transition. */
export function route(from: NodeId, to: NodeId): NodeId[] {
  const prev = new Map<NodeId, NodeId | null>([[from, null]]);
  const queue: NodeId[] = [from];
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur === to) break;
    for (const { id } of neighbors(cur)) {
      if (!prev.has(id)) {
        prev.set(id, cur);
        queue.push(id);
      }
    }
  }
  if (!prev.has(to)) return [];
  const path: NodeId[] = [];
  for (let c: NodeId | null = to; c; c = prev.get(c) ?? null) path.unshift(c);
  return path;
}

/** Pin position (top-center of a card), where strings attach. */
export function pinOf(id: NodeId) {
  const b = nodeById[id].box;
  return { x: b.x + b.w / 2, y: b.y + 16 };
}

export const MAIN_NAV: NodeId[] = ["home", "about", "experience", "resume", "projects"];
