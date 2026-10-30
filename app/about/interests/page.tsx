import type { Metadata } from "next";
import { PageHeader, Section, StringsFooter, TK } from "@/components/Article";
import { NavLink } from "@/components/NavLink";

export const metadata: Metadata = { title: "Interests" };

const TECHNICAL: { title: string; body: React.ReactNode }[] = [
  {
    title: "Quantitative finance",
    body: (
      <>
        Factor models, risk, and market microstructure. I co-taught the material and then built a{" "}
        <NavLink href="/projects/barra/">Barra-style risk model</NavLink> for QTAB.
      </>
    ),
  },
  {
    title: "Reinforcement learning",
    body: (
      <>
        Sample efficiency: how little experience an agent needs. See the{" "}
        <NavLink href="/projects/atari/">multimodal Atari project</NavLink>.
      </>
    ),
  },
  {
    title: "Networks & systems",
    body: (
      <>
        Protocols from the wire up (<NavLink href="/projects/tcp-ip/">TCP/IP in Rust</NavLink>) and lock-free
        telemetry at AWS.
      </>
    ),
  },
  {
    title: "Data journalism",
    body: "Using statistics to check claims and to tell stories people can verify.",
  },
  {
    title: "Sports analytics",
    body: "Draft models for an NFL-affiliated agency; director of analytics at Brown Sports Network.",
  },
  {
    title: "Physics & quantum computing",
    body: <TK>A line on the Microsoft Quantum work.</TK>,
  },
];

type Photo = { src: string; caption: string };
const HOBBIES: { title: string; body: React.ReactNode; photos: Photo[] }[] = [
  {
    title: "Running, track & swimming",
    body: <TK>Events, distances, favorite race.</TK>,
    photos: [{ src: "/media/photos/ryan-race-finish.jpg", caption: "Crossing the clock" }],
  },
  {
    title: "Outdoors",
    body: <TK>Parks you&rsquo;ve been to and the one you&rsquo;d go back to.</TK>,
    photos: [
      { src: "/media/photos/ryan-bryce-canyon.jpg", caption: "Bryce Canyon in snow" },
      { src: "/media/photos/bryce-hoodoo-sky.jpg", caption: "Hoodoo, blue hour" },
      { src: "/media/photos/red-rock-ridge.jpg", caption: "Red rock under storm clouds" },
    ],
  },
  {
    title: "Photography",
    body: "Mostly nature, some city. Everything pinned on the board is my own.",
    photos: [
      { src: "/media/photos/osprey-perched.jpg", caption: "Osprey" },
      { src: "/media/photos/butterfly-pond.jpg", caption: "Swallowtail by the lily pond" },
      { src: "/media/photos/deer-in-forest.jpg", caption: "White-tailed deer" },
      { src: "/media/photos/night-sky-stars.jpg", caption: "Stars over the pines" },
      { src: "/media/photos/empire-state-night.jpg", caption: "Empire State, night" },
      { src: "/media/photos/reservoir-sunset-skyline.jpg", caption: "Reservoir at sunset" },
      { src: "/media/photos/beach-sunset-shoreline.jpg", caption: "Shoreline at sundown" },
      { src: "/media/photos/ice-cream-stand-dusk.jpg", caption: "Ice cream stand, dusk" },
      { src: "/media/photos/church-tower-sunset.jpg", caption: "Church tower, sunset" },
    ],
  },
  {
    title: "Cooking",
    body: <TK>What you cook most and who you cook for.</TK>,
    photos: [
      { src: "/media/photos/stir-fry-pan.jpg", caption: "Glazed chicken stir-fry" },
      { src: "/media/photos/rigatoni-skillet.jpg", caption: "Rigatoni and sausage" },
      { src: "/media/photos/noodles-short-rib.jpg", caption: "Noodles and braised short rib" },
      { src: "/media/photos/mushroom-pasta.jpg", caption: "Mushroom pasta" },
    ],
  },
  {
    title: "Volunteering",
    body: (
      <>
        With the Brown Food Recovery Network, which collects surplus food on campus and gets it to people who can use
        it. <TK>Your role, and how long you&rsquo;ve been involved.</TK>
      </>
    ),
    photos: [
      { src: "/media/photos/food-recovery-boxes.jpg", caption: "Recovered produce, Brown Food Recovery Network" },
      { src: "/media/photos/pantry-produce-boxes.jpg", caption: "Sorting a recovery run" },
    ],
  },
  {
    title: "Soccer & music",
    body: <TK>Your Premier League club (and the reason), plus what you play or listen to.</TK>,
    photos: [],
  },
];

export default function Interests() {
  return (
    <>
      <PageHeader id="interests" meta="By Ryan Eng · Profile / Interests" />

      <Section id="technical" title="Technical">
        <dl className="prose">
          {TECHNICAL.map((t) => (
            <div key={t.title}>
              <dt>
                <b>{t.title}</b>
              </dt>
              <dd style={{ margin: "0 0 14px" }}>{t.body}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <section id="hobbies" className="section section--wide">
        <h2>Away from the keyboard</h2>
        {HOBBIES.map((h) => (
          <div key={h.title} style={{ marginBottom: 36 }}>
            <h3 style={{ fontSize: 23, margin: "28px 0 4px" }}>{h.title}</h3>
            <p className="prose" style={{ margin: 0 }}>
              {h.body}
            </p>
            {h.photos.length > 0 && (
              <div className="contact-sheet">
                {h.photos.map((p) => (
                  <figure key={p.src}>
                    <img src={p.src} alt={p.caption} loading="lazy" />
                    <figcaption>{p.caption}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      <StringsFooter id="interests" />
    </>
  );
}
