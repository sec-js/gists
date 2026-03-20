#!/usr/bin/env bun

import { existsSync } from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import MarkdownIt from "markdown-it"
import hljs from "highlight.js"
import { katex as katexPlugin } from "@mdit/plugin-katex"
import taskLists from "markdown-it-task-lists"

type Theme = "minimal" | "academic" | "business"

type Options = {
  theme: Theme
  title?: string
}

const THEMES: Record<Theme, string> = {
  minimal: `
body.theme-minimal {
  --page-bg: #f6f3ee;
  --text: #1d1b19;
  --muted: #5f5a54;
  --border: #d8d0c5;
  --surface: #fffdf9;
  --accent: #0f5c4d;
  --heading-font: "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif;
  --body-font: "Source Serif 4", "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  --code-font: "SFMono-Regular", "JetBrains Mono", Consolas, monospace;
}
`,
  academic: `
body.theme-academic {
  --page-bg: #f4f0e8;
  --text: #171512;
  --muted: #5a534a;
  --border: #cfc4b5;
  --surface: #fbf7f1;
  --accent: #8a2f24;
  --heading-font: "Baskerville", "Times New Roman", serif;
  --body-font: "Charter", "Iowan Old Style", Georgia, serif;
  --code-font: "SFMono-Regular", "JetBrains Mono", Consolas, monospace;
}
`,
  business: `
body.theme-business {
  --page-bg: #f3f6fb;
  --text: #122033;
  --muted: #506074;
  --border: #c9d5e3;
  --surface: #ffffff;
  --accent: #003087;
  --heading-font: "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif;
  --body-font: "IBM Plex Sans", "Segoe UI", "Helvetica Neue", sans-serif;
  --code-font: "SFMono-Regular", "JetBrains Mono", Consolas, monospace;
}
`,
}

const BASE_CSS = `
:root {
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

html {
  background: var(--page-bg);
}

body {
  margin: 0 auto;
  max-width: 78ch;
  padding: 48px 24px 80px;
  background: var(--page-bg);
  color: var(--text);
  font-family: var(--body-font);
  font-size: 18px;
  line-height: 1.72;
  text-rendering: optimizeLegibility;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 2.2em 0 0.7em;
  color: var(--text);
  font-family: var(--heading-font);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.18;
}

h1 {
  margin-top: 0;
  font-size: clamp(2.4rem, 7vw, 3.4rem);
}

h2 {
  font-size: clamp(1.7rem, 4vw, 2.25rem);
  padding-bottom: 0.18em;
  border-bottom: 1px solid var(--border);
}

h3 {
  font-size: 1.45rem;
}

h4,
h5,
h6 {
  font-size: 1.1rem;
}

p,
ul,
ol,
blockquote,
pre,
table {
  margin: 1em 0;
}

ul,
ol {
  padding-left: 1.35em;
}

li + li {
  margin-top: 0.35em;
}

a {
  color: var(--accent);
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.18em;
}

a:hover {
  text-decoration-style: solid;
}

blockquote {
  margin-left: 0;
  padding: 0.2em 0 0.2em 1.1em;
  color: var(--muted);
  border-left: 3px solid var(--accent);
}

hr {
  margin: 2.5em 0;
  border: 0;
  border-top: 1px solid var(--border);
}

code,
pre {
  font-family: var(--code-font);
  font-size: 0.92em;
}

code {
  padding: 0.12em 0.34em;
  border-radius: 0.35em;
  background: color-mix(in srgb, var(--surface) 78%, var(--accent) 6%);
}

pre {
  overflow-x: auto;
  padding: 1em 1.1em;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
}

pre code {
  padding: 0;
  background: transparent;
}

.hljs {
  display: block;
  overflow-x: auto;
  color: #24292f;
  background: transparent;
}

.hljs-subst {
  color: inherit;
}

.katex-display {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.35em 0 0.6em;
}

.katex-error {
  color: #b42318;
}

table {
  display: block;
  width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
}

th,
td {
  padding: 0.7em 0.8em;
  border: 1px solid var(--border);
  text-align: left;
  vertical-align: top;
}

th {
  font-family: var(--heading-font);
  font-weight: 700;
  background: color-mix(in srgb, var(--surface) 86%, var(--accent) 8%);
}

img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 1.4em auto;
  border-radius: 14px;
}

input[type="checkbox"] {
  margin-right: 0.5em;
}

strong {
  font-weight: 700;
}

::selection {
  background: color-mix(in srgb, var(--accent) 24%, white 76%);
}

@media (max-width: 720px) {
  body {
    padding: 28px 18px 56px;
    font-size: 16px;
  }

  pre {
    border-radius: 12px;
  }
}
`

function printHelp() {
  process.stdout.write(
    `Usage: bun run markdown-to-html.ts [--title <title>] [--theme minimal|academic|business] < input.md > output.html\n`,
  )
}

