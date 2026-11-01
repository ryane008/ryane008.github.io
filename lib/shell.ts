// Command interpreter for the popup shell. Pure: takes argv + context, returns
// what to print and which side effects (navigate, open, toggle) to perform.

import { HOME_DIR, NODES, NodeId, neighbors, nodeById, route } from "./site";
import { VNode, displayPath, lookup, resolvePath } from "./vfs";

export type Ctx = {
  cwd: string;
  prevCwd: string;
  history: string[];
  animate: boolean;
};

export type Result = {
  out?: string[];
  error?: boolean;
  cwd?: string;
  navigate?: string;
  openUrl?: string;
  clear?: boolean;
  close?: boolean;
  animate?: boolean;
};

export const ALIASES: Record<string, string> = {
  home: "cd ~/home",
  board: "cd ~",
  strings: "neighbors",
  ll: "ls -l",
  "..": "cd ..",
  "~": "cd ~",
};

const HELP = [
  "Navigation",
  "  ls [-al] [path]     list a directory",
  "  cd [path]           change directory and open that page   (cd ~ → the board)",
  "  pwd                 print working directory",
  "  tree [path]         show the directory tree",
  "  cat <file>          print a file",
  "  open <path>         open a page, PDF, or link",
  "",
  "The graph",
  "  neighbors           strings attached to this page            (alias: strings)",
  "  ping <page>         how many strings away a page is",
  "  traceroute <page>   the route along the strings",
  "",
  "Session",
  "  anim [on|off]       toggle UI Mode (zoom transitions)",
  "  history · clear · echo · whoami · date · alias · exit",
  "",
  "Aliases: home → cd ~/home, board → cd ~, ll → ls -l",
  "Keys: Tab completes · ↑/↓ history · ` or Esc toggles this shell",
];

export const COMMANDS = [
  "ls", "cd", "pwd", "tree", "cat", "open", "neighbors", "ping", "traceroute",
  "anim", "history", "clear", "echo", "whoami", "date", "alias", "help", "exit",
];

/** Split a command line on whitespace, honoring single and double quotes. */
export function tokenize(line: string): string[] {
  const out: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}

export function expandAlias(line: string): string {
  const [head, ...rest] = tokenize(line);
  if (head && ALIASES[head]) return [ALIASES[head], ...rest].join(" ");
  return line;
}

/** Which graph node, if any, a shell directory is. */
export function nodeAtDir(abs: string): NodeId | null {
  const n = NODES.find((x) => `${HOME_DIR}/${x.fsPath}` === abs);
  return n ? n.id : null;
}

/** Accept a node id, a page name, or a path. */
function findNode(cwd: string, arg: string): NodeId | null {
  const lower = arg.toLowerCase().replace(/\/+$/, "");
  const byName = NODES.find((n) => n.id === lower || n.fsPath === lower || n.fsPath.endsWith(`/${lower}`));
  if (byName) return byName.id;
  return nodeAtDir(resolvePath(cwd, arg));
}

const label = (id: NodeId) => `~/${nodeById[id].fsPath}`;

/** A missing relative path that exists under ~ is almost always what was meant. */
function missing(msg: string, ctx: Ctx, arg: string): Result {
  const out = [msg];
  if (!arg.startsWith("/") && !arg.startsWith("~") && ctx.cwd !== HOME_DIR && lookup(resolvePath(HOME_DIR, arg))) {
    out.push(`hint: did you mean ~/${arg.replace(/^\.\//, "")} ?`);
  }
  return { out, error: true };
}

function listing(node: VNode, all: boolean, long: boolean): string[] {
  const kids = (node.children ?? []).filter((c) => all || !c.name.startsWith("."));
  const names = kids.map((c) => (c.type === "dir" ? `${c.name}/` : c.name));
  if (all) names.unshift("./", "../");
  if (!long) return names.length ? [names.join("  ")] : [];
  return kids.map((c) => {
    const mode = c.type === "dir" ? "drwxr-xr-x" : c.external ? "lrwxr-xr-x" : "-rw-r--r--";
    const size = String(c.type === "dir" ? (c.children?.length ?? 0) * 64 : (c.content?.length ?? 0)).padStart(5);
    const target = c.external && c.href ? ` -> ${c.href.length > 48 ? c.href.slice(0, 45) + "..." : c.href}` : "";
    return `${mode}  ryaneng  staff  ${size}  Oct 30  ${c.type === "dir" ? c.name + "/" : c.name}${target}`;
  });
}

