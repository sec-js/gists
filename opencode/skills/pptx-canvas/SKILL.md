---
name: pptx-canvas
description: Design presentation slides as HTML and export to editable PPTX with pixel-perfect visual fidelity
---

# pptx-canvas

You are an expert presentation designer. You create professional slide decks by
authoring individual HTML slide files, previewing them in a browser, and converting
them to a portable PowerPoint (PPTX) file.

## Workflow

### Step 1 — Discover

Gather requirements before designing anything:

- **Topic and purpose**: what is this presentation about? What outcome should it drive?
- **Audience**: who will see this? (executives, engineers, clients, students)
- **Length**: how many slides? (suggest a range if the user is unsure)
- **Tone**: formal, casual, technical, inspirational?
- **Language**: Chinese is the primary language. Confirm with the user.
- **Key messages**: what are the 2–3 things the audience must remember?
- **Visual assets**: does the user have images, logos, or data to include?
- **Constraints**: any branding requirements, fonts, or style mandates?

### Step 2 — Design

1. **Choose a theme** from the `themes/` folder (or create a custom one). Present
   the theme's mood and color palette to the user for approval.
2. **Draft an outline**: list each slide with its title, template, and a brief
   content description. Example:
   ```
   01 - Title Slide (title-slide): "AI-Driven Quality Inspection"
   02 - Agenda (content-bullets): Overview of the four main topics
   03 - Problem (section-transition): "The Challenge"
   04 - Current State (side-by-side): Manual vs. automated inspection
   ...
   ```
3. Get user confirmation on the outline before proceeding.

### Step 3 — Build

Generate each slide as a **standalone HTML file**. Each file must be independently
openable in a browser and must conform to the HTML constraints below.

**Always start from the scaffold** (`scripts/scaffold.html`). Copy it for each new
slide and fill in the content inside the root `<div id="slide">`. The scaffold
provides the boilerplate: doctype, charset, viewport, body margin reset, root
element with 1280×720 dimensions, `box-sizing:border-box`, `overflow:hidden`,
and `font-family:'Microsoft YaHei'`. Add layout styles (flex, padding, background)
to `#slide` by editing its `style` attribute. Never write the boilerplate by hand.

Use flexbox for layout. Apply the theme's colors and the template's structural
guidance. Fill in content based on the outline.

Name files sequentially: `01-title.html`, `02-agenda.html`, etc.

After generating slides, copy `scripts/deck-viewer.html` into the workspace.
The viewer reads the slide list from a `<script type="application/json"
id="slide-list">` block; replace its `[]` with the actual filenames, e.g.
`["01-title.html", "02-agenda.html", ...]`.

**Mandatory: screenshot verification with `agent-browser`**

After generating each slide, use the `agent-browser` skill to:

1. Open the slide HTML at 1280×720.
2. Take a screenshot of the rendered slide.
3. Inspect the screenshot for:
   - Unintentional text wrapping or overflow
   - Text clipped by container boundaries
   - Misaligned elements
   - Missing images or broken image references
   - Color contrast issues (text unreadable against background)
   - Empty areas that should have content
4. Fix any issues found and re-screenshot to verify.

Do not skip this step. Visual bugs that are obvious in a screenshot are invisible
when reading HTML source code.

You can also run the script in validate-only mode to catch HTML constraint
violations without paying the screenshot/text-extract cost:

```bash
node <skill-path>/scripts/html-to-pptx.js --validate-only 01-title.html 02-agenda.html ...
```

### Step 4 — Refine

The user views the HTML deck in a browser and requests changes. Edit individual
HTML files as needed. Re-screenshot changed slides with `agent-browser` to verify
fixes.

This loop repeats until the user is satisfied with all slides.

### Step 5 — Convert and preview on vibesite

Convert the slides to PPTX:

```bash
node <skill-path>/scripts/html-to-pptx.js --output presentation-v1.pptx 01-title.html 02-agenda.html ...
```

Single-slide conversion uses the same command with one positional file:

```bash
node <skill-path>/scripts/html-to-pptx.js --output one.pptx 03-problem.html
```

The script depends on `playwright` and `pptxgenjs`. If they aren't already
resolvable, see "Dependencies" below for the recommended one-liner.

**Preview the rendered PPTX**, not just the local HTML. PowerPoint and the browser
disagree about font metrics, line breaking, and gradient banding, especially with
Chinese text. The most reliable preview is via vibesite:

1. Copy the output to `/var/www/vibe/tmp/<name>-vN.pptx`.
2. Open `https://vibe.ylxdzsw.com/tmp/<name>-vN.pptx` with the `agent-browser`
   skill. The vibesite nginx config 302-redirects any `*.pptx` URL to Office
   Online's embedded viewer, which renders the deck the same way PowerPoint
   Online does.
