import type { Metadata } from "next";
import { PageHeader, Section, StringsFooter } from "@/components/Article";
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
    title: "Deep learning (reinforcement learning, world models, SSL)",
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
        telemetry at AWS. Exploring how the world stays connected, via the cloud and beyond.
      </>
    ),
  },
  {
    title: "Machine learning & data science",
    body: "Coming to understand why the models in use today work (or don’t), and how we can do better.",
  },
  {
    title: "Data journalism",
    body: "Using statistical methods to check claims and to tell stories people can verify.",
  },
  {
    title: "Sports analytics",
    body: "Draft models for an NFL-affiliated agency; director of analytics at Brown Sports Network.",
  },
  {
    title: "Physics & quantum computing",
    body: "A stint learning about the limitless applications of quantum computing in information science and probability (Microsoft Quantum Computing).",
  },
];

type Photo = { src: string; caption: string };
const HOBBIES: { title: string; body: React.ReactNode; photos: Photo[] }[] = [
  {
    title: "Running, soccer (football) & swimming (or pretty much any sport)",
    body: (
      <>
        I grew up loving sports and playing them, from the pickup games that defined my after-school, &ldquo;good
        ol&rsquo; days&rdquo; childhood adventures, stretching on for as long as the sun allowed. I also really enjoy
        the tactics: the qualitative and quantitative statistics and intangibles that drive strategy and performance,
        and that we subconsciously process as &ldquo;having a good or bad game.&rdquo;
      </>
    ),
    photos: [{ src: "/media/photos/ryan-race-finish.jpg", caption: "Crossing the clock" }],
  },
  {
    title: "Outdoors",
    body: (
      <>
        It&rsquo;s a personal goal of mine to visit national parks across the country with those closest to me,
        forging shared memories and experiences. So far I&rsquo;ve been to parks ranging from the lush forests and
        Mars-esque mountaintops of Hawaii to the mythical monoliths of Zion and the Grand Canyon, whose formations
        tower breathtakingly above you like the skyscrapers of my hometown, New York.
      </>
    ),
    photos: [
      { src: "/media/photos/ryan-bryce-canyon.jpg", caption: "Bryce Canyon in snow" },
      { src: "/media/photos/bryce-hoodoo-sky.jpg", caption: "Hoodoo, blue hour" },
      { src: "/media/photos/red-rock-ridge.jpg", caption: "Red rock under storm clouds" },
    ],
  },
  {
    title: "Photography",
    body: "Mostly nature, some city. Almost everything pinned on the board is my own, with the exception of a few photos from family and friends that I’ve really enjoyed.",
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
    body: (
      <>
        I love experimenting in the kitchen, learning and developing an intuition for how individual flavors combine
        into something greater than the sum of its parts, and then reaping the benefits by cooking for others.
        I&rsquo;m not entirely sure it&rsquo;s true, but I will always say a lot of this was implanted in my brain by
        reruns of <i>Ratatouille</i> as a kid.
      </>
    ),
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
        it. I help catalogue, process, and transport donated food for intake by food pantries and soup kitchens,
        continuing the volunteer work I did throughout high school at a local soup kitchen, the Village Temple Soup
        Kitchen.
      </>
    ),
    photos: [
      { src: "/media/photos/food-recovery-boxes.jpg", caption: "Recovered produce, Brown Food Recovery Network" },
      { src: "/media/photos/pantry-produce-boxes.jpg", caption: "Sorting a recovery run" },
    ],
  },
  {
    title: "Soccer & music",
    body: (
      <>
        <p style={{ margin: 0 }}>
          I am a Chelsea fan through and through (specifically, through &ldquo;the sun and rain&rdquo;).
        </p>
        <p style={{ margin: "12px 0 0" }}>
          I try to keep an open mind about music, because I believe every genre has something unique that
          &ldquo;works&rdquo; and appeals to at least some audience. That said, thanks to my family I love classic,
          yacht, and pop rock from the &rsquo;60s and &rsquo;70s (throw in some &rsquo;50s, &rsquo;80s, and disco,
          plus post-2000s indie inspired by all of the above). I find the parallels and distinct features in how these
          genres compose and arrange sound really interesting: why does this particular combination of signals,
          amplitudes, and frequencies lead to some downstream processing in our brains along the lines of
          &ldquo;wow&hellip; that sounds pleasing&rdquo;?
        </p>
      </>
    ),
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
            <div className="prose">{h.body}</div>
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
