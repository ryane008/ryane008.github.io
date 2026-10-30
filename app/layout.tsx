import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { SiteProvider } from "@/components/SiteProvider";
import { NavBar } from "@/components/NavBar";
import { Shell } from "@/components/Shell";
import { ZoomTransition } from "@/components/ZoomTransition";

const serif = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://ryane008.github.io"),
  title: { default: "Ryan Eng", template: "%s · Ryan Eng" },
  description:
    "Ryan Eng: CS and applied math at Brown. Quant research, machine learning, systems, and data journalism, organized as a bulletin board.",
  openGraph: { type: "website", siteName: "Ryan Eng", images: ["/media/photos/ryan-bryce-canyon.jpg"] },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#141413" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`}>
      <body>
        <SiteProvider>
          <a className="skip" href="#main">
            Skip to content
          </a>
          <NavBar />
          <main id="main">{children}</main>
          <footer className="colophon">
            <span>© {new Date().getFullYear()} Ryan Eng</span>
            <span>
              Set in Newsreader &amp; IBM Plex Mono · Press <kbd>`</kbd> for a shell
            </span>
            <span>
              <a href="mailto:ryan_eng@brown.edu">ryan_eng@brown.edu</a> ·{" "}
              <a href="https://www.linkedin.com/in/ryan-eng-407437245" target="_blank" rel="noreferrer">
                LinkedIn
              </a>{" "}
              ·{" "}
              <a href="https://github.com/ryane008" target="_blank" rel="noreferrer">
                GitHub
              </a>
            </span>
          </footer>
          <ZoomTransition />
          <Shell />
        </SiteProvider>
      </body>
    </html>
  );
}
