import type { Metadata } from "next";
import { Figure, PageHeader, Section, StringsFooter, TK } from "@/components/Article";
import { Clipping } from "@/components/Clipping";
import { NavLink } from "@/components/NavLink";

export const metadata: Metadata = { title: "About me" };

export default function About() {
  return (
    <>
      <PageHeader id="about" meta="By Ryan Eng · Profile" />

      <div className="prose">
        <p className="lede">
          <TK>
            Two or three sentences in your own voice: who you are, what you&rsquo;re working on right now, and the
            thread that ties the newsroom to the math.
          </TK>
        </p>
      </div>

      <Figure
        src="/media/photos/ryan-hiking-boulders.jpg"
        alt="Ryan standing on boulders below a pale cliff"
        caption={<TK>Caption: where and when.</TK>}
      />

      <Section id="from" title="Where I&rsquo;m from">
        <p>
          <TK>Hometown, family, what growing up there taught you. The Empire State photo can sit here if it fits.</TK>
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
          The same habit runs through everything on this board. In the{" "}
          <NavLink href="/projects/barra/">risk model</NavLink>, that meant checking what a ticker actually refers to
          before trusting a join. In the <NavLink href="/projects/thesis/">thesis</NavLink>, it means asking what the
          radar can and can&rsquo;t see. At Brown I&rsquo;ve kept a foot in media through <i>The Brown Daily Herald</i>{" "}
          (business) and as director of analytics at Brown Sports Network.
        </p>
        <p>
          <TK>A line on what draws you to data journalism specifically, and any other clips worth pinning.</TK>
        </p>
      </Section>

      <Section id="brown" title="Brown University">
        <Figure src="/media/photos/ryan-brown-gate.jpg" alt="Ryan in front of a red brick gate at Brown University" caption="At Brown." />
        <p>
          I&rsquo;m finishing an Sc.B. in Computer Science–Applied Math and an Sc.M. in Computer Science on the AI/ML
          track, both expected in 2027. Coursework has run from graduate deep learning and prescriptive analytics
          through information theory, computer networks, systems for ML, operations research, and computational
          linguistics.
        </p>
        <p>
          Outside class: president of Quantitative Trading at Brown (QTAB), co-developer and instructor of an
          independent-study course in quantitative finance, PM at Full Stack @ Brown, a TA and board member at the Data
          Science Institute, and a top-3% finish out of 9,000 teams at IMC Prosperity.
        </p>
        <p>
          <TK>What Brown has meant beyond the transcript: a professor, a class, a moment.</TK>
        </p>
      </Section>

      <Section id="next" title="What&rsquo;s next">
        <p>
          <TK>The careers you want to pursue, and why. Quant research? Data journalism? Both?</TK>
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
