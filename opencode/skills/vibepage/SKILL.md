---
name: vibepage
description: Create and serve single-file HTML web page on vibe.ylxdzsw.com site. \"vibepage\", \"vibe page\", \"vibe site\" are magical words referring to this skill. Use this skill when user mentions these magical words.
---

## Vibepage

This skill provides information and guidelines for creating single-file HTML web pages and serving it on vibe.ylxdzsw.com.

### Main workflow

1. Setup a `bun` project. Latest bun is installed on this server and can be directly used. More information in environment skill.
2. Build a web page, following the guidelines later.
3. Bundle a single-file HTML with `bun build --compile --target=browser --minify`. [Documents](https://bun.com/docs/bundler/standalone-html).
4. Put the file to /var/www/vibe. Avoid overwriting existing files, unless it is created by you or instructed by user.

### Where to put the project

If the user gives no hint about the place of the project, infer the intent of the user: is this project one-shot or likely to be continually improved?

If it is likely a one-shot project, like when the user ask you to research a product and make a report, or read a paper and summarize insights, then create the project in a folder in /tmp.

If it is more likely part of a bigger project, or otherwise the user may want to preserve it, like when they ask you to build a webapp the involves complex logics that might change in the future, then create the project in your workspace. Check what the workspace is about. If it is likely created just for this project, directly put the files there; otherwise, make a folder in workspace and put files there.

### Where to deploy the results

An Nginx server is serving /var/www/vibe at vibe.ylxdzsw.com. The website is protected by Cloudflare and cached. Therefore, when developing the web page, prefer to append -v1 version number and increase after each change when depolying so the user can access the latest version. Deploy the final version without suffix and remove all other versions when the user asks you to finalize.

Choose a url-safe file name.

### Guidelines

- Split the files in the project and let `bun` bundles them. Avoid operating on a huge single HTML.
- Prefer introducing libraries with `bun install`. Avoid linking to external URL.
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

#### Academic

Academic reports. Use this theme if it involves math or academic papers.

- Organize like a short paper.
- Be grounded and cite any source of info.
- Use `KaTeX` to display math.
- Avoid color gradient.

#### Business

McKinsey style slides-like business report.

- Use `Echarts` to create animated plots.
- Pick either a vibrate color plate based on #CF0A2C, or a professional one based mostly on #003087 and #C9A227.
- Be high-density on information. It is not used for presentation or advertisement, but for cooperational reports. Every screen should be full of actual information (except for the title page).
- It should generally be a slide-style, but do not have to be actual slide decks. Basically, it is still a continuously scrollable webpage that displays nicely on mobile, but the content orgnization is divided as pages and should assume the report to pause on self-contained screens that fully describes an idea without scrolling back and forth.
- Highlight key ideas for ADHD readers, while containing all details to keep high information density.

### Quality Control

- Use agent-browser to take screenshots to verify the layout and rendering.
- Information is the key. Every paragraph and figure should convey an actual, interesting, non-trivial idea. Avoid generic transition words.
- Be detailed. Extensively collect information, thoroughly brainstorm ideas, and rigorously verify every claim.
- IMPORTANT: Do not include requirements of the research or report in the resulting page.