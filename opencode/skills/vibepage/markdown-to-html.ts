#!/usr/bin/env bun

import { existsSync, readFileSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { Marked } from "marked"
import markedKatex from "marked-katex-extension"
import { bundledLanguages, codeToHtml, type BundledLanguage, type ThemeRegistrationRaw } from "shiki"

type Theme = "opencode" | "github"

type Options = {
  title?: string
  theme: Theme
}

const require = createRequire(import.meta.url)
const KATEX_CSS_PATH = require.resolve("katex/dist/katex.min.css")
const KATEX_FONTS_DIR = path.join(path.dirname(KATEX_CSS_PATH), "fonts")

const GITHUB_CSS = `
:root {
  color-scheme: light dark;
  --page-bg: #ffffff;
  --page-text: #1f2328;
  --page-muted: #656d76;
  --page-border: #d0d7de;
  --page-surface: #f6f8fa;
  --page-link: #0969da;
  --page-link-hover: #0550ae;
  --page-code: #1f2328;
  --page-code-bg: rgba(175, 184, 193, 0.2);
  --page-selection: rgba(9, 105, 218, 0.2);
}

* {
  box-sizing: border-box;
}

html {
  background: var(--page-bg);
}

body {
  margin: 0 auto;
  max-width: 900px;
  padding: 32px 16px 56px;
  background: var(--page-bg);
  color: var(--page-text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  font-size: 16px;
  line-height: 1.5;
  text-rendering: optimizeLegibility;
}

[data-component="markdown"] > :first-child {
  margin-top: 0 !important;
}

[data-component="markdown"] > :last-child {
  margin-bottom: 0 !important;
}

[data-component="markdown"] h1,
[data-component="markdown"] h2,
[data-component="markdown"] h3,
[data-component="markdown"] h4,
[data-component="markdown"] h5,
[data-component="markdown"] h6 {
  margin: 24px 0 16px;
  color: var(--page-text);
  font-family: inherit;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

[data-component="markdown"] h1 {
  margin-top: 0;
  padding-bottom: 0.3em;
  font-size: 2em;
  border-bottom: 1px solid var(--page-border);
}

[data-component="markdown"] h2 {
  padding-bottom: 0.18em;
  font-size: 1.5em;
  border-bottom: 1px solid var(--page-border);
}

[data-component="markdown"] h3 {
  font-size: 1.25em;
}

[data-component="markdown"] h4,
[data-component="markdown"] h5,
[data-component="markdown"] h6 {
  font-size: 1em;
}

[data-component="markdown"] p,
[data-component="markdown"] ul,
[data-component="markdown"] ol,
[data-component="markdown"] blockquote,
[data-component="markdown"] pre,
[data-component="markdown"] table {
  margin: 0 0 16px;
}

[data-component="markdown"] ul,
[data-component="markdown"] ol {
  padding-left: 2em;
}

[data-component="markdown"] li + li {
  margin-top: 0.25em;
}

[data-component="markdown"] a {
  color: var(--page-link);
  text-decoration: none;
}

[data-component="markdown"] a:hover {
  color: var(--page-link-hover);
  text-decoration: underline;
}

[data-component="markdown"] blockquote {
  margin-left: 0;
  padding: 0 1em;
  color: var(--page-muted);
  border-left: 0.25em solid var(--page-border);
}

[data-component="markdown"] hr {
  margin: 24px 0;
  border: 0;
  border-top: 1px solid var(--page-border);
}

[data-component="markdown"] code,
[data-component="markdown"] pre {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 85%;
}

[data-component="markdown"] :not(pre) > code {
  padding: 0.2em 0.4em;
  margin: 0;
  color: var(--page-code);
  background: var(--page-code-bg);
  border-radius: 6px;
}

[data-component="markdown"] pre {
  overflow-x: auto;
  padding: 16px;
  border: 1px solid var(--page-border);
  border-radius: 6px;
  line-height: 1.45;
}

[data-component="markdown"] pre code {
  padding: 0;
  color: inherit;
  background: transparent;
  border-radius: 0;
  font-size: 100%;
}

[data-component="markdown"] .katex {
  font-size: 0.96em;
}

[data-component="markdown"] .katex-display {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.25em 0 0.5em;
}

[data-component="markdown"] .katex-error {
  color: #b42318;
}

[data-component="markdown"] table {
  width: 100%;
  border-collapse: collapse;
}

[data-component="markdown"] th,
[data-component="markdown"] td {
  padding: 6px 13px;
  border: 1px solid var(--page-border);
  text-align: left;
  vertical-align: top;
}

[data-component="markdown"] th {
  font-weight: 700;
  background: var(--page-surface);
}

[data-component="markdown"] img {
  max-width: 100%;
  height: auto;
  margin: 16px 0;
  background-color: transparent;
}

[data-component="markdown"] input[type="checkbox"] {
  margin-right: 0.5em;
}

[data-component="markdown"] li:has(> input[type="checkbox"]) {
  list-style: none;
}

[data-component="markdown"] summary {
  cursor: pointer;
}

[data-component="markdown"] strong {
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
    --page-code: #c9d1d9;
    --page-code-bg: rgba(110, 118, 129, 0.25);
    --page-selection: rgba(88, 166, 255, 0.25);
  }

  [data-component="markdown"] .katex-error {
    color: #f85149;
  }
}

@media (max-width: 720px) {
  body {
    padding: 24px 16px 48px;
  }

  [data-component="markdown"] pre {
    padding: 12px;
  }
}
`

const OPENCODE_CSS = `
:root {
  color-scheme: light dark;
  --font-family-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-family-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  --font-family-mono--font-feature-settings: normal;
  --font-size-small: 13px;
  --font-size-base: 14px;
  --font-weight-medium: 500;
  --line-height-large: 150%;
  --letter-spacing-normal: 0;
  --radius-sm: 0.25rem;
  --background-base: #f8f8f8;
  --background-stronger: #fcfcfc;
  --text-strong: #171717;
  --text-base: #6f6f6f;
  --text-weak: #8f8f8f;
  --text-weaker: #c7c7c7;
  --text-interactive-base: #034cff;
  --border-weak-base: #dbdbdb;
  --border-weaker-base: #e8e8e8;
  --surface-base: #f8f8f8;
  --surface-raised-base: #f3f3f3;
  --syntax-comment: #7a7a7a;
  --syntax-regexp: var(--text-base);
  --syntax-string: #00ceb9;
  --syntax-keyword: #a753ae;
  --syntax-primitive: #034cff;
  --syntax-operator: var(--text-base);
  --syntax-variable: var(--text-strong);
  --syntax-property: #a753ae;
  --syntax-type: #8a6f00;
  --syntax-constant: #007b80;
  --syntax-punctuation: var(--text-base);
  --syntax-object: var(--text-strong);
  --syntax-critical: #ff8c00;
  --syntax-info: #0092a8;
  --selection: rgba(3, 76, 255, 0.15);
}

* {
  box-sizing: border-box;
}

html {
  background: var(--background-base);
}

body {
  margin: 0 auto;
  max-width: 900px;
  padding: 40px 20px 64px;
  background: var(--background-base);
  color: var(--text-strong);
  font-family: var(--font-family-sans);
  text-rendering: optimizeLegibility;
}

[data-component="markdown"] {
  min-width: 0;
  max-width: 100%;
  overflow-wrap: break-word;
  color: var(--text-strong);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  line-height: 160%;
}

[data-component="markdown"] > *:first-child {
  margin-top: 0;
}

[data-component="markdown"] > *:last-child {
  margin-bottom: 0;
}

[data-component="markdown"] h1,
[data-component="markdown"] h2,
[data-component="markdown"] h3,
[data-component="markdown"] h4,
[data-component="markdown"] h5,
[data-component="markdown"] h6 {
  margin-top: 0;
  margin-bottom: 24px;
  color: var(--text-strong);
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-large);
}

[data-component="markdown"] strong,
[data-component="markdown"] b {
  color: var(--text-strong);
  font-weight: var(--font-weight-medium);
}

[data-component="markdown"] p {
  margin-top: 0;
  margin-bottom: 12px;
}

[data-component="markdown"] a {
  color: var(--text-interactive-base);
  text-decoration: none;
  font-weight: inherit;
}

[data-component="markdown"] a:hover {
  text-decoration: underline;
  text-underline-offset: 2px;
}

[data-component="markdown"] ul,
[data-component="markdown"] ol {
  margin-top: 8px;
  margin-bottom: 12px;
  margin-left: 0;
  list-style-position: outside;
}

[data-component="markdown"] ul {
  padding-left: 32px;
  list-style-type: disc;
}

[data-component="markdown"] ol {
  padding-left: 2.25rem;
  list-style-type: decimal;
}

[data-component="markdown"] li {
  margin-bottom: 8px;
}

[data-component="markdown"] li > p:first-child {
  display: inline;
  margin: 0;
}

[data-component="markdown"] li > p + p {
  display: block;
  margin-top: 0.5rem;
}

[data-component="markdown"] li::marker {
  color: var(--text-weak);
}

[data-component="markdown"] li > ul,
[data-component="markdown"] li > ol {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
  padding-left: 1rem;
}

[data-component="markdown"] li > ol {
  padding-left: 1.75rem;
}

[data-component="markdown"] li:has(> input[type="checkbox"]) {
  list-style: none;
}

[data-component="markdown"] input[type="checkbox"] {
  margin: 0 0.5em 0 0;
}

[data-component="markdown"] blockquote {
  margin: 1.5rem 0;
  padding-left: 0.5rem;
  color: var(--text-weak);
  font-style: normal;
  border-left: 2px solid var(--border-weak-base);
}

[data-component="markdown"] blockquote > :first-child {
  margin-top: 0;
}

[data-component="markdown"] blockquote > :last-child {
  margin-bottom: 0;
}

[data-component="markdown"] hr {
  height: 0;
  margin: 40px 0;
  border: none;
}

[data-component="markdown"] pre {
  margin-top: 12px;
  margin-bottom: 32px;
  overflow: auto;
  scrollbar-width: none;
}

[data-component="markdown"] pre::-webkit-scrollbar {
  display: none;
}

[data-component="markdown"] .shiki {
  padding: 12px;
  border: 0.5px solid var(--border-weak-base);
  border-radius: 6px;
  font-size: 13px;
  line-height: var(--line-height-large);
}

[data-component="markdown"] pre code {
  font-family: var(--font-family-mono);
  font-feature-settings: var(--font-family-mono--font-feature-settings);
}

[data-component="markdown"] :not(pre) > code {
  color: var(--syntax-string);
  font-family: var(--font-family-mono);
  font-feature-settings: var(--font-family-mono--font-feature-settings);
  font-weight: var(--font-weight-medium);
}

[data-component="markdown"] table {
  display: block;
  width: 100%;
  margin: 24px 0;
  overflow-x: auto;
  border-collapse: collapse;
  font-size: var(--font-size-base);
}

[data-component="markdown"] th,
[data-component="markdown"] td {
  padding: 12px;
  border-bottom: 1px solid var(--border-weaker-base);
  text-align: left;
  vertical-align: top;
}

[data-component="markdown"] th {
  color: var(--text-strong);
  font-weight: var(--font-weight-medium);
  border-bottom: 1px solid var(--border-weak-base);
}

[data-component="markdown"] img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 1.5rem 0;
  border-radius: 4px;
}

[data-component="markdown"] .katex {
  font-size: 0.96em;
}

[data-component="markdown"] .katex-display {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.25em 0 0.5em;
}

[data-component="markdown"] .katex-error {
  color: var(--syntax-critical);
}

[data-component="markdown"] summary {
  cursor: pointer;
}

[data-component="markdown"] a.external-link:hover > code {
  text-decoration: underline;
  text-underline-offset: 2px;
}

::selection {
  background: var(--selection);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background-base: #101010;
    --background-stronger: #151515;
    --text-strong: #ededed;
    --text-base: #a0a0a0;
    --text-weak: #707070;
    --text-weaker: #505050;
    --text-interactive-base: #9dbefe;
    --border-weak-base: #282828;
    --border-weaker-base: #232323;
    --surface-base: #1c1c1c;
    --surface-raised-base: #232323;
    --syntax-comment: #8f8f8f;
    --syntax-regexp: var(--text-base);
    --syntax-string: #00ceb9;
    --syntax-keyword: #edb2f1;
    --syntax-primitive: #8cb0ff;
    --syntax-operator: var(--text-weak);
    --syntax-variable: var(--text-strong);
    --syntax-property: #fab283;
    --syntax-type: #fcd53a;
    --syntax-constant: #93e9f6;
    --syntax-punctuation: var(--text-weak);
    --syntax-object: var(--text-strong);
    --syntax-critical: #fab283;
    --syntax-info: #93e9f6;
    --selection: rgba(157, 190, 254, 0.2);
  }
}

@media (max-width: 720px) {
  body {
    padding: 28px 16px 56px;
  }
}
`

const SHIKI_DARK_CSS = `
@media (prefers-color-scheme: dark) {
  .shiki,
  .shiki span {
    color: var(--shiki-dark) !important;
    background-color: var(--shiki-dark-bg) !important;
    font-style: var(--shiki-dark-font-style) !important;
    font-weight: var(--shiki-dark-font-weight) !important;
    text-decoration: var(--shiki-dark-text-decoration) !important;
  }
}
`

const OPENCODE_LIGHT_THEME: ThemeRegistrationRaw = {
  name: "opencode-light",
  type: "light",
  colors: {
    "editor.background": "#f8f8f8",
    "editor.foreground": "#6f6f6f",
  },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment", "string.comment"], settings: { foreground: "#7a7a7a", fontStyle: "italic" } },
    { scope: ["entity.other.attribute-name", "meta.property-name"], settings: { foreground: "#a753ae" } },
    { scope: ["constant", "entity.name.constant", "variable.other.constant", "variable.language", "entity"], settings: { foreground: "#007b80" } },
    { scope: ["entity.name", "meta.export.default", "meta.definition.variable", "support.class.component", "support.type.primitive"], settings: { foreground: "#8a6f00" } },
    { scope: ["keyword", "storage", "storage.type"], settings: { foreground: "#a753ae" } },
    { scope: ["keyword.operator", "storage.type.function.arrow", "punctuation.separator.key-value.css"], settings: { foreground: "#6f6f6f" } },
    { scope: ["string", "punctuation.definition.string", "entity.name.tag"], settings: { foreground: "#00ceb9" } },
    { scope: ["support", "entity.name.function", "support.type.object.module", "variable.other.object"], settings: { foreground: "#034cff" } },
    { scope: ["variable", "variable.other"], settings: { foreground: "#171717" } },
    { scope: ["invalid", "message.error", "markup.deleted"], settings: { foreground: "#ff8c00" } },
    { scope: ["markup.heading", "markup.heading entity.name"], settings: { foreground: "#0092a8", fontStyle: "bold" } },
    { scope: "markup.quote", settings: { foreground: "#0092a8" } },
    { scope: "markup.italic", settings: { fontStyle: "italic" } },
    { scope: "markup.bold", settings: { foreground: "#171717", fontStyle: "bold" } },
  ],
}

