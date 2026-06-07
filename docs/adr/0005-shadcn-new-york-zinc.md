# shadcn/ui style: New York + Zinc

**Status:** accepted

shadcn/ui style and base color tokens are baked into every generated component at init time; changing them later requires regenerating the entire component set.

New York style chosen over Default: denser spacing, sharper borders, more native-feeling UI — appropriate for a browser extension that should feel like part of the browser rather than a web app. Default style's looser spacing wastes real estate in a dense thumbnail grid.

Zinc base color chosen over Slate or Stone: neutral grey palette with no hue bias, so it recedes behind the gallery's thumbnail images rather than fighting them. Slate has a blue tint; Stone has a warm tint — both introduce color tension against arbitrary thumbnail content.

Component path: `src/components/ui/`. Radius: `0.5rem`.
