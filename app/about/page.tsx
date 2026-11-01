import type { Metadata } from "next";
import { Figure, PageHeader, Section, StringsFooter } from "@/components/Article";
import { Clipping } from "@/components/Clipping";
import { NavLink } from "@/components/NavLink";

export const metadata: Metadata = { title: "About me" };

export default function About() {
  return (
    <>
      <PageHeader id="about" meta="By Ryan Eng · Profile" />

      <div className="prose">
        <p className="lede">
          Hi everyone, I&rsquo;m a senior at Brown University studying Applied Math and Computer Science, and finishing
          a concurrent master&rsquo;s in Computer Science. I have a keen interest in the &ldquo;why&rdquo; behind
          things, and in finding effective ways to capture and illustrate the abstract concepts embedded within them.
        </p>
        <p>
          I love the outdoors and sports (possibly too much). From the special moments in each of those spheres to the
          way they bring out the best in people, I think both have the unique gift of bringing people together and
          inspiring generation after generation to keep achieving and become something more.
        </p>
      </div>

      <Figure
        src="/media/photos/ryan-hiking-boulders.jpg"
        alt="Ryan standing on boulders below a pale cliff"
        caption="The Mohonk Labyrinth trail. (Have I mentioned that I enjoy the outdoors?)"
      />

      <Section id="from" title="Where I&rsquo;m from">
        <p>
          Born and raised in New York, but New England will always have a special place in my childhood, and more
          broadly my heart. Currently warming up to Providence, Rhode Island.
        </p>
      </Section>

      <Section id="newsroom" title="The newsroom">
        <p>
          Before the code, there was a newspaper. At <i>The Classic</i>, my high school paper, I learned to question
          an official claim instead of repeating it. In 2021, New York&rsquo;s Department of Education said the air
          purifiers headed to city classrooms were HEPA purifiers. Jasmine Palma and I asked the CDC whether that was
          accurate.
        </p>
        <Clipping />
        <p>
          The spirit of investigation behind this board is the heart of my learning journey, and it&rsquo;s where
          I&rsquo;m at my best. In the{" "}
          <NavLink href="/projects/barra/">risk model</NavLink>, that meant checking what a ticker actually refers to
          before trusting a join. In the <NavLink href="/projects/thesis/">thesis</NavLink>, it means asking what the
          radar can and can&rsquo;t see. At Brown I&rsquo;ve kept a foot in media through <i>The Brown Daily Herald</i>{" "}
          (business) and as director of analytics at Brown Sports Network.
        </p>
        <p>
          I suspect my interest in journalism, and data journalism specifically, comes from my mom: she would always
          tune in for the 6:30 global nightly news report. More recently, with the misinformation, bias, cherry-picking, and
          polarization in today&rsquo;s world and media, I&rsquo;ve felt compelled to &ldquo;dig for the
          truth,&rdquo; for myself and for others, so that each of us can take all that came before and keep
          innovating.
        </p>
      </Section>

      <Section id="brown" title="Brown University">
        <Figure src="/media/photos/ryan-brown-gate.jpg" alt="Ryan in front of a red brick gate at Brown University" caption="At Brown." />
        <p>
          I&rsquo;m finishing an Sc.B. in Computer Science–Applied Math and a concurrent Sc.M. in Computer Science on
          the AI/ML track, both expected in 2027. Coursework has run from graduate deep learning and prescriptive
          analytics (constrained optimization and operations research) through information theory, computer networks,
          systems for ML, databases, and computational linguistics.
        </p>
        <p>
          Outside class: 2025–26 president of Quantitative Trading at Brown (QTAB), co-developer and instructor of an
          independent-study course in quantitative finance, PM at Full Stack @ Brown, a TA and board member at the Data
          Science Institute, and a top-3% finish out of 9,000 teams at IMC Prosperity.
        </p>
        <p>
          I&rsquo;m proud of my Applied Math and Computer Science experience at Brown, and of rediscovering what these
          two schools of thought share: the pursuit of precisely capturing and replicating the human lens and knowledge
          graph of the world, a way of answering &ldquo;what&rsquo;s going on&rdquo; behind things, so to speak. That
          has taught me a message echoed throughout a Brown education: the spirit of interdisciplinary approaches to
          understanding, solving, and prescribing for the problems and questions of the world.
        </p>
        <p>
          I&rsquo;m equally proud of the &ldquo;softer&rdquo; skills and lessons I&rsquo;ve picked up along the way,
          through coursework (I emphasize the <i>applied</i> part of my math and computer science), personal projects,
          and independent studies.
        </p>
      </Section>

      <Section id="next" title="What&rsquo;s next">
        <p>
          I want my career to reflect my experience at Brown so far and what has given me the most fulfillment. Right
          now I attribute that to interdisciplinary pursuits that bring out my most innovative side: rigorous
          investigations, dynamic problems that demand unique, clever, and robust solutions, and steep learning
          curves. Whether that&rsquo;s research, software engineering, academia, industry data science, or a little
          of all of them, that&rsquo;s where, at this early juncture, I can see myself thriving.
        </p>
      </Section>

      <Section id="interests" title="Interests">
        <p>
          The longer list lives on its own card, <NavLink href="/about/interests/">Interests</NavLink>: technical
          obsessions on one side, running shoes, trail maps, and a skillet on the other.
        </p>
      </Section>

      <StringsFooter id="about" />
    </>
  );
}