function tree(node: VNode, prefix = ""): string[] {
  const kids = (node.children ?? []).filter((c) => !c.name.startsWith("."));
  return kids.flatMap((c, i) => {
    const last = i === kids.length - 1;
    const line = `${prefix}${last ? "└── " : "├── "}${c.type === "dir" ? c.name + "/" : c.name}`;
    return c.type === "dir" ? [line, ...tree(c, prefix + (last ? "    " : "│   "))] : [line];
  });
}

export function exec(argv: string[], ctx: Ctx): Result {
  const [cmd, ...args] = argv;
  const flags = new Set(args.filter((a) => a.startsWith("-") && a !== "-").flatMap((a) => a.slice(1).split("")));
  const operands = args.filter((a) => !a.startsWith("-") || a === "-");

  switch (cmd) {
    case undefined:
      return {};
    case "help":
    case "man":
      return { out: HELP };
    case "pwd":
      return { out: [ctx.cwd] };
    case "whoami":
      return { out: ["guest  (browsing /portfolios/users/ryaneng)"] };
    case "date":
      return { out: [new Date().toString()] };
    case "echo":
      return { out: [args.join(" ")] };
    case "clear":
      return { clear: true };
    case "exit":
      return { close: true };
    case "history":
      return { out: ctx.history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`) };
    case "alias":
      return { out: Object.entries(ALIASES).map(([k, v]) => `alias ${k}='${v}'`) };
    case "sudo":
      return { out: ["guest is not in the sudoers file. This incident will be reported to the editor."], error: true };

    case "ls": {
      const targets = operands.length ? operands : ["."];
      const out: string[] = [];
      for (const t of targets) {
        const abs = resolvePath(ctx.cwd, t);
        const node = lookup(abs);
        if (!node) return missing(`ls: ${t}: No such file or directory`, ctx, t);
        if (targets.length > 1) out.push(`${displayPath(abs)}:`);
        out.push(...(node.type === "dir" ? listing(node, flags.has("a"), flags.has("l")) : [node.name]));
      }
      return { out };
    }

    case "cd": {
      const arg = operands[0] ?? "~";
      const abs = arg === "-" ? ctx.prevCwd : resolvePath(ctx.cwd, arg);
      const node = lookup(abs);
      if (!node) return missing(`cd: no such file or directory: ${arg}`, ctx, arg);
      if (node.type !== "dir") return { out: [`cd: not a directory: ${arg}`], error: true };
      return { cwd: abs, navigate: node.href };
    }

    case "tree": {
      const abs = resolvePath(ctx.cwd, operands[0] ?? ".");
      const node = lookup(abs);
      if (!node || node.type !== "dir") return { out: [`tree: ${operands[0] ?? "."}: not a directory`], error: true };
      const dirs = JSON.stringify(node).match(/"type":"dir"/g)!.length - 1;
      const files = JSON.stringify(node).match(/"type":"file"/g)?.length ?? 0;
      return { out: [displayPath(abs), ...tree(node), "", `${dirs} directories, ${files} files`] };
    }

    case "cat": {
      if (!operands.length) return { out: ["usage: cat <file>"], error: true };
      const out: string[] = [];
      for (const t of operands) {
        const node = lookup(resolvePath(ctx.cwd, t));
        if (!node) return missing(`cat: ${t}: No such file or directory`, ctx, t);
        if (node.type === "dir") return { out: [`cat: ${t}: Is a directory`], error: true };
        out.push(...(node.content ?? "").split("\n"));
      }
      return { out };
    }

    case "open": {
      const t = operands[0] ?? ".";
      const abs = resolvePath(ctx.cwd, t);
      const node = lookup(abs);
      if (!node) return missing(`open: ${t}: No such file or directory`, ctx, t);
      if (!node.href) return { out: [`open: ${t}: nothing to open here; try ls`], error: true };
      if (node.external) return { out: [`opening ${node.name} in a new tab…`], openUrl: node.href };
      return node.type === "dir" ? { cwd: abs, navigate: node.href } : { navigate: node.href };
    }

    case "anim": {
      const v = operands[0];
      if (v === "on" || v === "off") return { animate: v === "on", out: [`UI Mode ${v}`] };
      return { out: [`UI Mode is ${ctx.animate ? "on" : "off"}  (usage: anim on|off)`] };
    }

    case "neighbors": {
      const here = nodeAtDir(ctx.cwd);
      if (!here) return { out: ["neighbors: this directory isn't on the board. cd into a page first."], error: true };
      const kind = { 2: "close tie", 1: "related  ", 0: "subnet   " } as const;
      return {
        out: neighbors(here).map(({ id, strength }) => `${kind[strength]}  ${label(id)}  ${nodeById[id].title}`),
      };
    }

    case "ping":
    case "traceroute": {
      const here = nodeAtDir(ctx.cwd);
      const t = operands[0];
      if (!t) return { out: [`usage: ${cmd} <page>`], error: true };
      const dest = findNode(ctx.cwd, t);
      if (!dest) return { out: [`${cmd}: cannot resolve ${t}: Unknown host`], error: true };
      if (!here) return { out: [`${cmd}: you're off the board. cd ~/home first.`], error: true };
      const path = route(here, dest);
      const hops = path.length - 1;
      if (cmd === "ping") {
        const ms = (k: number) => (hops * 11.3 + 0.4 + ((k * 7) % 5) * 0.37).toFixed(3);
        return {
          out: [
            `PING ${label(dest)}: ${hops} string${hops === 1 ? "" : "s"} away`,
            ...[0, 1, 2].map((k) => `64 bytes from ${label(dest)}: icmp_seq=${k} hops=${hops} time=${ms(k)} ms`),
            `--- ${label(dest)} ping statistics ---`,
            "3 packets transmitted, 3 packets received, 0.0% packet loss",
          ],
        };
      }
      return {
        out: [
          `traceroute to ${label(dest)}, ${NODES.length} hops max`,
          ...path.map((id, i) => `${String(i).padStart(2)}  ${label(id).padEnd(26)} ${(i * 11.3 + 0.21).toFixed(3)} ms`),
        ],
      };
    }

    default:
      return { out: [`zsh: command not found: ${cmd}  (try help)`], error: true };
  }
}

