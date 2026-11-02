import { NavLink } from "@/components/NavLink";

export default function NotFound() {
  return (
    <section className="page-head" style={{ borderBottom: 0 }}>
      <p className="kicker">
        <span>Correction</span>
        <span className="kicker__path">zsh: no such file or directory</span>
      </p>
      <h1>This page isn&rsquo;t on the board.</h1>
      <p className="dek">An earlier version of this site may have linked here. Try the board, or press ` and type ls.</p>
      <p style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <NavLink className="button button--primary" href="/board/">
          Go to the board
        </NavLink>
        <NavLink className="button" href="/">
          Front page
        </NavLink>
      </p>
    </section>
  );
}
