# Use WXT as the extension build framework

**Status:** accepted. Supersedes ADR 0002.

We left Plasmo for two reasons: it was discontinued (it is no longer maintained, with no release since 0.90.5 on 2025-05-17), and it caused build problems. It runs on Parcel 2.9. On this machine (glibc 2.44) its Parcel native addons abort at dev shutdown with heap corruption ("double free"), which corrupts the lmdb cache and makes the next `pnpm build` fail (PlasmoHQ/plasmo#1060). We moved to WXT, which is Vite-based and actively maintained. WXT itself needs no install script beyond `esbuild`, so the lmdb, `@swc/core`, `msgpackr-extract` and `sharp` native addons are gone. `@parcel/watcher` stays installed only because sass (through vite and vitest) depends on it; its build script is switched off in `pnpm-workspace.yaml`.

ADR 0002's reason for using a framework still holds: WXT generates the manifest from code and handles the MV3 service-worker reload loop, which a bare Vite setup would leave to us.

**Considered options.** Plain Vite (every manifest and entrypoint task by hand, the cost ADR 0002 avoided) and CRXJS. Neither was chosen.

**What changed in the code.**

- Surfaces are WXT entrypoints in `src/entrypoints/`: `background.ts`, `popup/`, `gallery/` and `design-system/`. The gallery and design-system pages are `unlisted` pages (`<meta name="manifest.type" content="unlisted">`).
- Build output goes to `.output/chrome-mv3/`; `pnpm dev` runs `wxt`.
- The manifest `key` is set only in production builds (`wxt.config.ts`). An installed copy keeps one stable extension ID, while dev builds get their own path-based ID and their own data.
- The design-system page is dropped from production builds by an `entrypoints:resolved` hook in `wxt.config.ts`, because WXT filters entrypoints by browser, not by mode.
- Vite stays on 6 because `@wxt-dev/module-react` accepts `@vitejs/plugin-react` 4, 5 or 6, and plugin-react 6 needs Vite 8. Vitest stays as it is (ADR 0004).