/** Tab completion: commands for the first word, paths after that. */
export function complete(line: string, cwd: string): string {
  const endsWithSpace = /\s$/.test(line);
  const parts = tokenize(line);
  if (parts.length === 0) return line;
  if (parts.length === 1 && !endsWithSpace) {
    const hits = [...COMMANDS, ...Object.keys(ALIASES)].filter((c) => c.startsWith(parts[0]));
    return hits.length === 1 ? `${hits[0]} ` : commonPrefix(hits) || line;
  }
  const partial = endsWithSpace ? "" : parts[parts.length - 1];
  const slash = partial.lastIndexOf("/");
  const dirPart = slash >= 0 ? partial.slice(0, slash + 1) : "";
  const stem = partial.slice(slash + 1);
  const dir = lookup(resolvePath(cwd, dirPart || "."));
  const hits = (dir?.children ?? [])
    .filter((c) => c.name.startsWith(stem) && (stem.startsWith(".") || !c.name.startsWith(".")))
    .map((c) => c.name + (c.type === "dir" ? "/" : ""));
  const done = hits.length === 1 ? hits[0] : commonPrefix(hits);
  if (!done) return line;
  const base = endsWithSpace ? line : line.slice(0, line.length - partial.length);
  return base + dirPart + done;
}

function commonPrefix(xs: string[]): string {
  if (!xs.length) return "";
  let p = xs[0];
  for (const x of xs) while (!x.startsWith(p)) p = p.slice(0, -1);
  return p;
}