const OPENCODE_DARK_THEME: ThemeRegistrationRaw = {
  name: "opencode-dark",
  type: "dark",
  colors: {
    "editor.background": "#1c1c1c",
    "editor.foreground": "#a0a0a0",
  },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment", "string.comment"], settings: { foreground: "#8f8f8f", fontStyle: "italic" } },
    { scope: ["entity.other.attribute-name", "meta.property-name"], settings: { foreground: "#fab283" } },
    { scope: ["constant", "entity.name.constant", "variable.other.constant", "variable.language", "entity"], settings: { foreground: "#93e9f6" } },
    { scope: ["entity.name", "meta.export.default", "meta.definition.variable", "support.class.component", "support.type.primitive"], settings: { foreground: "#fcd53a" } },
    { scope: ["keyword", "storage", "storage.type"], settings: { foreground: "#edb2f1" } },
    { scope: ["keyword.operator", "storage.type.function.arrow", "punctuation.separator.key-value.css"], settings: { foreground: "#707070" } },
    { scope: ["string", "punctuation.definition.string", "entity.name.tag"], settings: { foreground: "#00ceb9" } },
    { scope: ["support", "entity.name.function", "support.type.object.module", "variable.other.object"], settings: { foreground: "#8cb0ff" } },
    { scope: ["variable", "variable.other"], settings: { foreground: "#ededed" } },
    { scope: ["invalid", "message.error", "markup.deleted"], settings: { foreground: "#fab283" } },
    { scope: ["markup.heading", "markup.heading entity.name"], settings: { foreground: "#93e9f6", fontStyle: "bold" } },
    { scope: "markup.quote", settings: { foreground: "#93e9f6" } },
    { scope: "markup.italic", settings: { fontStyle: "italic" } },
    { scope: "markup.bold", settings: { foreground: "#ededed", fontStyle: "bold" } },
  ],
}

