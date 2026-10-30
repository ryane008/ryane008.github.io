export const CLASSIC_URL =
  "https://thhsclassic.com/15023/news/the-doe-calls-the-air-purifiers-that-will-be-in-nyc-classrooms-hepa-purifiers-the-classic-asked-the-cdc-if-thats-accurate-heres-how-the-cdc-responded/";

/**
 * A newspaper clipping, typeset natively rather than screenshotted: it stays
 * sharp at any zoom, works in dark mode, and the text is selectable.
 */
export function Clipping({ compact = false }: { compact?: boolean }) {
  return (
    <article className={`clipping${compact ? " clipping--compact" : ""}`}>
      <div className="clipping__nameplate">
        <span>The Classic</span>
        <span className="clipping__date">Aug. 31, 2021 · News</span>
      </div>
      <h3 className="clipping__headline">
        The DOE calls the air purifiers that will be in NYC classrooms &ldquo;HEPA purifiers.&rdquo; The Classic asked
        the CDC if that&rsquo;s accurate.
      </h3>
      <p className="clipping__byline">By Jasmine Palma and Ryan Eng</p>
      {!compact && (
        <>
          <p className="clipping__body">
            The city described its classroom Intellipure units as HEPA purifiers. They don&rsquo;t use true HEPA
            filters. We asked engineers, including one affiliated with the CDC, whether the label held up, and looked
            at what it meant for maintenance and clean-air delivery.
          </p>
          <a className="clipping__link" href={CLASSIC_URL} target="_blank" rel="noreferrer">
            Read it at thhsclassic.com ↗
          </a>
        </>
      )}
    </article>
  );
}
