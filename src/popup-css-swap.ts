// Swaps the popup's stylesheet <link> from media="print" (non-render-blocking
// while it loads) to media="all" (applied) once it finishes loading — the
// standard "loadCSS" async-stylesheet pattern.
//
// This lives in its own external file, referenced via <script src="...">
// from src/popup.html, because MV3 extension pages ship a strict CSP
// (script-src 'self') that blocks BOTH inline <script> bodies and inline
// event-handler attributes (onload="..."). An external same-origin script is
// the only CSP-compliant way to run this.
const link = document.getElementById("__plasmo_popup_css") as HTMLLinkElement | null

if (link) {
  if (link.sheet) {
    // Already loaded (e.g. from cache) by the time this script runs.
    link.media = "all"
  } else {
    link.addEventListener(
      "load",
      () => {
        link.media = "all"
      },
      { once: true }
    )
  }
}
