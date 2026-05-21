---
name: vibepage
description: Build and serve web pages on the vibe.ylxdzsw.com site. Magic words referring to this skill\: \"vibepage\", \"vibe page\", \"vibe site\", \"vibesite\".
---

## Vibepage

This skill describes how to build web pages and deploy them on `vibe.ylxdzsw.com`.

`vibe.ylxdzsw.com` is an Nginx-served static site backed by `/var/www/vibe`, fronted by Cloudflare. It is the canonical place to hand the user a finished web page (or any file the user wants to view in a browser, including PPTX, PDF, images, archives, datasets).

### Pick a route

1. **Simple static document** — content-first markdown, no JS state, no charts, no interactive UI. Use the bundled `markdown-to-html.ts` script directly.
2. **Dynamic document / webapp** — needs JavaScript, app state, charts, ECharts, forms, search/filter, view switching, animation, or any bundling beyond plain markdown. Set up a `bun` project.

Prefer the simple route whenever it is sufficient.

### Where files go on the server

Two locations matter:

- **`/var/www/vibe/tmp/`** — scratch/iteration area. **Not autoindexed.** Files here are visible only by exact URL. The directory is auto-cleaned: contents older than 30 days are removed daily by `systemd-tmpfiles-clean.timer`.
- **`/var/www/vibe/`** (the root) — the public, autoindexed area for finalized deliverables.

Always start in `tmp/`. Move to root only when the user says to finalize.

### Versioning convention

While iterating with the user, write to `/var/www/vibe/tmp/<name>-vN.<ext>`, bumping `N` after each meaningful change. The version suffix is the cache-bust mechanism: Cloudflare caches static assets aggressively and there is no purge-by-URL available, so a fresh filename is the simplest way to make sure the user sees the latest version.

When the user asks to finalize:

1. Copy the latest `tmp/<name>-vN.<ext>` to `/var/www/vibe/<name>.<ext>` (suffix stripped).
2. Leave the older `-vN` files in `tmp/`. The systemd timer reaps them in 30 days. Do not delete by hand.

### Finalization rules for files at the root

The root directory is for **single, self-contained files only**:

- Finalized HTML must inline all CSS, JS, fonts, and images. No external dependencies, no relative links to other files in the root.
- Finalized PPTX must embed all media (the standard tooling does this).
- Finalized PDFs are inherently self-contained.
- A multi-file HTML deck (deck-viewer + per-slide HTML) is **not** allowed at the root. Either bundle into a single HTML file, or finalize as PPTX or PDF instead.
- Cross-file references between deliverables are allowed only inside `/tmp/` (e.g. an in-progress index page linking to draft sub-reports under `/tmp/`). Once finalized, each root file stands alone.

### Simple static document route

- Use this route for markdown-first deliverables, especially when the user already has markdown or you can generate the markdown directly from research.
- This skill bundles `markdown-to-html.ts`. It reads markdown from `stdin` and writes a full HTML document to `stdout`.
- The script keeps output minimal: rendered markdown HTML, `<title>`, `meta viewport`, and inline CSS only. Do not add headers, footers, tables of contents, or scaffolding unless the user explicitly wants them in the markdown itself.
- Internally the script uses Bun's minifying standalone HTML bundler, so KaTeX fonts, syntax highlighting styles, and local image assets are inlined into the final single-file HTML.
- Relative asset paths resolve from the current working directory. If the markdown refers to `./figure.png`, run the script from the markdown's directory. Absolute filesystem paths also work.
- Do not use frontmatter. The script does not parse frontmatter.
- Example usage:

```bash
cat report.md | bun run <skill-base>/markdown-to-html.ts > report-v1.html
cat report.md | bun run <skill-base>/markdown-to-html.ts --title "Quarterly Report" > report-v1.html
cat report.md | bun run <skill-base>/markdown-to-html.ts --theme github --title "Quarterly Report" > report-v1.html
```

- Replace `<skill-base>` with this skill's resolved base directory from the loaded skill output.
- If `--title` is omitted, the script derives it from the first markdown `# H1`.
- If `--theme` is omitted, the script defaults to `opencode`. Supported themes: `opencode`, `github`. Both ship light and dark variants via `prefers-color-scheme`.
- Features supported: `marked`, `marked-katex-extension`, `marked-footnote`, Shiki syntax highlighting, server-side KaTeX rendering, footnotes, inlined KaTeX fonts.
- If unsure how a Markdown feature should be written, inspect `examples/markdown-features.md`. It is the canonical fixture for headings, emphasis, links, blockquotes, lists, task lists, tables, code fences, KaTeX math, images, captions, collapsible details, and footnotes.
- Use `[^label]` footnotes for source citations, bibliography references, caveats, and short explanatory notes. The renderer shows numeric markers even when labels are descriptive.

