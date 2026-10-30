import type { Metadata } from "next";
import { PageHeader, StringsFooter } from "@/components/Article";
import { NavLink } from "@/components/NavLink";
import { AtariDiagram } from "@/components/AtariDiagram";
import { NodeId, hrefFor, nodeById } from "@/lib/site";

export const metadata: Metadata = { title: "Project work" };

type Dossier = { id: NodeId; summary: string; tags: string[]; image?: string; demo: string };

const DOSSIERS: Dossier[] = [
  {
    id: "barra",
    image: "/media/projects/barra-dashboard.png",
    summary:
      "A USE4-style equity risk model for Quantitative Trading at Brown, built from the JKP global factor database on WRDS: stratified sampling, cap-weighted standardization, constrained WLS factor returns, a factor covariance with Newey-West and eigenfactor adjustments, Bayesian-shrunk specific risk, and out-of-sample bias tests. It ends in a dashboard that explains any stock's risk.",
    tags: ["Python", "TimescaleDB", "Docker", "WRDS", "statsmodels"],
    demo: "Live: risk decomposition you can push around",
  },
  {
    id: "tcp-ip",
    image: "/media/projects/tcp-milestone.png",
    summary:
      "A virtual IP network in Rust: hosts and routers exchanging packets over UDP 'links', RIP for routing, and a TCP built on top with sliding windows, out-of-order reassembly, RTO retransmission with Karn's algorithm, zero-window probing, and the full state machine.",
    tags: ["Rust", "threads + channels", "RIP", "TCP", "Wireshark"],
    demo: "Live: simulated transfer over a lossy link",
  },
  {
    id: "atari",
    summary:
      "A TensorFlow re-implementation of Bigger, Better, Faster (BBF), the sample-efficient Atari agent, extended with an audio encoder so the agent can hear the game as well as see it. It reached half the human benchmark from about 25 minutes of play.",
    tags: ["TensorFlow", "Arcade Learning Environment", "SPR", "Oscar HPC"],
    demo: "Architecture diagram · gameplay recording to come",
  },
  {
    id: "thesis",
    image: "/media/projects/thesis-eofs.png",
    summary:
      "Honors thesis with Professor Emanuele Di Lorenzo: using NEXRAD radar rainfall and an information-theoretic objective to decide where Rhode Island should place rain sensors for flood response.",
    tags: ["NEXRAD", "EOF / PCA", "optimal design", "mutual information"],
    demo: "Figures from the analysis",
  },
];

export default function Projects() {
  return (
    <>
      <PageHeader
        id="projects"
        dek="Four investigations. Each one opens into a full write-up, with a live demo where the code can run in a browser."
        meta="Strings from here run only to the four projects and back to the main board, like hosts behind a router."
      />
      {DOSSIERS.map((d, i) => {
        const n = nodeById[d.id];
        return (
          <article key={d.id} className="dossier">
            <NavLink href={hrefFor(d.id)} className={`dossier__media${d.image ? "" : " dossier__media--diagram"}`} aria-hidden tabIndex={-1}>
              {d.image ? (
                <img src={d.image} alt="" loading={i === 0 ? "eager" : "lazy"} />
              ) : (
                <AtariDiagram compact />
              )}
            </NavLink>
            <div>
              <span className="dossier__num">
                {n.kicker} · ~/{n.fsPath}
              </span>
              <h2>
                <NavLink href={hrefFor(d.id)} style={{ textDecoration: "none" }}>
                  {n.title}
                </NavLink>
              </h2>
              <p>{d.summary}</p>
              <p className="mono" style={{ fontSize: 12.5, color: "var(--red-ink)" }}>
                ▸ {d.demo}
              </p>
              <ul className="tags">
                {d.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <NavLink href={hrefFor(d.id)} className="button">
                Read the analysis →
              </NavLink>
            </div>
          </article>
        );
      })}
      <StringsFooter id="projects" />
    </>
  );
}