3. Screenshot each slide and compare to the local HTML render.

Iterate on issues found in the Office Online preview: edit the HTML, re-convert,
bump `-vN`, re-deploy, re-screenshot. The version bump is required because
Cloudflare caches static files at the edge.

### Step 6 — Finalize

Once the user is satisfied, copy the final PPTX to the vibesite root with the
suffix stripped:

```bash
cp presentation-v3.pptx /var/www/vibe/presentation.pptx
```

The PDF route is also available as a portable presenter-mode artifact (see
"PDF export" below).

See the `vibepage` skill for the full server reference, finalization rules, and
handling of HTML-only deliverables.

## Dependencies

The conversion script imports `playwright` and `pptxgenjs`. The skill does not
ship a `package.json` on purpose; the agent decides how to make these resolvable.

The simplest fresh-system invocation is via npx, with the playwright version
pinned to `1.59.1` so the cached Chromium under `~/.cache/ms-playwright` is
reused. Node ESM resolves modules from the script's directory and ignores
`NODE_PATH`, so the npx node_modules has to be linked next to the script for
the run:

```bash
SCRIPTS_DIR="<skill-path>/scripts"
npx --yes --package=playwright@1.59.1 --package=pptxgenjs -c \
  "ln -snf \"\$(dirname \$(dirname \$(command -v playwright)))\" \"$SCRIPTS_DIR/node_modules\" && node \"$SCRIPTS_DIR/html-to-pptx.js\" <args>; rc=\$?; rm -f \"$SCRIPTS_DIR/node_modules\"; exit \$rc"
```

If `playwright` and `pptxgenjs` are already resolvable in the environment (e.g.
a global install), the bare `node <skill-path>/scripts/html-to-pptx.js ...`
command works directly.

## Microsoft YaHei is required

All text must use **Microsoft YaHei** (`微软雅黑`), and the font must be installed
on the system where the conversion runs. The validator strictly compares the
declared family with the resolved family — substring or family-variant matches
(e.g. `Microsoft YaHei UI`) are rejected, because PowerPoint's text metrics
diverge from the variants. Any other family will fail validation hard.

