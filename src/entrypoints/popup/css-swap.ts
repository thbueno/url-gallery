// Loads the shared stylesheet without blocking the popup's first paint: the
// <link> is added with media="print" (fetched at low priority, not applied),
// then flipped to media="all" once it finishes loading - the standard
// "loadCSS" async-stylesheet pattern. Created from JS because Vite does not
// run a media="print" <link> in HTML through PostCSS/Tailwind; importing the
// stylesheet with `?url` does, so the emitted asset is compiled CSS.
//
// A module (not an inline script / onload="" attribute) is required because
// MV3 extension pages ship a strict CSP (script-src 'self').
import cssUrl from "@/style.css?url"

const link = document.createElement("link")
link.id = "popup-css"
link.rel = "stylesheet"
link.media = "print"
link.addEventListener(
  "load",
  () => {
    link.media = "all"
  },
  { once: true }
)
link.href = cssUrl
document.head.append(link)
