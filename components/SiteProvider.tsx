"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NodeId, nodeForPath } from "@/lib/site";

export type Place = NodeId | "board";
export type Transition = { from: Place; to: Place; href: string; hash: string };

type SiteCtx = {
  animate: boolean;
  setAnimate: (on: boolean) => void;
  shellOpen: boolean;
  setShellOpen: (open: boolean | ((o: boolean) => boolean)) => void;
  transition: Transition | null;
  endTransition: () => void;
  /** Navigate within the site, zooming through the board when animation is on. */
  go: (href: string) => void;
  current: Place | null;
};

const Ctx = createContext<SiteCtx | null>(null);
const ANIM_KEY = "ryaneng:animate";

export function useSite() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSite outside SiteProvider");
  return ctx;
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const current = nodeForPath(pathname);
  // Opt-in: off until the visitor turns it on. Read after mount so the static
  // HTML and the first client render agree.
  const [animate, setAnimateState] = useState(false);
  const [shellOpen, setShellOpen] = useState(false);
  const [transition, setTransition] = useState<Transition | null>(null);

  useEffect(() => {
    try {
      setAnimateState(localStorage.getItem(ANIM_KEY) === "on");
    } catch {}
  }, []);

  const setAnimate = useCallback((on: boolean) => {
    setAnimateState(on);
    try {
      localStorage.setItem(ANIM_KEY, on ? "on" : "off");
    } catch {}
  }, []);

  const go = useCallback(
    (target: string) => {
      const [path, hash = ""] = target.split("#");
      const to = nodeForPath(path || "/");
      const samePage = (path || "/").replace(/\/+$/, "") === pathname.replace(/\/+$/, "");
      if (samePage) {
        if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      if (animate && to && current && !transition) {
        router.prefetch(path);
        setTransition({ from: current, to, href: path, hash });
      } else {
        router.push(target);
      }
    },
    [animate, current, pathname, router, transition],
  );

  const endTransition = useCallback(() => setTransition(null), []);

  const value = useMemo(
    () => ({ animate, setAnimate, shellOpen, setShellOpen, transition, endTransition, go, current }),
    [animate, setAnimate, shellOpen, transition, endTransition, go, current],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
