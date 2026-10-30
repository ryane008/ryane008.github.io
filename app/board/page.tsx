import type { Metadata } from "next";
import { BoardExplorer } from "@/components/BoardExplorer";
import { NavLink } from "@/components/NavLink";
import { HOME_DIR, NODES, hrefFor } from "@/lib/site";

export const metadata: Metadata = { title: "The board" };

/** The tree listing doubles as the accessible, mobile-friendly version of the board. */
function TreeListing() {
  const depth = (p: string) => p.split("/").length - 1;
  return (
    <div className="tree" role="list">
      <div>{HOME_DIR}  (~)</div>
      {NODES.map((n, i) => {
        const d = depth(n.fsPath);
        // Is there a later sibling at level k (before the tree climbs above k)?
        const hasLaterSibling = (k: number) => {
          for (const m of NODES.slice(i + 1)) {
            const dm = depth(m.fsPath);
            if (dm < k) return false;
            if (dm === k) return true;
          }
          return false;
        };
        const rails = Array.from({ length: d }, (_, k) => (hasLaterSibling(k) ? "│   " : "    ")).join("");
        const prefix = rails + (hasLaterSibling(d) ? "├── " : "└── ");
        return (
          <div key={n.id} role="listitem">
            {prefix}
            <NavLink href={hrefFor(n.id)}>{n.fsPath.split("/").pop()}/</NavLink>
            <span className="tree__dek">  {n.title}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function BoardPage() {
  return (
    <>
      <div className="board-head">
        <h1>The board</h1>
        <p>Drag to pan · scroll to zoom · click a card to open it</p>
      </div>
      <BoardExplorer />
      <section className="section">
        <h2>The same board, as a directory</h2>
        <p>
          Red strings tie related pages; the tight ones are close relations, like your resume and your experience.
          The four investigations sit on a subnet behind <code>projects/</code>: their only string runs to the hub,
          so to reach one from anywhere else you route through it.
        </p>
        <TreeListing />
      </section>
    </>
  );
}
