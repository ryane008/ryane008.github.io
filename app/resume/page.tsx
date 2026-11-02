import type { Metadata } from "next";
import { PageHeader, StringsFooter } from "@/components/Article";
import { NavLink } from "@/components/NavLink";

export const metadata: Metadata = { title: "Resume" };

const PDF = "/media/docs/ryan-eng-resume.pdf";

export default function Resume() {
  return (
    <>
      <PageHeader
        id="resume"
        dek="The one-page version. For the longer account, follow the string to Experience."
        meta={
          <>
            Updated fall 2026 · also at <code>~/resume/resume.pdf</code> in the shell
          </>
        }
      />
      <p style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a className="button button--primary" href={PDF} download>
          Download PDF
        </a>
        <a className="button" href={PDF} target="_blank" rel="noreferrer">
          Open in a new tab ↗
        </a>
        <NavLink className="button" href="/experience/">
          Experience, in detail
        </NavLink>
      </p>
      <object className="resume-frame" data={`${PDF}#view=FitH`} type="application/pdf" aria-label="Resume PDF">
        <p>
          Your browser can&rsquo;t display the PDF inline. <a href={PDF}>Download it instead.</a>
        </p>
      </object>
      <StringsFooter id="resume" />
    </>
  );
}
