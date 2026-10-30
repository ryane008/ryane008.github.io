"use client";

import Link from "next/link";
import { useSite } from "./SiteProvider";

type Props = Omit<React.ComponentProps<typeof Link>, "href"> & { href: string };

/** An internal link that routes through `go`, so it zooms when animation is on. */
export function NavLink({ href, onClick, ...rest }: Props) {
  const { go } = useSite();
  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        go(href);
      }}
      {...rest}
    />
  );
}
