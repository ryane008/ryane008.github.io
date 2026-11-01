"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { complete, exec, expandAlias, tokenize } from "@/lib/shell";
import { dirForHref, displayPath } from "@/lib/vfs";
import { useSite } from "./SiteProvider";

type Line = { kind: "in" | "out" | "err"; text: string; prompt?: string };

const WELCOME: Line[] = [
  { kind: "out", text: `Last login: ${new Date().toDateString()} on ttys001` },
  { kind: "out", text: "You're browsing /portfolios/users/ryaneng as guest. Type help for commands." },
  { kind: "out", text: "Every directory is a page: cd moves you around the site, and cd ~ zooms out to the board." },
];

const prompt = (cwd: string) => `guest@ryaneng:${displayPath(cwd)}$`;

/** Paint directory names (trailing slash) like a colored ls. */
function Colored({ text }: { text: string }) {
  const parts = text.split(/(\S+\/)(?=\s|$)/g);
  return (
    <>
      {parts.map((p, i) => (p.endsWith("/") && i % 2 === 1 ? <span key={i} className="sh-dir">{p}</span> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}

export function Shell() {
  const { shellOpen, setShellOpen, go, animate, setAnimate } = useSite();
  const pathname = usePathname();
  const [cwd, setCwd] = useState(() => dirForHref(pathname));
  const [prevCwd, setPrevCwd] = useState(cwd);
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Follow the page: navigating by navbar or board moves the shell too.
  useEffect(() => {
    setCwd(dirForHref(pathname));
  }, [pathname]);

  useEffect(() => {
    if (shellOpen) inputRef.current?.focus();
  }, [shellOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines, shellOpen]);

  const run = (raw: string) => {
    const line = raw.trim();
    const echo: Line = { kind: "in", text: raw, prompt: prompt(cwd) };
    if (!line) return setLines((l) => [...l, echo]);
    const nextHistory = [...history, line];
    setHistory(nextHistory);
    setHistIdx(null);

    const r = exec(tokenize(expandAlias(line)), { cwd, prevCwd, history: nextHistory, animate });
    if (r.clear) return setLines([]);
    setLines((l) => [...l, echo, ...(r.out ?? []).map((text) => ({ kind: r.error ? "err" : "out", text }) as Line)]);
    if (r.cwd && r.cwd !== cwd) {
      setPrevCwd(cwd);
      setCwd(r.cwd);
    }
    if (r.animate !== undefined) setAnimate(r.animate);
    if (r.openUrl) window.open(r.openUrl, "_blank", "noopener");
    if (r.navigate) go(r.navigate);
    if (r.close) setShellOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(input);
      setInput("");
    } else if (e.key === "Tab") {
      e.preventDefault();
      setInput(complete(input, cwd));
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      if (!history.length) return;
      const up = e.key === "ArrowUp";
      const idx = histIdx === null ? (up ? history.length - 1 : null) : histIdx + (up ? -1 : 1);
      if (idx === null || idx >= history.length) {
        setHistIdx(null);
        setInput("");
      } else {
        const i = Math.max(0, idx);
        setHistIdx(i);
        setInput(history[i]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      setLines((l) => [...l, { kind: "in", text: `${input}^C`, prompt: prompt(cwd) }]);
      setInput("");
    } else if (e.key === "Escape" || e.key === "`") {
      e.preventDefault();
      setShellOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {shellOpen && (
        <motion.section
          className="shell"
          aria-label="Shell"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 420, damping: 40 }}
        >
          <header className="shell__bar">
            <span className="shell__dots">
              <button type="button" onClick={() => setShellOpen(false)} aria-label="Close shell" title="Close" />
              <i aria-hidden /> <i aria-hidden />
            </span>
            <span className="shell__title">guest@ryaneng — {displayPath(cwd)} — zsh</span>
            <button type="button" className="shell__close" onClick={() => setShellOpen(false)} aria-label="Close shell" title="Close (esc)">
              ×
            </button>
          </header>
          <div ref={scrollRef} className="shell__body" onClick={() => inputRef.current?.focus()}>
            {lines.map((l, i) => (
              <div key={i} className={`sh-line sh-${l.kind}`}>
                {l.prompt && <span className="sh-prompt">{l.prompt} </span>}
                {l.kind === "in" ? l.text : <Colored text={l.text} />}
              </div>
            ))}
            <label className="sh-line sh-input">
              <span className="sh-prompt">{prompt(cwd)} </span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                aria-label="Shell command"
              />
            </label>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
