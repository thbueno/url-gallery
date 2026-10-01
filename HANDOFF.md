# Handoff: url-gallery — plasmo dev crash + pnpm/node cleanup

Session: ses_f2d1df235ffeL52J1UwJqkku4Y (OpenCode, GLM-5.3-Flash)
Date: 2026-09-24
Project: `/home/ghosthands/mission-control/url-gallery` (Plasmo 0.90.5 browser extension, React 18, Tailwind 3, pnpm)

## What was fixed (done — no action needed)

1. **`plasmo: command not found` / missing `node_modules`**
   - Root cause: `/home/ghosthands/pnpm-workspace.yaml` (stray, contained only an `allowBuilds` entry) made pnpm v11 treat the home dir as a workspace boundary. `pnpm install` in the project was a silent no-op ("Already up to date") and never created `node_modules`.
   - Fix: moved the file to `/tmp/opencode/home-pnpm-workspace.yaml.bak` (delete when safe), added project `pnpm-workspace.yaml`, ran `pnpm install`.
2. **pnpm v11 settings location**: `pnpm.onlyBuiltDependencies` in `package.json` is ignored by pnpm v11+ — settings belong in `pnpm-workspace.yaml` (`allowBuilds:` keys). Current file has `allowBuilds:` for the 8 native deps; do not duplicate `onlyBuiltDependencies`.
3. **Stale pnpm/node installs (user-requested clean pass)**
   - Arch package `pnpm 11.3.0-1` was removed via `pkexec pacman -R pnpm` (files had also been touched by an `npm uninstall -g`).
   - pnpm 12.6.0 installed via official installer at `~/.local/share/pnpm` (path added to `~/.bashrc`).
   - node reinstalled via mise (`mise uninstall/install node@26.8.2`); global default is still 26.8.2 in `~/.config/mise/config.toml`.
   - Project pins node via newly created `mise.toml` (`node = "22.6.0"`).
   - Native dep build scripts approved via `pnpm approve-builds --all`.
   - node_modules was rebuilt from scratch (`rm -rf node_modules; pnpm install`) — clean.

4. **Note**: `package.json` was also pinned/left unchanged except a transient `pnpm.overrides` attempt that was reverted. git diff may show only `pnpm-workspace.yaml` + `mise.toml` as new files.

## The remaining problem (unsolved)

`plasmo dev` crashes with glibc heap corruption (“double free or corruption (out|!prev|fasttop)” / “corrupted size vs. prev_size”) → SIGABRT after a variable delay (10s–60s+), apparently **when HMR/watcher reacts to file changes**. Initial build succeeds (“Extension re-packaged in ~10s 🚀”). `plasmo build` works fine.

### Evidence collected
- Crashing process = plasmo's own node process (core-dump confirmed, e.g. Executable: mise node, cmdline `node .../plasmo/dist/index.js dev`).
- In crash cores, the loaded N-API addons (candidates): lmdb 2.7.11 (and once 3.5.6 with a pnpm override that did NOT fix it), msgpackr-extract 3.0.4, @parcel/watcher 2.5.1, @parcel/fs-search 2.9.3, @parcel/hash 2.8.3/2.9.3, @parcel/node-resolver-core 3.0.3, @parcel/optimizer-image 2.9.3 (sharp-linux-x64 0.33.5), @parcel/source-map, @parcel/transformer-js (parcel-swc), swc 1.3.96, lightningcss 1.32.0 — all bundled sizes from parcel 2.9.3, dated Feb 2023.
- Crashes reproduce with and without pnpm (direct `node .../plasmo/dist/index.js dev`), on node 26.8.2, 22.21.1, 22.6.0, 20.19.5. So: NOT pnpm, NOT node version.
- glibc is 2.44 (Arch, current). Old C++ in these addons may violate allocator rules exposed by newer glibc/V8 malloc behavior.
- Matches open upstream bugs: **PlasmoHQ/plasmo#1060** (https://github.com/PlasmoHQ/plasmo/issues/1060) and **nodejs/node#55145** (https://github.com/nodejs/node/issues/55145, closed not-planned). Plasmo has not released since 0.90.5; dist-tags: latest 0.90.5, lab 0.65.4-lab.0. Effectively unmaintained.
- `react-grab` (devDep, dynamic import in `src/tabs/gallery.tsx:4`) is only bundled into the extension runtime — unlikely involved, never disproven.
- pnpm overrides for `lmdb ^3.5.6` were tried and reverted (no effect).