function printHelp() {
  process.stdout.write(
    `Usage: bun run markdown-to-html.ts [--title <title>] [--theme opencode|github] < input.md > output.html\n`,
  )
}

function usageError(message: string): never {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}

function parseArgs(argv: string[]): Options {
  const options: Options = { theme: "opencode" }

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
      if (value !== "opencode" && value !== "github") usageError(`Unknown theme: ${value}`)
      options.theme = value
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
    const titleMatch = tag.match(/title=(["'])(.*?)\1/)
    if (!titleMatch) continue
    messages.push(decodeHtmlEntities(titleMatch[2]))
  }

  return messages
}

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

function buildKatexStylesheet() {
  return readFileSync(KATEX_CSS_PATH, "utf8").replace(/src:url\((fonts\/[^)]+?\.woff2)\) format\("woff2"\)(?:,url\([^)]+\) format\("woff"\),url\([^)]+\) format\("truetype"\))?/g, (_, fontPath: string) => {
    const font = readFileSync(path.join(KATEX_FONTS_DIR, path.basename(fontPath))).toString("base64")
    return `src:url(data:font/woff2;base64,${font}) format("woff2")`
  })
}

function buildStylesheet(theme: Theme) {
  return [buildKatexStylesheet(), theme === "opencode" ? OPENCODE_CSS : GITHUB_CSS, SHIKI_DARK_CSS]
    .join("\n")
    .trim()
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
    '  <main data-component="markdown">',
    body.trim(),
    "  </main>",
    "</body>",
    "</html>",
  ].join("\n")
}

