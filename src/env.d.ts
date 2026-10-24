// Vite resolves `?url` imports to the emitted asset URL (for CSS: the
// PostCSS/Tailwind-compiled file). Used by src/entrypoints/popup/css-swap.ts.
declare module "*.css?url" {
  const url: string
  export default url
}
