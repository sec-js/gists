---
name: vibepage
description: Create and serve single-file HTML web page on vibe.ylxdzsw.com site. \"vibepage\", \"vibe page\", \"vibe site\" are magical words referring to this skill. Use this skill when user mentions these magical words.
---

## Vibepage

This skill provides information and guidelines for creating single-file HTML web pages and serving it on vibe.ylxdzsw.com.

### First classify the request

Choose one of these two routes before you start building:

1. **Simple static document**: the deliverable is mostly content, especially when markdown already exists or can be produced directly. No client-side state, no filters, no charts that require JavaScript, no app-like interactions.
2. **Dynamic document / webapp**: the deliverable needs JavaScript, app state, charts, forms, search/filter UI, multi-view interactions, ECharts, or broader asset/application bundling than the markdown script route is meant to handle.

Prefer the simple static route whenever it is sufficient.

### Main workflow

1. Classify the task as either a simple static document or a dynamic document / webapp.
2. For a simple static document, do not create a dedicated project folder unless the user asks for one or you truly need to preserve intermediate files. Use this skill's bundled `scripts/markdown-to-html.ts` script directly.
3. For a dynamic document / webapp, set up a `bun` project. Latest bun is installed on this server and can be directly used. More information in environment skill.
4. Build the page following the guidelines later.
5. For dynamic routes, bundle a single-file HTML with `bun build --compile --target=browser --minify ./index.html --outdir=dist`. [Documents](https://bun.com/docs/bundler/standalone-html).
6. Put the final file in `/var/www/vibe`. Avoid overwriting existing files, unless it is created by you or instructed by user.

### Simple static document route

- Use this route for markdown-first deliverables, especially when the user already has markdown or when you can generate the markdown directly from research.
- This skill bundles `scripts/markdown-to-html.ts`. It reads markdown from `stdin` and writes a full HTML document to `stdout`.
- The script intentionally keeps the output minimal: rendered markdown HTML, `<title>`, `meta viewport`, and inline CSS only. Do not add extra chrome such as headers, footers, tables of contents, or scaffolding unless the user explicitly wants them in the markdown itself.
- Let failures surface. Do not wrap the script in a way that hides `stderr`, because the agent should see parse/runtime errors and fix them.
- Internally the script now calls Bun's standalone HTML bundler, so linked CSS, KaTeX fonts, syntax-highlighting styles, and local image assets can be inlined into the final single-file HTML.
- Relative asset paths are resolved from the current working directory. If the markdown refers to local images like `./figure.png`, run the script from the markdown's directory. Absolute filesystem image paths also work.
- Do not use frontmatter with this route. The script does not parse frontmatter metadata; it treats the markdown as plain markdown content.
- Example usage:

```bash
cat report.md | bun run <skill-base>/scripts/markdown-to-html.ts --theme academic > report-v1.html
cat report.md | bun run <skill-base>/scripts/markdown-to-html.ts --title "Quarterly Report" --theme business > report-v1.html
```

- Replace `<skill-base>` with this skill's resolved base directory from the loaded skill output.
- If `--title` is omitted, the script derives the title from the first markdown `# H1` when possible.
- This route now supports server-side KaTeX rendering and syntax highlighting for fenced code blocks while still outputting a single standalone HTML file.
- Because this route is stdin/stdout based, it is best for markdown-only or markdown-first pages. If you need JavaScript, ECharts, search/filter interactions, complex stateful UI, or broader app behavior, switch to the dynamic route.

### Dynamic document / webapp route

- Use this route when the page genuinely behaves like an app or needs bundling beyond plain markdown rendering.
- Typical triggers: ECharts, forms, client-side filters, view switching, stateful interactions, animation logic, or application assets/workflows that go beyond what the markdown script route handles.
- In this route, create a normal bun project, split files cleanly, and build a standalone HTML artifact with `bun build --compile --target=browser`.

### Where to put the project

If the user gives no hint about the place of the project, infer the intent of the user: is this project one-shot or likely to be continually improved?

If it is a simple static document route, you usually do not need a project folder at all. Use the bundled script directly and write the resulting HTML where needed.

If it is likely a one-shot project, like when the user ask you to research a product and make a report, or read a paper and summarize insights, then create the project in a folder in /tmp.

If it is more likely part of a bigger project, or otherwise the user may want to preserve it, like when they ask you to build a webapp the involves complex logics that might change in the future, then create the project in your workspace. Check what the workspace is about. If it is likely created just for this project, directly put the files there; otherwise, make a folder in workspace and put files there.

### Where to deploy the results

An Nginx server is serving /var/www/vibe at vibe.ylxdzsw.com. The website is protected by Cloudflare and cached. Therefore, when developing the web page, prefer to append -v1 version number and increase after each change when depolying so the user can access the latest version. Deploy the final version without suffix and remove all other versions when the user asks you to finalize.

Choose a url-safe file name.

### Guidelines

- Prefer the simple static document route when markdown is already available or the page is essentially a styled document.
- Do not create a dedicated project folder for the simple static route unless there is a strong reason.
- For dynamic routes, split the files in the project and let `bun` bundle them. Avoid operating on a huge single HTML.
- Prefer introducing libraries with `bun install` only when the dynamic route actually needs them. Avoid linking to external URL.
- Focus on content, don't overengineer the code.
- Important: do not include any guiding words on constraints in the resulting webpage. For example, if the user ask you to build a webapp without using React, you just build it without React, do not say in the page that it is build without React. The resulting page is a final product, not a progress record.
- Prefer picking a theme from following, and follow the designs.

### Themes

#### Minimal

General, regular reports.

- Use minimal CSS and decorations.
- Focus on key messages, avoid general information.
- Include reference for online-search information.
- Be detailed on the actual content.
- This theme fits the simple static document route especially well.

#### Academic

Academic reports. Use this theme if it involves math or academic papers.

- Organize like a short paper.
- Be grounded and cite any source of info.
- The simple static markdown route can render math with `KaTeX` now, so use the dynamic route only when math is part of a more interactive application.
- Avoid color gradient.

#### Business

McKinsey style slides-like business report.

- If the page needs animated plots or dashboards, use the dynamic route and `Echarts`.
- Pick either a vibrate color plate based on #CF0A2C, or a professional one based mostly on #003087 and #C9A227.
- Be high-density on information. It is not used for presentation or advertisement, but for cooperational reports. Every screen should be full of actual information (except for the title page).
- It should generally be a slide-style, but do not have to be actual slide decks. Basically, it is still a continuously scrollable webpage that displays nicely on mobile, but the content orgnization is divided as pages and should assume the report to pause on self-contained screens that fully describes an idea without scrolling back and forth.
- Highlight key ideas for ADHD readers, while containing all details to keep high information density.

### Quality Control

- Use agent-browser to take screenshots to verify the layout and rendering.
- Information is the key. Every paragraph and figure should convey an actual, interesting, non-trivial idea. Avoid generic transition words.
- Be detailed. Extensively collect information, thoroughly brainstorm ideas, and rigorously verify every claim.
- IMPORTANT: Do not include requirements of the research or report in the resulting page.
