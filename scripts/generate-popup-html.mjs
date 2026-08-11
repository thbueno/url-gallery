// Generates src/popup.html (the Plasmo-recognized custom popup HTML template,
// see popupHtmlList resolution in node_modules/plasmo/dist/index.js) before
// every build/dev run.
//
// ADR 0007 requires all design tokens to live in src/style.css and nowhere
// else. This script does NOT hardcode any token value — it parses the real
// `:root { ... }` and dark-mode `:root { ... }` custom-property blocks out of
// src/style.css and inlines exactly those declarations into the generated
// popup.html's <style> tag. Everything else in the inline <style> block is
// layout-only (widths/heights/spacing) and references those same
// `var(--token)` names, never a literal color/size value.
//
// This lets the popup paint a static skeleton (header row + save button
// shape) synchronously from HTML+inline-CSS, before the ~187KB popup JS
// bundle and the shared Tailwind stylesheet finish loading.
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const styleCssPath = resolve(root, "src/style.css")
const outPath = resolve(root, "src/popup.html")

const css = readFileSync(styleCssPath, "utf8")

/**
 * Extracts the contents of the next top-level `:root { ... }` block found at
 * or after `fromIndex`, using brace-depth counting so it's robust to comments
 * and nested values (e.g. linear-gradient(...)) inside the block.
 */
function extractRootBlock(source, fromIndex) {
  const rootStart = source.indexOf(":root", fromIndex)
  if (rootStart === -1) {
    throw new Error("generate-popup-html: could not find a `:root` block in src/style.css")
  }
  const braceStart = source.indexOf("{", rootStart)
  let depth = 0
  let i = braceStart
  for (; i < source.length; i++) {
    if (source[i] === "{") depth++
    else if (source[i] === "}") {
      depth--
      if (depth === 0) break
    }
  }
  if (depth !== 0) {
    throw new Error("generate-popup-html: unbalanced braces while parsing `:root` block")
  }
  return { content: source.slice(braceStart + 1, i), endIndex: i + 1 }
}

const lightRoot = extractRootBlock(css, 0)
const darkRoot = extractRootBlock(css, lightRoot.endIndex)

const criticalTokens = `:root {${lightRoot.content}}

  @media (prefers-color-scheme: dark) {
    :root {${darkRoot.content}}
  }`

// Layout-only rules for the popup's above-the-fold skeleton. Sizes/spacing
// mirror the real Tailwind classes used in src/popup.tsx's first frame
// (w-[300px] flex flex-col gap-3 p-4 header row + h-9 primary button), but
// every color/radius/font value is a var(--token) defined above — never a
// literal duplicated from style.css.
const skeletonLayoutCss = `
  #__plasmo_skeleton {
    box-sizing: border-box;
    width: 300px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  #__plasmo_skeleton * {
    box-sizing: border-box;
  }
  #__plasmo_skeleton .sk-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  #__plasmo_skeleton .sk-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: hsl(var(--foreground));
  }
  #__plasmo_skeleton .sk-icon-btn {
    height: 1.75rem;
    width: 1.75rem;
    border-radius: calc(var(--radius) - 2px);
  }
  #__plasmo_skeleton .sk-separator {
    height: 1px;
    width: 100%;
    background-color: hsl(var(--border));
  }
  #__plasmo_skeleton .sk-button {
    height: 2.25rem;
    width: 100%;
    border-radius: calc(var(--radius) - 2px);
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-sm);
    font-weight: 500;
  }`

const html = `<!DOCTYPE html>
<html>
  <head>
    <title>__plasmo_static_index_title__</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!--
      Loads the SAME src/style.css every other Plasmo surface imports (ADR
      0007 — no forked/second stylesheet). The only thing non-standard here
      is the loading *strategy*: media="print" makes it non-render-blocking,
      then popup-css-swap.ts applies it as soon as it arrives, so the popup's
      inline-CSS skeleton (below) can paint immediately instead of waiting on
      this ~32KB shared stylesheet to fetch+parse first. The swap can't be a
      plain onload="" attribute (the usual loadCSS pattern) because MV3's
      extension-page CSP (script-src 'self') blocks inline event handlers —
      see popup-css-swap.ts.
    -->
    <link id="__plasmo_popup_css" rel="stylesheet" href="../src/style.css" media="print" />
    <script src="../src/popup-css-swap.ts"></script>
    <noscript><link rel="stylesheet" href="../src/style.css" /></noscript>
    <style id="__plasmo_critical_css">
      /* AUTO-GENERATED by scripts/generate-popup-html.mjs — do not hand-edit.
         Token values below are parsed from src/style.css (ADR 0007 single
         source of truth); this file is a derived build artifact, not a
         second stylesheet. Re-run \`pnpm run build\` or \`pnpm run dev\` to
         regenerate after editing src/style.css. */
      ${criticalTokens}
${skeletonLayoutCss}
      body {
        margin: 0;
        background-color: hsl(var(--background));
        color: hsl(var(--foreground));
      }
    </style>
  </head>

  <body>
    <div id="__plasmo_skeleton" aria-hidden="true">
      <div class="sk-header">
        <span class="sk-title">URL Gallery</span>
        <div class="sk-icon-btn"></div>
      </div>
      <div class="sk-separator"></div>
      <div class="sk-button">Save this tab</div>
    </div>
  </body>
</html>
`

writeFileSync(outPath, html, "utf8")
console.log(`[generate-popup-html] wrote ${outPath}`)
