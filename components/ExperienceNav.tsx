"use client";

import { Fragment, useEffect, useRef, useState } from "react";

export type NavItem = { id: string; when: string; role: string; org: string; group: string };

/**
 * A strip of small cards, one per role, that sticks under the masthead once you
 * scroll past it. The role you're reading glows; clicking a card scrolls to it.
 * Once stuck, the panel compacts to date and org. The outer box keeps its full
 * height in the flow, so the page below doesn't jump when that happens.
 */
export function ExperienceNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const [stuck, setStuck] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  // While a click's smooth scroll is running, keep the clicked card selected.
  const lockRef = useRef<string | null>(null);

  // The line entries scroll past: the panel's bottom edge, plus a little air.
  const readLine = () => (panelRef.current?.getBoundingClientRect().bottom ?? 0) + 24;
  const mastheadH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--masthead-h")) || 0;

  useEffect(() => {
    const nav = navRef.current;
    const panel = panelRef.current;
    if (!nav || !panel) return;
    // Reserve the expanded height. Measured only while expanded.
    const reserve = () => {
      if (!nav.classList.contains("is-stuck")) nav.style.height = `${panel.offsetHeight}px`;
    };
    let frame = 0;
    const update = () => {
      frame = 0;
      setStuck(nav.getBoundingClientRect().top <= mastheadH() + 1);
      if (lockRef.current) return;
      const line = readLine();
      let current = items[0]?.id;
      for (const { id } of items) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      // The last role may never reach the line; at the bottom of the page, select it.
      const last = document.getElementById(items[items.length - 1]?.id);
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && last && last.getBoundingClientRect().top < window.innerHeight) current = last.id;
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      reserve();
      onScroll();
    };
    const unlock = () => {
      lockRef.current = null;
    };
    reserve();
    document.fonts?.ready.then(reserve);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    for (const ev of ["wheel", "touchstart", "keydown", "mousedown"]) window.addEventListener(ev, unlock, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      for (const ev of ["wheel", "touchstart", "keydown", "mousedown"]) window.removeEventListener(ev, unlock);
    };
  }, [items]);

  // Keep the selected card in view when the strip overflows sideways.
  useEffect(() => {
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!track || !card) return;
    const left = card.offsetLeft - track.offsetLeft;
    if (left < track.scrollLeft || left + card.offsetWidth > track.scrollLeft + track.clientWidth) {
      track.scrollTo({ left: left - 24, behavior: "smooth" });
    }
  }, [active]);

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const nav = navRef.current;
    const panel = panelRef.current;
    if (!nav || !panel) return;
    // Land the entry just under the panel as it will be once stuck (compact), measured without a paint.
    const wasStuck = nav.classList.contains("is-stuck");
    nav.classList.add("is-stuck");
    const compact = panel.offsetHeight;
    if (!wasStuck) nav.classList.remove("is-stuck");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - mastheadH() - compact - 16,
      behavior: reduce ? "auto" : "smooth",
    });
    history.replaceState(null, "", `#${id}`);
    setActive(id);
    // Set after scrollTo: the click's own mousedown has already cleared any old lock.
    lockRef.current = id;
  };

  return (
    <nav ref={navRef} className={`xp-nav${stuck ? " is-stuck" : ""}`} aria-label="Jump to a role">
      <div ref={panelRef} className="xp-nav__panel">
        <ol ref={trackRef} className="xp-nav__track">
          {items.map((it, i) => (
            <Fragment key={it.id}>
              {(i === 0 || items[i - 1].group !== it.group) && (
                <li className="xp-nav__group" aria-hidden>
                  {it.group}
                </li>
              )}
              <li data-id={it.id}>
                <a
                  href={`#${it.id}`}
                  title={`${it.role}, ${it.org} (${it.when})`}
                  className={`xp-card${active === it.id ? " is-active" : ""}`}
                  aria-current={active === it.id ? "location" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    jump(it.id);
                  }}
                >
                  <span className="xp-card__when">{it.when}</span>
                  <span className="xp-card__role">{it.role}</span>
                  <span className="xp-card__org">{it.org}</span>
                </a>
              </li>
            </Fragment>
          ))}
        </ol>
      </div>
    </nav>
  );
}
