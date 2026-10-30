import type { Metadata } from "next";
import { PageHeader, StringsFooter } from "@/components/Article";
import { NavLink } from "@/components/NavLink";

export const metadata: Metadata = { title: "Professional experience" };

type Role = { org: string; role: string; when: string; points?: React.ReactNode[] };

const QUANT: Role[] = [
  {
    org: "Amazon Web Services",
    role: "Cloud Engineer Intern",
    when: "Jun – Aug 2026",
    points: [
      "Designed high-throughput metric and histogram recorders for time-series and latency-distribution data on system operations.",
      "Built diagnostic pipelines that separate client-side from server-side execution failures and forecast performance degradation.",
      "Formulated tail-degradation and rolling short- and long-horizon latency measures (quadratic mean) to surface bottlenecks under peak seasonal demand and to find underused Kubernetes and caching capacity.",
      "Architected end-to-end telemetry aggregation with relaxed, lock-free atomic counters and a batch-flushing protocol on the hot path, at ~15 ms mean (σ 3.3 ms) with negligible CPU and memory overhead.",
    ],
  },
  {
    org: "Trexquant Investment LP",
    role: "Quantitative Researcher",
    when: "Sep – Oct 2025",
    points: ["Feature-engineered and applied machine-learning methods to generate signals for earnings-call strategies."],
  },
  {
    org: "Stealth startup",
    role: "Co-Founder",
    when: "Apr – Sep 2025",
    points: [
      "Built a contextual-retrieval (RAG) LLM architecture with OpenAI and LangChain to serve company verticals.",
      "Created a data lake, sharding, and a graph network on AWS and Bedrock to catalogue data for retrieval and calibration.",
      "Finished in the top 10% of startups in the Y Combinator summer cohort.",
    ],
  },
  {
    org: "JL Sports (NFL)",
    role: "Quantitative Analyst",
    when: "Mar 2025 – present",
    points: [
      "Guide an NFL-affiliated agency's acquisition of 2026 draft-eligible prospects through quantitative scouting research.",
      "Built logistic-regression and random-forest models that mirror NFL scouting methodology, at 90% accuracy on past drafts.",
    ],
  },
  {
    org: "Brown University, Department of Computer Science",
    role: "Reinforcement Learning Research Assistant",
    when: "Jun – Sep 2024",
    points: [
      <>
        Continued the work behind the <NavLink href="/projects/atari/">multimodal Atari agent</NavLink>.
      </>,
    ],
  },
  {
    org: "Brown University School of Public Health",
    role: "Software Developer, Research Assistant",
    when: "May 2024 – Mar 2025",
  },
];

const LEADERSHIP: Role[] = [
  {
    org: "Introduction to Quantitative Finance I",
    role: "Instructor and course developer",
    when: "Apr – Dec 2024",
    points: [
      "Designed and co-taught a Fall 2024 independent-study course at Brown under Professor Spencer Yongwook Kwon.",
      "Curated units on regression (AR, Newey-West), market microstructure, statistical arbitrage, factor models (Fama-French), and PCA.",
    ],
  },
  {
    org: "Quantitative Trading at Brown (QTAB)",
    role: "President, researcher, software lead",
    when: "Sep 2023 – present",
    points: [
      <>
        Led the backtester and trading-game software, and built the club&rsquo;s{" "}
        <NavLink href="/projects/barra/">factor risk model</NavLink>.
      </>,
    ],
  },
];

function Timeline({ roles }: { roles: Role[] }) {
  return (
    <ol className="timeline">
      {roles.map((r) => (
        <li key={r.org + r.role}>
          <div className="timeline__when">{r.when}</div>
          <div>
            <h3>{r.org}</h3>
            <p className="timeline__role">{r.role}</p>
            {r.points && (
              <ul>
                {r.points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function Experience() {
  return (
    <>
      <PageHeader
        id="experience"
        meta={
          <>
            The full record. For the one-page version, see the <NavLink href="/resume/">resume</NavLink>.
          </>
        }
      />
      <h2 className="kicker" style={{ marginTop: 0 }}>
        Quantitative &amp; engineering
      </h2>
      <Timeline roles={QUANT} />
      <h2 className="kicker" style={{ marginTop: 48 }}>
        Teaching &amp; leadership
      </h2>
      <Timeline roles={LEADERSHIP} />
      <StringsFooter id="experience" />
    </>
  );
}