function normalizeLanguage(language: string | undefined) {
  const value = language?.trim().split(/\s+/)[0] || "text"
  return value in bundledLanguages ? (value as BundledLanguage) : "text"
}

function shikiThemes(theme: Theme) {
  if (theme === "github") {
    return { light: "github-light", dark: "github-dark" } as const
  }

  return { light: OPENCODE_LIGHT_THEME, dark: OPENCODE_DARK_THEME } as const
}

async function highlightCode(code: string, language: string | undefined, theme: Theme) {
  return await codeToHtml(code, {
    lang: normalizeLanguage(language),
    themes: shikiThemes(theme),
    defaultColor: "light",
  })
}

function buildMarkdownEngine(theme: Theme) {
  const marked = new Marked({
    async: true,
    gfm: true,
    breaks: false,
  })

  marked.use(
    {
      async: true,
      async walkTokens(token) {
        if (token.type !== "code") return
        const codeToken = token as typeof token & { text: string; lang?: string; html?: string }
        codeToken.html = await highlightCode(codeToken.text, codeToken.lang, theme)
      },
      renderer: {
        link({ href, title, tokens }) {
          const titleAttr = title ? ` title="${escapeHtml(title)}"` : ""
          const text = this.parser.parseInline(tokens)
          return `<a href="${escapeHtml(href)}"${titleAttr} class="external-link" target="_blank" rel="noopener noreferrer">${text}</a>`
        },
        code(token) {
          const codeToken = token as typeof token & { html?: string }
          return codeToken.html ?? `<pre><code>${escapeHtml(token.text)}</code></pre>`
        },
      },
    },
    markedKatex({
      throwOnError: false,
      nonStandard: true,
    }),
  )

  return marked
}

async function collectAbsoluteAssetFiles(html: string) {
  const files: Record<string, Uint8Array> = {}
  let index = 0
  const matches = Array.from(html.matchAll(/\b(src|poster)=(["'])((?:file:\/\/\/|\/)[^"']+)\2/g))
  let rewritten = html

  for (const match of matches) {
    const [fullMatch, attr, quote, rawPath] = match

    const assetPath = rawPath.startsWith("file:///")
      ? decodeURIComponent(rawPath.slice(7))
      : rawPath

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

async function renderMarkdown(source: string, theme: Theme) {
  const marked = buildMarkdownEngine(theme)
  const body = await marked.parse(source)
  const embeddedKatexErrors = extractKatexErrors(body)

  if (embeddedKatexErrors.length > 0) {
    throw new Error(embeddedKatexErrors.join("\n\n") || "KaTeX rendering failed")
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
    minify: true,
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
  const body = await renderMarkdown(source, options.theme)
  const html = buildDocument(body, title)
  const css = buildStylesheet(options.theme)
  const bundled = await bundleStandalone(html, css)

  process.stdout.write(`${bundled}\n`)
}

await main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
})