This skill expects the font to be present and the script does not add fallbacks
for it. If the font is missing on a fresh system, install it from
[fernvenue/microsoft-yahei](https://github.com/fernvenue/microsoft-yahei) into
the system font path and run `fc-cache -f`.

The generated PPTX embeds the font name "Microsoft YaHei", which is the standard
family name recognized by Windows, Office, and the browser.

## HTML Slide Constraints

Every slide HTML file must follow these rules. The conversion script validates
them and fails fast with clear error messages on violations.

### Dimensions

The root element must be exactly **1280 × 720 pixels** (16:9 at 96 DPI). The
scaffold sets this up correctly with `box-sizing:border-box` and
`overflow:hidden`. Always start from the scaffold.

### Allowed Elements

Only these HTML elements may be used:

| Category | Elements |
|---|---|
| Layout | `div`, `table`, `tr`, `td`, `th` |
| Text | `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `p`, `li` |
| Inline | `span`, `b`, `i`, `u` |
| List | `ul`, `ol` |
| Media | `img` |

### Layout Rules

- **Use flexbox** for layout (`display:flex` on `div` elements). It is the
  recommended layout mechanism.
- `table` may be used as an alternative layout mechanism for tabular data.
- Text must only appear inside text elements (`h1`–`h6`, `p`, `li`, `td`, `th`).
  A `div` must NOT contain bare text nodes — only child elements.
- All styling should be inline (`style` attribute). No `<style>` blocks or
  external stylesheets needed.

### CSS Freedom (Visual Layer)

Because the conversion uses a screenshot for the visual layer, CSS styling on
non-text elements is unrestricted. You may freely use:

- Backgrounds: solid colors, gradients, images
- Borders, `border-radius`, `box-shadow`
- Pseudo-elements (`::before`, `::after`) for decoration
- `clip-path`, `opacity`, CSS filters

**Exception**: avoid `text-shadow`, `background-clip: text`, or `-webkit-text-stroke`
on text elements. These create artifacts when text is made transparent for the
background screenshot.

### Images

Use standard `<img>` elements. SVG can be used via `<img>` tags — it will be
captured in the visual-layer screenshot.

## Sourcing images

Image sources, in order of preference:

1. **AI-generated** (default): use the `nano-banana` skill for diagrams,
   illustrations, conceptual visuals, and decorative imagery. Save the result
   locally and reference by path. This covers most slide imagery.
2. **Third-party real-world assets** (company logos, product photos, real app
   screenshots): download to a local file with `curl` or `wget`, then reference
   by path. Don't hotlink.
3. **Never reference a remote URL directly in `<img src>`**. Conversion runs
   offline-tolerant; remote URLs cause silent image-load failures and an
   unrenderable PPTX.

Path conventions: prefer absolute filesystem paths or paths relative to the
slide HTML's directory. Keep all images for a deck under one folder
(`images/` next to the slide HTMLs is conventional).

## Conversion Pipeline

The conversion script (`scripts/html-to-pptx.js`) uses this strategy:

1. **Visual layer**: renders the slide with all text made transparent, then
   screenshots the page → becomes the slide's background image in the PPTX.
2. **Text layer**: measures each text element's bounding box and computed styles
   → creates native PPTX text boxes at those positions.

Text in the PPTX is searchable, selectable, and editable, while all visual
decoration (backgrounds, gradients, shadows, images) is pixel-perfect.

### Text reflow heuristic

- Single-line text boxes: 5% extra width to prevent wrapping in PowerPoint.
- Multi-line text boxes: use measured dimensions as-is.

## PDF Export

Two flows are available; pick whichever fits.

### Browser print

Open the deck viewer in a browser and print to PDF (Ctrl+P / Cmd+P → Save
as PDF). The `@media print` styles flatten all slides into a multi-page PDF
with one slide per page. Text remains selectable.

### Presenter mode patch

To make the PDF open in **presenter mode** (fullscreen, one page at a time,
arrow keys to navigate), patch the PDF catalog after saving:

```bash
sed -i -E 's|/Type[[:space:]]+/Catalog|/Type /Catalog /PageLayout /SinglePage /PageMode /FullScreen|' presentation.pdf
```

This works because Chromium PDFs usually store the catalog in plain text. If
the catalog is inside a compressed object stream (uncommon), the patch silently
no-ops and the PDF still works — it just opens in the viewer's default mode.
That is acceptable.

## Themes

Theme files in `themes/` are free-style prose describing a design methodology:
the mood, color palette, typography scale, layout principles, and suggested
templates. Read the whole file rather than treating it as a structured
configuration. Available themes: `mckinsey` (business analysis), `huawei`
(technical report), `nvidia` (product showcase).

## Templates

Template files in `templates/` describe a slide archetype by its
**communication purpose** (not mechanical layout):

- `title-slide` — Opening slide. Title, subtitle, presenter line; one per deck.
- `section-transition` — Topic shift signal between major sections; minimal text, optional hero image.
- `content-bullets` — The workhorse slide. Action-title h1 plus 3–6 bullets, optionally with a side image.
- `side-by-side` — Two-column comparison (A vs B, before/after) with a conclusion row.
- `key-metric` — One impactful number, large and centered, with a one-line context. Variant covers 2–3 metrics.
- `data-table` — Tabular data with an action title; 3–5 columns, 3–8 rows.
- `product-hero` — Image-dominant showcase; minimal text, used for product reveals.
- `closing-slide` — Final slide. Call to action and contact line; mirrors the title slide for bookend cohesion.

Each template's `## HTML Sketch` shows the content that goes inside the
scaffold's `#slide` element, plus the styles to apply to `#slide` itself.
Adapt the sketch to the chosen theme's colors and typography.

## Design Quality Guardrails

Avoid generic AI-default visual patterns that make slides look templated and
brandless. Every visual choice should be intentional.

### Avoid

- **Gratuitous gradients**: purple-to-pink full-bleed backgrounds are the
  universal "AI made this" signal. Use gradients only when the theme calls for
  them, and keep them subtle and single-hue.
- **Emoji as icons**: ✨🚀💡 in headings or bullet points looks unprofessional.
  Use text or leave clean.
- **Filler content**: fabricated statistics ("10,000+ users"), fake quotes, or
  decorative metric cards with no real data. If data is missing, leave a
  placeholder and ask the user.
- **Overuse of decoration**: not every heading needs an icon, not every section
  needs a colored border accent. Give content room to breathe.
- **Uniform slides**: if every slide looks the same, the deck has no visual
  rhythm. Alternate between text-heavy and visual-heavy slides, vary background
  colors, and use section transitions to create pacing.

### Prefer

- **Theme colors only**: stick to the chosen theme's palette. Do not invent
  new colors mid-deck.
- **Action titles**: h1 should be a takeaway sentence ("Revenue grew 23%"),
  not a topic label ("Revenue").
- **Whitespace**: an empty area is a design feature, not a problem to fill.
- **One message per slide**: if a slide has two distinct points, split it.
- **Visual rhythm**: mix text-heavy, image-heavy, and data-heavy slides. Use
  section transitions to signal topic shifts.
- **Honest placeholders**: a gray rectangle labeled "product image needed" is
  better than a random stock photo or a crude SVG drawing.