```md
A sourced claim belongs in the body.[^source]

![Chart of revenue](./revenue.png)
*Source: Company FY2025 annual report.*

[^source]: Company FY2025 annual report, p. 42.
```

- Because this route is stdin/stdout based, it suits markdown-only or markdown-first pages. For JavaScript, ECharts, search/filter, complex stateful UI, or broader app behavior, switch to the dynamic route.

### Dynamic document / webapp route

- Use this route when the page genuinely behaves like an app or needs bundling beyond plain markdown.
- Typical triggers: ECharts, forms, client-side filters, view switching, stateful interactions, animation logic, broader application assets.
- Set up a normal bun project, split files cleanly, and build a standalone HTML artifact:

```bash
bun build --compile --target=browser --minify ./index.html --outdir=dist
```

- See [Bun's standalone HTML docs](https://bun.com/docs/bundler/standalone-html) for asset handling.
- The compiled output is a single self-contained HTML, which satisfies the root finalization rule.

### Where to put the source files

Source layout is independent of where files are deployed. Decide based on lifespan:

- **Simple static route**: usually no project folder at all. Run the bundled script directly and write the resulting HTML where needed.
- **One-shot project** (research a product, summarize a paper): create the project under `/tmp` (the OS tempdir, not the vibe-site tmp).
- **Likely-iterated project**: create it in the workspace. If the workspace was created just for this project, put files at its root; otherwise make a subfolder.

### Server reference

For the curious agent, here is what the Nginx configuration actually does on `vibe.ylxdzsw.com`:

- `/` — autoindexed, serves files from `/var/www/vibe/`.
- `/tmp/` — autoindex off, serves files from `/var/www/vibe/tmp/` by exact path only. `https://vibe.ylxdzsw.com/tmp/` returns 404.
- `*.pptx` (anywhere) — 302 redirects to Office Online's embedded viewer, with the file fetched via the `/_raw/` alias. Uploading a PPTX immediately gives a browser-viewable URL, no extra steps.
- `/_raw/<path>` — alias for `/var/www/vibe/<path>` without the regex location handlers (used by the PPTX redirect target). Agents normally don't link directly to `/_raw/`.
- Static asset extensions (`.css`, `.js`, images, fonts) get a 4h `Cache-Control` header. HTML and PPTX rely on Cloudflare's defaults.
- Hidden files (`/.something`) are denied.

### Themes for content

Pick a theme based on the deliverable's purpose.

#### Minimal

General-purpose reports.

- Minimal CSS and decorations.
- Focus on key messages; skip boilerplate.
- Cite online-search information.
- Be detailed on actual content.
- Fits the simple static route especially well.

#### Academic

Reports involving math or academic-paper-like rigor.

- Organize like a short paper.
- Cite every source with footnotes.
- The simple static route can render KaTeX, so reach for the dynamic route only when math is part of an interactive application.
- Avoid color gradients.

#### Business

McKinsey-style report.

- For animated plots or dashboards, use the dynamic route with `ECharts`.
- Use either a vibrant palette anchored on `#CF0A2C`, or a professional palette mostly on `#003087` and `#C9A227`.
- High information density. These are cooperative reports, not advertisements; every screen carries actual content (the title page is the only exception).
- A scrollable webpage that reads cleanly on mobile, but content is organized as self-contained "screens" — each idea fully visible without scrolling back and forth.
- Highlight key ideas for ADHD readers while keeping all detail for high density.

### Quality control

- Use the `agent-browser` skill to screenshot and verify layout and rendering.
- Information is the priority. Every paragraph and figure should convey an actual, non-trivial idea. Avoid generic transition prose.
- Be detailed: collect information widely, brainstorm thoroughly, verify every claim.
- Do not include guidance, constraints, or process notes inside the rendered page. The deliverable is a final product, not a progress record. (For example, if the user asked you to build without React, just build it without React; do not say so on the page.)
- Pick a URL-safe filename. Lower-case, dashes, no spaces.
