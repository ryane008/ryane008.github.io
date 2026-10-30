import { NodeId, hrefFor, neighbors, nodeById } from "@/lib/site";
import { NavLink } from "./NavLink";

export function PageHeader({ id, title, dek, meta }: { id: NodeId; title?: string; dek?: React.ReactNode; meta?: React.ReactNode }) {
  const n = nodeById[id];
  return (
    <header className="page-head">
      <p className="kicker">
        <span>{n.kicker}</span>
        <span className="kicker__path">~/{n.fsPath}</span>
      </p>
      <h1>{title ?? n.title}</h1>
      <p className="dek">{dek ?? n.dek}</p>
      {meta && <p className="byline">{meta}</p>}
    </header>
  );
}

export function Figure({
  src,
  alt,
  caption,
  credit,
  wide,
  crop,
  width,
  height,
}: {
  src: string;
  alt: string;
  caption?: React.ReactNode;
  credit?: string;
  wide?: boolean;
  /** Show the top of a tall image, linking to the full one. */
  crop?: boolean;
  width?: number;
  height?: number;
}) {
  return (
    <figure className={`figure${wide ? " figure--wide" : ""}${crop ? " figure--crop" : ""}`}>
      {crop ? (
        <a href={src} target="_blank" rel="noreferrer">
          <img src={src} alt={alt} loading="lazy" width={width} height={height} />
        </a>
      ) : (
        <img src={src} alt={alt} loading="lazy" width={width} height={height} />
      )}
      {(caption || credit) && (
        <figcaption>
          {caption}
          {credit && <span className="credit"> {credit}</span>}
        </figcaption>
      )}
    </figure>
  );
}

/** Newsroom shorthand for "to come": a visible placeholder for copy Ryan will write. */
export function TK({ children }: { children: React.ReactNode }) {
  return (
    <span className="tk">
      <b>TK</b> {children}
    </span>
  );
}

export function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

/** "Strings from this page": the graph neighbors, as a closing rail. */
export function StringsFooter({ id }: { id: NodeId }) {
  const ns = neighbors(id);
  return (
    <aside className="strings-footer" aria-label="Connected pages">
      <h2>
        Strings from <span>~/{nodeById[id].fsPath}</span>
      </h2>
      <ul>
        {ns.map(({ id: n, strength }) => (
          <li key={n}>
            <NavLink href={hrefFor(n)} className={`string-card string-card--s${strength}`}>
              <span className="string-card__kicker">{strength === 2 ? "Close tie" : strength === 0 ? "Subnet" : "Related"}</span>
              <span className="string-card__title">{nodeById[n].title}</span>
              <span className="string-card__dek">{nodeById[n].dek}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat">
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  );
}
