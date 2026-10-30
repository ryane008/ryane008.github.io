import type { Metadata } from "next";
import { Figure, PageHeader, Section, StringsFooter, TK } from "@/components/Article";

export const metadata: Metadata = { title: "Honors thesis" };

export default function Thesis() {
  return (
    <>
      <PageHeader
        id="thesis"
        title="Where should Rhode Island put its rain gauges?"
        dek="An honors thesis on flood response: model regional rainfall from weather radar, then choose sensor sites that tell you the most about the storms you can't see."
        meta="Advised by Professor Emanuele Di Lorenzo · in progress"
      />

      <div className="prose">
        <p className="lede">
          A rain gauge measures one point. A flood depends on what fell across a whole watershed. The question is
          which handful of points, chosen well, best reconstruct the rest. The thesis answers it in three steps:
          learn rainfall&rsquo;s spatial structure from years of NEXRAD radar over Rhode Island, turn that into a
          probabilistic model, and choose sensor sites by maximizing the information they carry about regional flood
          risk.
        </p>
      </div>

      <Figure
        wide
        src="/media/projects/thesis-eofs.png"
        alt="Mean rainfall map and the first six empirical orthogonal functions over Rhode Island"
        caption="The structure of rain. Mean hourly rainfall on wet hours, and the first six EOFs: the dominant spatial patterns, which together explain about 63% of the variance. EOF 1 (33%) is the whole state raining together; the rest are gradients and dipoles a sparse network must still capture."
        credit="NEXRAD KBOX radar"
      />

      <Section title="Storms move, and the network has to keep up">
        <p>
          Placement depends on how storms cross the state. Tracking each storm&rsquo;s rainfall peak shows peaks
          moving east-southeast more slowly than the rain cells inside them, which radar cross-correlation (TREC) puts
          at about 28 km/h heading northeast.
        </p>
      </Section>
      <Figure
        wide
        src="/media/projects/thesis-storm-motion.png"
        alt="Polar histogram of storm-peak direction compared with a shuffled null and cell motion; histogram of peak speeds"
        caption="Left: direction the storm peak moves (blue; mean arrow) against a shuffled null (gray) and rain-cell motion (red). Right: peak speed across 102 well-fit storms (R² > 0.5), against the 28 km/h cell motion."
      />

      <Section title="Choosing the sites">
        <p>
          With a covariance model in hand, each placement strategy is a different answer to &ldquo;most
          informative&rdquo;: greedy A-optimal design, greedy selection on an information objective J with correlated
          or diagonal noise, pivoted QR on the EOF basis, and an even k-means spread as the naive baseline.
        </p>
      </Section>
      <Figure
        wide
        src="/media/projects/thesis-sensor-placement.png"
        alt="Ten Rhode Island maps comparing sensor placements from five strategies at K=5 and K=10"
        caption="Five strategies, five and ten sensors each, numbered in the order they were chosen. The greedy-J and pivoted-QR designs push sensors to the borders and onto Block Island, where a gauge sees weather the others can't; k-means just tiles the map."
      />

      <Section title="Findings">
        <p>
          <TK>The headline result: which strategy wins, by how much, and what it means for the state&rsquo;s current gauge network.</TK>
        </p>
      </Section>

      <StringsFooter id="thesis" />
    </>
  );
}
