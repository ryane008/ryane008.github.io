// The read-only virtual filesystem behind the shell. Directories under ~ are
// pages; files are either text you can `cat` or things you can `open`.

import { BOARD_HREF, HOME_DIR, NODES, NodeId, hrefFor, nodeById } from "./site";

export type VNode = {
  name: string;
  type: "dir" | "file";
  children?: VNode[];
  /** Text shown by `cat`. */
  content?: string;
  /** Dirs: page to navigate to. Files: URL to open. */
  href?: string;
  /** Files only: open in a new tab rather than navigating. */
  external?: boolean;
};

const readme = (id: NodeId, extra = ""): VNode => {
  const n = nodeById[id];
  return {
    name: "README.md",
    type: "file",
    content: `# ${n.title}\n\n${n.dek}${extra ? `\n\n${extra}` : ""}\n\n→ open . to read the page`,
  };
};

const dir = (name: string, children: VNode[], href?: string): VNode => ({ name, type: "dir", children, href });
const page = (id: NodeId, children: VNode[] = [], extra = "") =>
  dir(nodeById[id].fsPath.split("/").pop()!, [readme(id, extra), ...children], hrefFor(id));

const demo = (id: NodeId, what: string): VNode => ({
  name: "demo",
  type: "file",
  href: `${hrefFor(id)}#demo`,
  content: `#!/bin/sh\n# ${what}\n# run with: open demo`,
});

const BASHRC = `# ~/.bashrc
alias home='cd ~/home'
alias board='cd ~'
alias strings='neighbors'
alias ll='ls -l'
export ANIMATE=off   # toggle with: anim on`;

export const ROOT: VNode = dir("", [
  dir("portfolios", [
    dir("users", [
      dir(
        "ryaneng",
        [
          { name: ".bashrc", type: "file", content: BASHRC },
          page("home"),
          page("about", [
            dir("clippings", [
              {
                name: "the-classic-2021-hepa.url",
                type: "file",
                href: "https://thhsclassic.com/15023/news/the-doe-calls-the-air-purifiers-that-will-be-in-nyc-classrooms-hepa-purifiers-the-classic-asked-the-cdc-if-thats-accurate-heres-how-the-cdc-responded/",
                external: true,
                content:
                  'The Classic, Aug. 31, 2021 · by Jasmine Palma and Ryan Eng\n"The DOE calls the air purifiers that will be in NYC classrooms \'HEPA purifiers.\' The Classic asked the CDC if that\'s accurate."\n\n→ open the-classic-2021-hepa.url',
              },
            ]),
            page("interests", [
              { name: "technical.md", type: "file", href: "/about/interests/#technical", content: "Quant finance · factor models · reinforcement learning · networks & systems · data journalism · sports analytics · quantum computing" },
              { name: "hobbies.md", type: "file", href: "/about/interests/#hobbies", content: "Soccer (Premier League) · running & track · swimming · hiking · photography · cooking · music · volunteering" },
            ]),
          ]),
          page("experience"),
          page("resume", [
            { name: "resume.pdf", type: "file", href: "/media/docs/ryan-eng-resume.pdf", external: true, content: "%PDF-1.7 (binary) → open resume.pdf" },
          ]),
          page(
            "projects",
            [
              page("barra", [demo("barra", "Interactive risk decomposition on a synthetic universe")]),
              page("tcp-ip", [demo("tcp-ip", "Simulated TCP transfer over a lossy link")]),
              page("atari"),
              page("thesis"),
            ],
            NODES.filter((n) => n.kind === "spoke")
              .map((n) => `  ${n.fsPath.split("/").pop()}/  ${n.dek}`)
              .join("\n"),
          ),
        ],
        BOARD_HREF,
      ),
    ]),
  ]),
]);

export function displayPath(abs: string): string {
  if (abs === HOME_DIR) return "~";
  if (abs.startsWith(HOME_DIR + "/")) return "~" + abs.slice(HOME_DIR.length);
  return abs || "/";
}

/** Resolve `arg` against `cwd` into a normalized absolute path. */
export function resolvePath(cwd: string, arg: string): string {
  let p = arg.trim();
  if (p === "" || p === "~") return HOME_DIR;
  if (p.startsWith("~/")) p = HOME_DIR + p.slice(1);
  else if (!p.startsWith("/")) p = `${cwd}/${p}`;
  const out: string[] = [];
  for (const seg of p.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") out.pop();
    else out.push(seg);
  }
  return "/" + out.join("/");
}

export function lookup(abs: string): VNode | null {
  let cur: VNode = ROOT;
  for (const seg of abs.split("/").filter(Boolean)) {
    const next = cur.children?.find((c) => c.name === seg);
    if (!next) return null;
    cur = next;
  }
  return cur;
}

/** The shell directory that corresponds to a page URL. */
export function dirForHref(pathname: string): string {
  const p = pathname.replace(/\/+$/, "");
  if (p === "" || p === "/home") return `${HOME_DIR}/home`;
  if (p === "/board") return HOME_DIR;
  return HOME_DIR + p;
}
