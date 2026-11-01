import type { Metadata } from "next";
import { Figure, PageHeader, Section, StringsFooter } from "@/components/Article";
import { RiskDemo } from "@/components/demos/RiskDemo";

export const metadata: Metadata = { title: "Barra risk model" };

export default function Barra() {
  return (
    <>
      <PageHeader
        id="barra"
        dek="How risky is a portfolio, and why? A USE4-style factor model answers both. I built one for Quantitative Trading at Brown, from the raw WRDS pull to the dashboard below."
        meta="Python · TimescaleDB · Docker · JKP global factor database (WRDS)"
      />

      <Figure
        wide
        crop
        src="/media/projects/barra-dashboard.png"
        alt="The QTAB risk model dashboard looking up AAPL: predicted vs realized volatility, style exposures, variance decomposition, and most and least correlated names"
        caption="The dashboard's asset view for AAPL as of Dec. 2025: 27.5% predicted vol, 63% of it stock-specific. The bands show where the stock sits against the universe on each style factor, and the history panel scores every past forecast against the volatility that followed."
        credit="Russell 1000 universe, K = 18 factors"
      />

      <div className="prose">
        <p className="lede">
          A risk model replaces an impossible estimate with a tractable one. With 1,000 stocks, the full covariance
          matrix has half a million entries and only a few hundred months of history to estimate them from. A factor
          model assumes stocks co-move only through a handful of shared exposures (market, industry, size, value,
          momentum, and so on) plus noise that belongs to each stock alone.
        </p>
      </div>
      <div className="pull">Σ = X F Xᵀ + Δ, where X is the exposures, F the factor covariance, and Δ the specific risk.</div>

      <Section title="The first defect: three months of data">
        <p>
          The first full-universe pull came back with three months of data, and returns in only one of them. The loader
          had computed its window as <code>now() − 30 × months</code>, while the source table ends in February 2025.
          With one usable cross-section, F is rank one and the model can&rsquo;t be built.
        </p>
        <p>
          The fix ran against intuition: shrink the universe. F is K×K over about 17 factors and needs T ≫ K months,
          not more stocks. I drew a <b>stratified sample of 20 names in each of 11 GICS sectors</b> as of December
          2005 and followed them forward. It is stratified because a uniform draw leaves some sector with one name a
          few percent of the time, and an industry dummy with a single member drives that stock&rsquo;s specific
          variance to zero. That reports zero risk, and an optimizer will find it.
        </p>
        <p>
          Other fixes followed the same pattern: sample on JKP&rsquo;s security <code>id</code> rather than tickers,
          which get reused (<code>BCS</code> mapped to both a restaurant chain and Barclays), and join CRSP–Compustat
          links by date instead of treating link type as a filter.
        </p>
      </Section>

      <Section title="The pipeline">
        <ol>
          <li>
            <b>Exposures.</b> Robust winsorization and cap-weighted standardization of descriptors into style
            factors, plus industry dummies.
          </li>
          <li>
            <b>Factor returns.</b> Each month, a constrained weighted least-squares regression of returns on lagged
            exposures gives f(t) and specific returns u(i, t).
          </li>
          <li>
            <b>Factor covariance F.</b> Exponentially weighted, Newey-West corrected, then an eigenfactor adjustment
            and volatility-regime adjustment (VRA). Each stage is scored out of sample.
          </li>
          <li>
            <b>Specific risk Δ.</b> Rolling estimates with USE4&rsquo;s Bayesian shrinkage toward size-decile means.
          </li>
          <li>
            <b>Validation.</b> Bias statistics at the factor, asset, and portfolio level: is predicted risk the
            risk that actually showed up?
          </li>
          <li>
            <b>Use.</b> Portfolio risk attribution, tracking error, mean-variance and minimum-variance optimization
            (a Woodbury closed form in factor space), and the dashboard.
          </li>
        </ol>
        <p>
          The pure logic carries 137 offline checks that run without WRDS or a database. The prototype then scaled to
          a Russell 1000 universe, which is what the dashboard shows.
        </p>
      </Section>

      <section className="section section--wide">
        <h2>Push it around</h2>
        <p className="prose">
          The real model runs on licensed CRSP and Compustat data that can&rsquo;t be published. This toy version
          does the same math on a made-up nine-stock universe, entirely in your browser.
        </p>
        <RiskDemo />
      </section>

      <Section title="What I&rsquo;d do next">
        <ul>
          <li>
            <b>Specific risk.</b> Explore whether the specific risk I observe across the universe comes down to
            idiosyncratic PnL, or can be captured by other features.
          </li>
          <li>
            <b>Better return estimates.</b> The mean-variance optimizer currently takes its default expected returns
            from a Fama–French five-factor model. Next: Black–Litterman, covariance shrinkage, and other estimators.
          </li>
          <li>
            <b>Constraints.</b> Test the optimization landscape and the algorithms I developed under constraints: for
            example, how a long-only constraint affects the transfer coefficient (TC) in the information ratio.
          </li>
        </ul>
      </Section>

      <StringsFooter id="barra" />
    </>
  );
}
