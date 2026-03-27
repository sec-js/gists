#!/usr/bin/env bun

import { existsSync } from "node:fs"
import path from "node:path"
import MarkdownIt from "markdown-it"
import hljs from "highlight.js"
import { katex as katexPlugin } from "@mdit/plugin-katex"
import taskLists from "markdown-it-task-lists"

type Options = {
  title?: string
}

const BASE_CSS = `
:root {
  color-scheme: light dark;
  --page-bg: #ffffff;
  --page-text: #1f2328;
  --page-muted: #656d76;
  --page-border: #d0d7de;
  --page-surface: #f6f8fa;
  --page-link: #0969da;
  --page-link-hover: #0550ae;
  --page-quote: #57606a;
  --page-code: #1f2328;
  --page-code-bg: rgba(175, 184, 193, 0.2);
  --page-code-border: #d0d7de;
  --page-selection: rgba(9, 105, 218, 0.2);
  --page-token-comment: #6e7781;
  --page-token-keyword: #cf222e;
  --page-token-string: #0a3069;
  --page-token-number: #0550ae;
  --page-token-title: #8250df;
  --page-token-meta: #953800;
  --page-token-built_in: #8250df;
}

* {
  box-sizing: border-box;
}

html {
  background: var(--page-bg);
}

body {
  margin: 0 auto;
  max-width: 980px;
  padding: 32px 16px 56px;
  background: var(--page-bg);
  color: var(--page-text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  font-size: 16px;
  line-height: 1.5;
  text-rendering: optimizeLegibility;
}

body > :first-child {
  margin-top: 0 !important;
}

body > :last-child {
  margin-bottom: 0 !important;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 24px 0 16px;
  color: var(--page-text);
  font-family: inherit;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.18;
}

h1 {
  margin-top: 0;
  padding-bottom: 0.3em;
  font-size: 2em;
  border-bottom: 1px solid var(--page-border);
}

h2 {
  font-size: 1.5em;
  padding-bottom: 0.18em;
  border-bottom: 1px solid var(--page-border);
}

h3 {
  font-size: 1.25em;
}

h4,
h5,
h6 {
  font-size: 1em;
}

p,
ul,
ol,
blockquote,
pre,
table {
  margin: 0 0 16px;
}

ul,
ol {
  padding-left: 2em;
}

li + li {
  margin-top: 0.25em;
}

a {
  color: var(--page-link);
  text-decoration: none;
}

a:hover {
  color: var(--page-link-hover);
  text-decoration: underline;
}

blockquote {
  margin-left: 0;
  padding: 0 1em;
  color: var(--page-quote);
  border-left: 0.25em solid var(--page-border);
}

hr {
  margin: 24px 0;
  border: 0;
  border-top: 1px solid var(--page-border);
}

code,
pre {
  font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 85%;
}

code {
  padding: 0.2em 0.4em;
  margin: 0;
  color: var(--page-code);
  background: var(--page-code-bg);
  border-radius: 6px;
}

pre {
  overflow-x: auto;
  padding: 16px;
  border: 1px solid var(--page-code-border);
  border-radius: 6px;
  background: var(--page-surface);
  line-height: 1.45;
}

pre code {
  padding: 0;
  color: inherit;
  background: transparent;
  border-radius: 0;
}

.hljs {
  display: block;
  overflow-x: auto;
  color: inherit;
  background: transparent;
}

.hljs-subst,
.hljs-punctuation {
  color: inherit;
}

.hljs-comment,
.hljs-quote {
  color: var(--page-token-comment);
  font-style: italic;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-section,
.hljs-meta .hljs-keyword,
.hljs-doctag,
.hljs-name {
  color: var(--page-token-keyword);
}

.hljs-title,
.hljs-class .hljs-title,
.hljs-title.class_,
.hljs-title.class_.inherited__ {
  color: var(--page-token-title);
}

.hljs-string,
.hljs-attr,
.hljs-attribute,
.hljs-symbol,
.hljs-bullet,
.hljs-built_in,
.hljs-addition {
  color: var(--page-token-string);
}

.hljs-number,
.hljs-literal,
.hljs-regexp,
.hljs-link {
  color: var(--page-token-number);
}

.hljs-meta,
.hljs-selector-id,
.hljs-template-tag,
.hljs-template-variable,
.hljs-params {
  color: var(--page-token-meta);
}

.hljs-deletion {
  color: var(--page-token-keyword);
}

.katex-display {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.25em 0 0.5em;
}

.katex-error {
  color: #b42318;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 6px 13px;
  border: 1px solid var(--page-border);
  text-align: left;
  vertical-align: top;
}

th {
  font-weight: 700;
  background: var(--page-surface);
}

img {
  max-width: 100%;
  height: auto;
  margin: 16px 0;
  background-color: transparent;
}

input[type="checkbox"] {
  margin-right: 0.5em;
}

ul.task-list-item,
ol.task-list-item,
li.task-list-item {
  list-style: none;
}

ul.task-list-item,
ol.task-list-item {
  padding-left: 0;
}

summary {
  cursor: pointer;
}

strong {
  font-weight: 700;
}

::selection {
  background: var(--page-selection);
}

@media (prefers-color-scheme: dark) {
  :root {
    --page-bg: #0d1117;
    --page-text: #c9d1d9;
    --page-muted: #8b949e;
    --page-border: #30363d;
    --page-surface: #161b22;
    --page-link: #58a6ff;
    --page-link-hover: #79c0ff;
    --page-quote: #8b949e;
    --page-code: #c9d1d9;
    --page-code-bg: rgba(110, 118, 129, 0.25);
    --page-code-border: #30363d;
    --page-selection: rgba(88, 166, 255, 0.25);
    --page-token-comment: #8b949e;
    --page-token-keyword: #ff7b72;
    --page-token-string: #a5d6ff;
    --page-token-number: #79c0ff;
    --page-token-title: #d2a8ff;
    --page-token-meta: #ffa657;
    --page-token-built_in: #d2a8ff;
  }

  .katex-error {
    color: #f85149;
  }
}

@media (max-width: 720px) {
  body {
    padding: 24px 16px 48px;
  }

  pre {
    padding: 12px;
  }
}
`

function printHelp() {
  process.stdout.write(
    `Usage: bun run markdown-to-html.ts [--title <title>] < input.md > output.html\n`,
  )
}

function usageError(message: string): never {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}

function parseArgs(argv: string[]): Options {
  const options: Options = {}

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

function buildStylesheet() {
  return BASE_CSS.trim()
}

function buildDocument(body: string, title: string) {
  return [
    "<!DOCTYPE html>",
    "<html>",
    "<head>",
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    `  <title>${escapeHtml(title)}</title>`,
    '  <link rel="stylesheet" href="./__vibepage_standalone__.css">',
    "</head>",
    "<body>",
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
  const html = buildDocument(body, title)
  const css = buildStylesheet()
  const bundled = await bundleStandalone(html, css)

  process.stdout.write(`${bundled}\n`)
}

await main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
})
