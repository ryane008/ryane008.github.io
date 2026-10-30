import { NavLink } from "@/components/NavLink";
import { StringsFooter } from "@/components/Article";
import { BOARD_HREF, hrefFor, nodeById } from "@/lib/site";

export default function Home() {
  const story = (id: "barra" | "tcp-ip" | "atari" | "thesis", img?: string, lead = false) => {
    const n = nodeById[id];
    return (
      <NavLink href={hrefFor(id)} className={`story${lead ? " story--lead" : ""}`}>
        {img && (
          <img src={img} alt="" loading={lead ? "eager" : "lazy"} />
        )}
        <span className="story__kicker">{n.kicker}</span>
        <span className="story__title">{n.title}</span>
        <span className="story__dek">{n.dek}</span>
      </NavLink>
    );
  };

  return (
    <>
      <section className="front">
        <div>
          <p className="kicker">
            <span>Front page</span>
            <span className="kicker__path">~/home</span>
          </p>
          <h1>Ryan Eng</h1>
          <p className="dek">
            Computer science and applied math at Brown. I build quantitative models, ML systems, and network software,
            and I bring a reporter&rsquo;s habit to all of it: find out where the numbers came from.
          </p>
          <div className="front__ctas">
            <NavLink href={hrefFor("projects")} className="button button--red">
              Read the investigations →
            </NavLink>
            <NavLink href={hrefFor("resume")} className="button">
              Resume
            </NavLink>
            <NavLink href={BOARD_HREF} className="button">
              See the whole board
            </NavLink>
          </div>
        </div>
        <figure className="front__photo">
          <img src="/media/photos/ryan-bryce-canyon.jpg" alt="Ryan at a snowy overlook in Bryce Canyon" />
        </figure>
      </section>

      <section className="edition" aria-label="Featured work">
        <p className="edition__label">In this edition</p>
        {story("barra", "/media/projects/barra-dashboard.png", true)}
        <div className="stack">
          {story("thesis")}
          {story("tcp-ip")}
          {story("atari")}
        </div>
      </section>

      <section className="howto" aria-labelledby="howto">
        <h2 id="howto">How to read this site</h2>
        <div>
          <h3>Follow the strings</h3>
          <p>
            Every page is a card on a bulletin board, tied to related pages. The strip under the masthead lists the
            strings from wherever you are. Press <kbd>[</kbd> <kbd>]</kbd> to step through them.
          </p>
        </div>
        <div>
          <h3>Zoom the board</h3>
          <p>
            Turn on <b>Zoom</b> in the masthead and page changes pull back to the full board, trace the route, and
            dive into the next card. Or open the <NavLink href={BOARD_HREF}>board</NavLink> directly.
          </p>
        </div>
        <div>
          <h3>Use the shell</h3>
          <p>
            Press <kbd>`</kbd>. The site is a directory tree at <code>/portfolios/users/ryaneng</code>. Try{" "}
            <code>ls</code>, <code>cd projects/barra</code>, <code>traceroute resume</code>, or <code>cd ~</code>.
          </p>
        </div>
      </section>

      <StringsFooter id="home" />
    </>
  );
}
