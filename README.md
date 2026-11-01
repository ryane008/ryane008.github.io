# ryane008.github.io

Ryan Eng's personal site: a bulletin board of pages tied together with strings. You can get around it in three ways:

- **Navbar and strings.** The masthead links to the main sections. The strip below it lists the current page's graph neighbors, and `[` / `]` step through them.
- **The board** (`/board/`). Everything is pinned on one canvas you can pan and zoom. With **UI Mode** toggled on in the masthead, every page change pulls back to the board, draws the route along the strings, and dives into the next card.
- **The shell.** Press `` ` ``. The site is a read-only filesystem at `/portfolios/users/ryaneng`. `cd` navigates, `cd ~` goes to the board, and `home` goes to the front page. `help` lists everything, including `neighbors`, `ping`, and `traceroute`.

## Stack

Next.js 16 (App Router) with `output: "export"`. The static site in `out/` is deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`. React 19, Motion for the camera and shell animations, and hand-written CSS (tokens at the top of `app/globals.css`, with light and dark themes). Fonts are Newsreader and IBM Plex Mono.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to out/
npm run typecheck
```

One-time GitHub setup: **Settings → Pages → Source: GitHub Actions**.

## Where things live

| Change | File |
|---|---|
| Pages, board positions, strings (graph edges), pinned photos | `lib/site.ts` |
| Shell filesystem (extra files, `cat` text) | `lib/vfs.ts` |
| Shell commands and aliases | `lib/shell.ts` |
| Page copy | `app/**/page.tsx` |
| Live demos | `components/demos/` |
| Images and resume PDF | `public/media/` |

The directory tree and the graph are deliberately separate. A page's `fsPath` decides where it sits in the shell and its URL. `EDGES` decides which strings connect it. Projects are spokes: their only string goes to `projects/`.

Copy still to be written is marked with `<TK>` (newsroom shorthand for "to come") and renders highlighted. Search the repo for `<TK>` to find it.
