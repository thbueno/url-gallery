# Design system: single-source tokens, dev-only catalogue, modular components

**Status:** accepted

The UI must be retunable from one place and verifiable in one place. Three coupled decisions:

**Single source of truth.** All design tokens — color palette, font family, font-size scale, border radius — are CSS custom properties in `src/style.css`. Components consume them via Tailwind utilities or `var(--token)`; none hardcodes a hex, size, or radius. Changing the whole app's look is a one-file edit. This holds under both Tailwind v3 (vars in CSS) and v4 (`@theme` block) — the rule is stated in terms of tokens, not a specific config mechanism.

**Dev-only design-system page.** `src/tabs/design-system.tsx` is a Plasmo tab route rendering every component against live tokens. MV3 has no auth, so "developer-only" means: gated on `process.env.NODE_ENV === 'development'` and unlinked from every user surface. It is a mirror of real components, never a second definition of styles or tokens.

**Component modularity.** Components are repositionable, restylable, and reparentable: parents own outer layout (position, margin, placement); children own only internal composition; variants flow through `props` + `cva`; no component assumes a specific parent. Outer-layout classes pass in via `className` + `cn()`.

Consequence: adding or changing a primitive requires three things in the same change — the token (if new) in `src/style.css`, the component consuming tokens without hardcoded values, and its entry on the design-system page.
