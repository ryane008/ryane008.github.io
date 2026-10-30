import type { Metadata } from "next";
import { PageHeader, Section, Stat, StringsFooter, TK } from "@/components/Article";
import { AtariDiagram } from "@/components/AtariDiagram";

export const metadata: Metadata = { title: "Multimodal Atari RL" };

const DEVPOST = "https://devpost.com/software/sample-efficient-play-of-atari-games-with-multi-modal-input";

export default function Atari() {
  return (
    <>
      <PageHeader
        id="atari"
        title="Sample-efficient Atari, with sound"
        dek="Human players hear the game. Sample-efficient agents don't. We re-implemented Bigger, Better, Faster in TensorFlow and gave it ears."
        meta={
          <>
            Final project, Brown CSCI 1470 Deep Learning ·{" "}
            <a href={DEVPOST} target="_blank" rel="noreferrer">
              Devpost write-up ↗
            </a>
          </>
        }
      />

      <div className="stats">
        <Stat value="½" label="of the human benchmark score" />
        <Stat value="~25 min" label="of gameplay to get there" />
        <Stat value="⅛" label="of the benchmark's training time" />
        <Stat value="100k" label="environment steps (Atari 100k)" />
      </div>

      <div className="prose">
        <p className="lede">
          In 2023, BBF learned many Atari 2600 games at superhuman level from about two hours of play. It sees only
          pixels. Some games, like <i>Amidar</i>, tell the player things through sound. We wanted to know whether a
          data-efficient agent could use that channel too.
        </p>
      </div>

      <section className="section section--wide">
        <h2>The architecture</h2>
        <AtariDiagram />
      </section>

      <Section title="How it works">
        <p>
          Pixels take BBF&rsquo;s path: four stacked frames through a widened 15-layer Impala ResNet. Raw audio
          samples from the Arcade Learning Environment go through a small 1-D convolutional encoder, which is reshaped
          to match the visual latent&rsquo;s spatial grid and concatenated with it. From there the agent is BBF: a
          dueling, distributional Q-head, and a self-predictive (SPR) transition model that learns by predicting its
          own latent five steps ahead. That auxiliary task is what makes the agent sample-efficient.
        </p>
        <p>
          We trained on Brown&rsquo;s Oscar cluster. The hardest part was not the audio but faithfully re-implementing
          BBF: parts the paper leaves unstated had to be read out of the JAX codebase and rebuilt in TensorFlow, along
          with BBF&rsquo;s tricks: periodic network resets, annealed discount and update horizon, and DrQ augmentation.
        </p>
      </Section>

      <section id="demo" className="section">
        <h2>Gameplay</h2>
        <div className="video-slot">
          <div>
            <b>Recording to come</b>
            <br />
            An evaluation episode with the audio channel on, with the waveform the agent hears shown beside the frame.
          </div>
        </div>
        <p className="demo__note" style={{ marginTop: 12 }}>
          A live in-browser version isn&rsquo;t possible: the game ROMs are copyrighted and can&rsquo;t be
          redistributed, so this one will be a recording.
        </p>
      </section>

      <Section title="Results and what we learned">
        <p>
          <TK>Learning curves, the per-game breakdown, and whether audio helped on Amidar (vs. the pixels-only baseline). Paste from the Devpost write-up.</TK>
        </p>
      </Section>

      <StringsFooter id="atari" />
    </>
  );
}
