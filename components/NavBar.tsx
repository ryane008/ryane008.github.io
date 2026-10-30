"use client";

import { useEffect, useRef } from "react";
import { BOARD_HREF, MAIN_NAV, hrefFor, neighbors, nodeById } from "@/lib/site";
import { NavLink } from "./NavLink";
import { useSite } from "./SiteProvider";

export function NavBar() {
  const { current, animate, setAnimate, shellOpen, setShellOpen } = useSite();
  const chipsRef = useRef<HTMLDivElement>(null);
  const strings = current && current !== "board" ? neighbors(current) : [];
  const section = current && current !== "board" ? nodeById[current] : null;
  // The main-nav item to underline: a spoke or a subpage lights up its parent.
  const activeMain =
    current === "board" ? "board" : section ? (MAIN_NAV.find((id) => section.fsPath.startsWith(nodeById[id].fsPath)) ?? null) : null;

  // ` toggles the shell; [ and ] step between neighboring nodes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, [contenteditable=true]") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "`") {
        e.preventDefault();
        setShellOpen((o) => !o);
      } else if (e.key === "[" || e.key === "]") {
        const chips = Array.from(chipsRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);
        if (!chips.length) return;
        e.preventDefault();
        const i = chips.indexOf(document.activeElement as HTMLAnchorElement);
        const next = i < 0 ? (e.key === "]" ? 0 : chips.length - 1) : (i + (e.key === "]" ? 1 : -1) + chips.length) % chips.length;
        chips[next].focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setShellOpen]);

  return (
    <header className="masthead">
      <div className="masthead__row">
        <NavLink href="/" className="masthead__name">
          Ryan Eng
        </NavLink>
        <nav className="masthead__nav" aria-label="Sections">
          {MAIN_NAV.map((id) => (
            <NavLink key={id} href={hrefFor(id)} className={activeMain === id ? "is-active" : undefined} aria-current={current === id ? "page" : undefined}>
              {nodeById[id].short}
            </NavLink>
          ))}
          <NavLink href={BOARD_HREF} className={activeMain === "board" ? "is-active" : undefined}>
            Board
          </NavLink>
        </nav>
        <div className="masthead__tools">
          <label className="toggle" title="Zoom through the bulletin board when you change pages">
            <input type="checkbox" checked={animate} onChange={(e) => setAnimate(e.target.checked)} />
            <span className="toggle__track" aria-hidden />
            <span className="toggle__label">Zoom</span>
          </label>
          <button
            type="button"
            className={`shell-btn${shellOpen ? " is-on" : ""}`}
            onClick={() => setShellOpen((o) => !o)}
            aria-expanded={shellOpen}
            title="Open the shell (`)"
          >
            &gt;_
          </button>
        </div>
      </div>
      <div className="masthead__strings">
        <span className="masthead__path">{section ? `~/${section.fsPath}` : current === "board" ? "~" : ""}</span>
        {strings.length > 0 && (
          <div className="chips" ref={chipsRef} aria-label="Connected pages">
            <span className="chips__label">Strings</span>
            {strings.map(({ id, strength }) => (
              <NavLink key={id} href={hrefFor(id)} className={`chip chip--s${strength}`}>
                {nodeById[id].short}
              </NavLink>
            ))}
            <kbd className="chips__hint" title="Press [ or ] to step between strings">[ ]</kbd>
          </div>
        )}
      </div>
    </header>
  );
}