function usageError(message: string): never {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    theme: "minimal",
  }

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]

    if (arg === "--help" || arg === "-h") {
      printHelp()
      process.exit(0)
    }

    if (arg === "--title") {
      const value = argv[index + 1]
      if (!value) usageError("Missing value for --title")
      options.title = value
      index += 1
      continue
    }

    if (arg === "--theme") {
      const value = argv[index + 1]
      if (!value) usageError("Missing value for --theme")
      if (!(value in THEMES)) usageError(`Unknown theme: ${value}`)
      options.theme = value as Theme
      index += 1
      continue
    }

    usageError(`Unknown argument: ${arg}`)
  }

  return options
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function normalizeTitle(value: string) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/\\([\\`*_{}\[\]()#+\-.!])/g, "$1")
    .trim()
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
}

function extractKatexErrors(html: string) {
  const messages: string[] = []

  for (const tagMatch of html.matchAll(/<[^>]*katex-error[^>]*>/g)) {
    const tag = tagMatch[0]
    const titleMatch = tag.match(/title=(['"])(.*?)\1/)
    if (!titleMatch) continue
    messages.push(decodeHtmlEntities(titleMatch[2]))
  }

  return messages
}

const require = createRequire(import.meta.url)
const katexCssPath = require.resolve("katex/dist/katex.min.css")
const highlightCssPath = require.resolve("highlight.js/styles/github.css")

const markdownEngine = MarkdownIt({
  html: true,
  linkify: true,
  langPrefix: "language-",
  highlight(code, language) {
    const safeLanguage = language.trim()
    const knownLanguage = safeLanguage && hljs.getLanguage(safeLanguage) ? safeLanguage : undefined
    const highlighted = knownLanguage
      ? hljs.highlight(code, { language: knownLanguage, ignoreIllegals: true }).value
      : escapeHtml(code)
    const className = knownLanguage ? `hljs language-${escapeHtml(knownLanguage)}` : "hljs"

    return `<pre><code class="${className}">${highlighted}</code></pre>`
  },
})
  .use(taskLists)
  .use(katexPlugin)

function extractTitle(markdown: string, explicitTitle?: string) {
  if (explicitTitle) return explicitTitle

  let inFence = false

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (/^(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }

    if (inFence) continue

    const match = line.match(/^#\s+(.+?)\s*#*\s*$/)
    if (!match) continue

    const normalized = normalizeTitle(match[1])
    if (normalized) return normalized
  }

  return "Untitled document"
}

function cssImport(filePath: string) {
  const normalized = filePath.replaceAll("\\", "/").replaceAll('"', '\\"')
  return `@import "${normalized}";`
}

function buildStylesheet(theme: Theme) {
  return [cssImport(katexCssPath), cssImport(highlightCssPath), BASE_CSS.trim(), THEMES[theme].trim()].join("\n\n")
}

function buildDocument(body: string, options: Options, title: string) {
  return [
    "<!DOCTYPE html>",
    "<html>",
    "<head>",
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    `  <title>${escapeHtml(title)}</title>`,
    '  <link rel="stylesheet" href="./__vibepage_standalone__.css">',
    "</head>",
    `<body class="theme-${options.theme}">`,
    body.trim(),
    "</body>",
    "</html>",
  ].join("\n")
}

async function collectAbsoluteAssetFiles(html: string) {
  const files: Record<string, Uint8Array> = {}
  let index = 0
  const matches = Array.from(html.matchAll(/\b(src|poster)=(["'])(\/[^"']+)\2/g))
  let rewritten = html

  for (const match of matches) {
    const [fullMatch, attr, quote, assetPath] = match
    if (!existsSync(assetPath)) continue

    const extension = path.extname(assetPath)
    const filename = `./__vibepage_asset_${index}${extension}`
    const virtualPath = path.join(process.cwd(), `__vibepage_asset_${index}${extension}`)

    files[virtualPath] = await Bun.file(assetPath).bytes()
    index += 1

    rewritten = rewritten.replace(fullMatch, `${attr}=${quote}${filename}${quote}`)
  }

  return { html: rewritten, files }
}

function renderMarkdown(source: string) {
  const katexErrors: string[] = []
  const originalConsoleError = console.error

  console.error = (...args) => {
    katexErrors.push(args.map((part) => (part instanceof Error ? part.message : String(part))).join(" "))
  }

  let body: string

  try {
    body = markdownEngine.render(source)
  } finally {
    console.error = originalConsoleError
  }

  const embeddedKatexErrors = extractKatexErrors(body)

  if (katexErrors.length > 0 || embeddedKatexErrors.length > 0) {
    throw new Error([...katexErrors, ...embeddedKatexErrors].join("\n\n") || "KaTeX rendering failed")
  }

  return body
}

function formatBuildLog(log: BuildMessage) {
  const location = log.position ? `${log.position.file}:${log.position.line}:${log.position.column}` : undefined
  return [location, log.message].filter(Boolean).join(" ")
}

async function bundleStandalone(html: string, css: string) {
  const cwd = process.cwd()
  const entrypoint = path.join(cwd, "__vibepage_standalone__.html")
  const stylesheet = path.join(cwd, "__vibepage_standalone__.css")
  const assets = await collectAbsoluteAssetFiles(html)

  const result = await Bun.build({
    entrypoints: [entrypoint],
    compile: true,
    target: "browser",
    files: {
      [entrypoint]: assets.html,
      [stylesheet]: css,
      ...assets.files,
    },
  })

  if (!result.success) {
    throw new Error(result.logs.map(formatBuildLog).join("\n") || "Bun standalone HTML build failed")
  }

  const output = result.outputs.find((item) => item.path.endsWith(".html")) ?? result.outputs[0]
  return await output.text()
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const source = await new Response(Bun.stdin.stream()).text()
  const title = extractTitle(source, options.title)
  const body = renderMarkdown(source)
  const html = buildDocument(body, options, title)
  const css = buildStylesheet(options.theme)
  const bundled = await bundleStandalone(html, css)

  process.stdout.write(`${bundled}\n`)
}

await main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
})
