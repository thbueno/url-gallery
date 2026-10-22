# BoardUI-based visual language: Board Blue, Inter, Soft radius, neutral tags

**Status:** accepted. Refines ADR 0005 and keeps ADR 0007.

The gallery drifted into a green-tinted palette (DM Sans loaded from Google Fonts, a purple destructive colour, coloured tag hues). A throwaway prototype of a BoardUI-style restyle was validated with the owner and replaces it. The decisions:

**Board Blue palette.** Neutral greys carry the UI and there is exactly one accent, a saturated blue (`221.30 97.47% 53.53%`). Cards and the sidebar are grey "section" surfaces on a white page (near-black in dark mode). Controls get a 1px border plus a tiny shadow. The only filled gradient in the app is the primary button, from `216.23 100% 58.43%` to the primary blue. Light and dark values live side by side in `src/style.css`. Muted text was darkened slightly from the prototype (light 40% lightness, dark 58%) so it reaches 4.5:1 on both the background and the section surface in both modes.

**Inter and JetBrains Mono, bundled locally.** Fonts come from the `@fontsource-variable/*` npm packages and are imported in `src/style.css`, so the extension makes no remote font request and works offline. This replaces the Google Fonts `@import` for DM Sans.

**Soft radius.** One base value, `--radius: 14px`, and every other step derives from it: sm = 0.6r, lg = 1.35r, xl = 1.75r, card = 1.5r, inner = max(0, 1.5r − 6px). Changing the feel of the whole app is a one-line edit.

**One neutral tag style.** Every tag, including "Uncategorized", uses the `--tag-bg` fill with foreground text. No hue, no coloured dots. Exposed as the `tag` variant of `Badge`.

**One accent.** Anything that needs emphasis uses the blue; status and category are never conveyed by extra hues.

**Relation to earlier ADRs.**

- ADR 0005 (shadcn New York + Zinc) still holds: the style is still New York and the greys are neutral again. The green hues that crept in are removed.
- ADR 0007 (single-source tokens) is unchanged: all new tokens (surfaces, tag background, gradient stops, shadow scale xs/sm/md/lg/pop/primary, `--radius-inner`) are CSS custom properties in `src/style.css`, wired into Tailwind from there, and shown on the dev-only design-system page.