### Repro snippet (from a shell with node on PATH)
```bash
PLASMO = "<project>/node_modules/.pnpm/plasmo@0.90.5_*/node_modules/plasmo/dist/index.js"
node "$PLASMO" dev &
sleep 30; touch src/popup.html; touch src/field/*.tsx   # ≈30–60s after touch → SIGABRT
```
A plain `pnpm dev` also reproduces. An initial build runs fine; the crash hits on/around rebuilds.

### Diagnostics tooling used (available again if needed)
- `coredumpctl list / dump <pid> --output=<file>` then `gdb -q <node> <core> -ex 'info shared'` (lacks symbols; `info shared` still lists .node addon paths — most useful).
- `journalctl --since '<time>' | grep coredump` for the crashing PID && cmdline.
- `strace -f -e trace=openat -o log node "$PLASMO" dev` (strace installed via `pkexec omarchy pkg add strace`).
- Leftover files: `/tmp/opencode/dev*.log`, `/tmp/opencode/strace.log`, `/tmp/opencode/g*.txt`, `/tmp/opencode/plasmo-min/` (unfinished minimal repro — `plasmo init` invocation cut off).

## Suggested next steps (for the continuing session)

1. **Finish the minimal repro** (`/tmp/opencode/plasmo-min`): `plasmo init --npm`, then run dev until crash on this machine to split “project-specific” vs “environment-wide”.
2. **If project-specific**: bisect the project (minimal src? drop `react-grab`, remove `@dnd-kit`, `re-render` loops, etc.) or check `src/*/hooks` for changes at runtime. A `mkdir`/symlink-based watcher spam or huge file count could trigger the parcel-cache (lmdb) heap bug.
3. **If environment-wide**: file upstream (plasmo#1060 is the existing tracker) and either pin an old working combo (e.g. node 22.6 — currently DOES crash on HMR, so unlikely) or move to WXT:
   - WXT (https://wxt.dev) is the actively-supported Plasmo alternative; migration effort is medium (manifest config, entrypoint convention, HMR works).
4. **Pragmatic interim workflow** (works today): `pnpm build` → load `build/chrome-mv3-prod` unpacked → manual reload after changes. Optionally wire a tiny `pnpm build && cp -r build/chrome-mv3-prod build/prod-live` refresh alias.

## Suggested skills
- `diagnose-crash` — already loaded in that session; use coredumpctl+gdb workflow for any further core analysis (base dir `/home/ghosthands/.claude/skills/diagnose-crash`).
- `omarchy` — for system-level install/privilege rules on this machine (`pkexec` for package ops without a visible terminal; `omarchy pkg add <pkg>` matches the distro conventions used here).
- `grill-me` / `grilling` — if user wants to stress-test the WXT-migration plan.
- `ponytail---ponytail` is not needed here; prefer `tdd` if WXT migration starts fresh with tests.
- `handoff` — regenerate this doc if context changes materially.

## Notes / gotchas
- `pkexec` pops a GUI polkit prompt and requires user interaction — worked for `pacman -R pnpm` and `omarchy pkg add strace`; plain `sudo` without a terminal fails.
- pnpm: `~/.local/share/pnpm/bin` is not on non-intered shells' PATH; export it before calling pnpm in agent shells.
- Stack race warnings in journal relate to `systemd-coredump` only; no host obliterates.
- `src/popup.html` is **generated** by `scripts/generate-popup-html.mjs` on every dev/build — don't hand-edit.
- `mise.toml` now pins node 22.6.0 in this project. If migration to WXT works, consider removing the pin and going back to a modern node.
- `/tmp/opencode` is this workspace's approved scratch dir — keep dumps/cores there, and do not leave cores lying around.
