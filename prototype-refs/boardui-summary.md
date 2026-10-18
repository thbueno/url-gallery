# BoardUI design-token summary

Source: Artifact `https://claude.ai/artifact/X3nCQEnXu32rS3sphTUBtQ` (type "Design System", version 1792215631-3d24, owned by the user, read-only). Values below are copied from `project/tokens.json` in that artifact, synced 2026-10-16 from the BoardUI GitHub repo (`styles/theme.css`, `styles/typography.css`, `styles/globals.css`, Tailwind 4.1.11 palette).

Note on the saved page: `boardui.html` is the Design System viewer shell (the type's runtime, 32 KB). Its only embedded font is the viewer's own "Anthropic Sans"; it contains no BoardUI tokens. All BoardUI values come from the project files listed above.

## 1. Colour

Two themes: `light` (default, first) and `dark`. Dark mode is the `.dark` class in source (`[data-theme="dark"]` in the export). Semantic tokens are meant for UI use; primitives exist to be aliased. Accent ramp is blue, aliased to `color-blue-*`.

### 1a. Primitive palette (raw values)

- **Neutral (achromatic, oklch)**: 50 `oklch(0.985 0 0)`, 100 `#f7f7f7`, 200 `#ebebeb`, 300 `oklch(0.87 0 0)`, 400 `oklch(0.708 0 0)`, 500 `oklch(0.556 0 0)`, 600 `oklch(0.439 0 0)`, 700 `oklch(0.371 0 0)`, 800 `oklch(0.269 0 0)`, 900 `oklch(0.205 0 0)`, 925 `#121212`, 950 `oklch(0.145 0 0)`.
- **Base**: white `#ffffff`, black `#000000`.
- **Blue (accent)**: 50 `oklch(0.97 0.014 254.604)`, 100 `oklch(0.932 0.032 255.585)`, 200 `oklch(0.882 0.059 254.128)`, 300 `oklch(0.809 0.105 251.813)`, 400 `#3392ff`, 500 `oklch(0.623 0.214 259.815)`, 600 `oklch(0.546 0.245 262.881)`, 700 `oklch(0.488 0.243 264.376)`, 800 `oklch(0.424 0.199 265.638)`, 900 `oklch(0.379 0.146 265.522)`, 950 `oklch(0.282 0.091 267.935)`.
- **Red**: 100–600, 900, 950 (e.g. 500 `oklch(0.637 0.237 25.331)`, 600 `oklch(0.577 0.245 27.325)`).
- **Rose**: 100, 200, 300, 500, 600, 800 (e.g. 500 `oklch(0.645 0.246 16.439)`).
- **Orange**: 200, 300, 500, 800. **Amber**: 400. **Yellow**: 200, 300, 400, 500, 800. **Lime**: 100–800, 950. **Green**: 100, 500. **Emerald**: 100, 300, 400, 500, 700, 800, 950. **Teal**: 400, 500. **Cyan**: 200, 400, 800. **Sky**: 400, 500. **Indigo**: 100–500, 800. **Violet**: 200, 400–800, 950. **Purple**: 50, 100, 300–800, 950. **Pink**: 100–500, 700, 950. **Slate** 200 `#ebeff5`. **Zinc** 800 `oklch(0.274 0.006 286.033)`.

Full values for every primitive are in `tokens.json`; the table in section 1c resolves them.

### 1b. Semantic roles (light → dark)

- **Ground**: page `color-background-full` `#ffffff` → `#121212`. Ticket detail surface the same pair.
- **Surfaces** (`background-*`): secondary-default (cards, sidebar, columns), primary-default (buttons, menus, tickets), inner-default (tiles inside cards), tertiary-default (inputs, search pill, neutral chips), plus hover, active, disabled and error variants. All are aliases of the neutral and white ramps. Full list in section 1c.
- **Text**: primary `neutral-950` → `neutral-50`; secondary `neutral-500` (both themes); tertiary `neutral-400` → `neutral-600`; disabled `neutral-300` → `neutral-800`; placeholder `neutral-400`; error `red-500` → `red-400`; destructive `#ab1016` → `#df3a42`; white text.
- **Icons**: primary `neutral-950` → `neutral-50`; secondary `neutral-500`; tertiary `neutral-400` → `neutral-600`; quaternary `neutral-300` → `neutral-700`; hover `black` → `white`; error `red-600` → `red-400`.
- **Lines**: `border-button-default` (controls, popovers), `separator-border` (row dividers), `border-table`, `border-focus-ring` = accent-500.
- **Accent**: `accent-50 … 950` alias blue. Used in gradients (below), selected tabs (`accent-600`), links, focus ring, checked controls.
- **Status chips**: pairs `status-<hue>-background` and `status-<hue>-text` for lime (good/up), rose (bad/down), yellow (waiting/medium), orange (high), blue (low/info), cyan, purple, neutral, gray. Status dot halos use `green-500`, `yellow-500`, `indigo-500`.
- **Notifications**: `notification-information-*`, `notification-success-*`, `notification-error-*`.
- **Charts**: `chart-1 … chart-9` (teal, lime, pink, sky, purple, blue, emerald, yellow, indigo), each with an `-active` darker hover; plus `chart-track`, `chart-cursor`, `chart-neutral`, `chart-agents-bar`.
- **Other tokens**: ticket priority surfaces (low indigo, medium yellow, high orange, urgent rose, each with a hover tint), kbd, badge-new, theme-toggle, sidebar-profile-hover, kanban, pill-tab-blue, segmented-control, switch chips, and similar.

Dark mode: background goes to `#121212` (`neutral-925`); cards and surfaces move up the neutral ramp; blacks in shadows get heavier. The semantic token table is the same shape in both themes.

### 1c. Full resolved table (all 302 colour tokens, aliases followed)

Appended below. Each row is the token name, its light value and its dark value. Values in parentheses show the alias they resolve through.

## 2. Typography

- **Families**: sans `Inter, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`. Mono `"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace`.
- **Google Fonts**: the token file says Inter is "loaded via next/font as --font-inter; Google Fonts here", but `tokens.json` has an empty `fonts` array (no font files). No Google Fonts `<link>` appears in `boardui.html`. For a standalone build, load Inter and JetBrains Mono from Google Fonts yourself.
- **Scale (size / line-height)**:
  - Large Title 64/80
  - Display 1 56/72, Display 2 48/64, Display 3 40/54, Display 4 32/44
  - Title 1 24/34, Title 2 20/26, Title 3 18/24 (regular) and 18/26 (medium, semibold, bold)
  - Headline 16/22
  - Body 14/20
  - Body 2 13/18
  - Caption 1 12/16 (letter-spacing 0.15px)
  - Caption 2 11/15 (letter-spacing 0.2px)
  - Code (mono) 13/23
- **Weights**: every text style exists in 400, 500, 600 and 700. Medium (500) is the default UI weight.
- **Letter-spacing**: only the two caption styles set it (0.15px and 0.2px). The other styles set no tracking in the token file. The usage text mentions tracking-[0.06em] for the bar-list uppercase label.
- **Composite classes**: one class per style (`text-body-medium`), so size, line-height, tracking and weight travel together.
- **Mono**: code lines at 13px/23px, with a 20px line-number gutter.

## 3. Radius

| Token | Value | Typical use |
|---|---|---|
| radius-xs | 2px | Large switch thumb |
| radius-sm | 4px | Checkbox, badge, chart legend squares |
| radius-md | 6px | Chips, segmented thumb, stat-card icon chip |
| radius-lg | 8px | Small button (h-8), pagination cells, small tooltip |
| radius-2lg | 10px | Medium button, input, select, nav rows, segmented track, inner tiles |
| radius-xl | 12px | Kanban ticket, announcement, team button, tree rows |
| radius-2xl | 16px | Dashboard cards, tables, menus, notifications, chat bubbles |
| radius-2-5xl | 20px | Kanban columns, medical cards |
| radius-3xl | 24px | Floating sidebar, chat/image panels, calendar container |
| radius-notification-card | 10px | Notification card |
| radius-full | 9999px | Pills, search, composer, avatars, theme toggle, dots |

## 4. Spacing (4px base)

Tailwind v4 spacing, `--spacing` 0.25rem × n. Steps used: `space-px` 1px, `0.5` 2px, `1` 4px, `1.5` 6px, `2` 8px, `2.5` 10px, `3` 12px, `4` 16px, `6` 24px. Layout uses gap more than margin.

Layout sizes: sidebar 260px, content max 1300px, side panel 410px, kanban column 273px, stat card height 132px, chart card 329px / 337px / 344px / 480px, control md 36px, control sm 32px, composer 52px, profile max 680px.

## 5. Shadows and elevation

Light / dark pairs. Dark keeps the geometry and raises the black alpha.

- **shadow-2xs**: `0 1px rgba(0,0,0,.05)` / `.16`. Segmented thumb.
- **shadow-xs**: `0 1px 2px 0 rgba(0,0,0,.05)` / `.18`. Every button, select, input, checkbox.
- **shadow-sm**: two layers, `0 1px 2px 0 rgba(0,0,0,.06), 0 1px 3px 0 rgba(0,0,0,.1)` / `.12 + .16`. Kanban ticket on hover.
- **shadow-md**: `0 2px 4px -1px rgba(0,0,0,.06), 0 4px 6px -1px rgba(0,0,0,.1)` / `.12 + .18`.
- **shadow-lg**: `0 4px 6px -2px rgba(0,0,0,.05), 0 10px 15px -3px rgba(0,0,0,.1)` / `.1 + .18`.
- **shadow-xl**: `0 10px 10px -5px rgba(0,0,0,.04), 0 20px 25px -5px rgba(0,0,0,.1)` / `.08 + .2`.
- **shadow-card**: `0 1px 1px 0 rgba(0,0,0,.05)` / `.14`. Contact shadow on white tiles on grey cards.
- **shadow-dropdown**: `0 1px 1px 0 rgba(0,0,0,.04), 0 4px 4px 0 rgba(0,0,0,.02)` / `.14 + .1`. Menus, tooltips, notifications.
- **shadow-sidebar**: `0 1px 0 0 rgba(0,0,0,.0196), 0 1px 12px 0 rgba(0,0,0,.0588), 0 0 1px 0 rgba(0,0,0,.3216)` / `.1 + .16 + .42`. Floating sidebar and slide-overs.
- **shadow-nav-selected**: `0 0 0 1px #2b7fff, inset 0 1px 0 0 rgba(255,255,255,.251)`. Selected nav row.
- **shadow-checkbox-selected**: `inset 0 2px 0 0 rgba(255,255,255,.25), inset 0 0 0 1px #2b7fff`. Checked checkbox and switch.
- **shadow-waitlist**: five-layer glow for the floating Pro card (light and dark pairs).
- **Inner shadows**: `inset-shadow-2xs` `inset 0 1px 0 0 rgba(0,0,0,.05)`; `xs` `inset 0 1px 1px 0 rgba(0,0,0,.05)`; `sm` `inset 0 2px 4px 0 rgba(0,0,0,.05)`.

## 6. Gradients (buttons and accent fills)

All run 180°, light stop to dark stop.

- **Primary default**: `linear-gradient(180deg, #2b7fff 0%, #155dfc 100%)`. Hover `#3392ff → #2b7fff`. Pressed `#155dfc → #1447e6`. Disabled `#ebebeb → #d4d4d4` (dark `#404040 → #262626`).
- **Danger default**: `linear-gradient(180deg, #fb2c36 0%, #e7000b 100%)`. Hover `#ff6467 → #fb2c36`. Pressed `#e7000b → #c10007`. Disabled `#ffe2e2 → #ffc9c9` (dark `#82181a → #460809`).
- The selected nav row and checked controls use `from-accent-500 to-accent-600`.

Hover gradients fade in via `::before`, because CSS cannot transition gradients.

## 7. Motion and easing

Durations: button 150ms; input 150ms; press 220ms (down) and 420ms (back up); control 200ms; layout 300ms; number 220ms; chart 450ms; chart reveal 1800ms; theme 820ms.

Easings:
- `ease-standard` `cubic-bezier(0.4, 0, 0.2, 1)`
- `ease-soft` `cubic-bezier(0.22, 1, 0.36, 1)` (reveals, bar rise, text stagger)
- `ease-overshoot` `cubic-bezier(0.34, 1.2, 0.64, 1)` (pill tabs, date picker)
- `ease-theme` `cubic-bezier(0.16, 1, 0.3, 1)`
- `ease-modal` `cubic-bezier(0.32, 0.72, 0, 1)`
- `ease-chart-reveal` `cubic-bezier(0.33, 0, 0.15, 1)`
- `ease-check` `cubic-bezier(0.65, 0, 0.35, 1)`
- `ease-flap-fall` `cubic-bezier(0.55, 0, 0.9, 0.35)`
- `ease-flap-rise` `cubic-bezier(0.25, 0.7, 0.35, 1)`
- `ease-message-line` `cubic-bezier(0.22, 0.61, 0.36, 1)`

Press: `scale(0.98)`. Popovers enter from `scale(.95)` with `blur(2px)`. Reduced motion removes presses, hover lifts and shimmers. Full keyframe table is in `project/motion.md`.

## 8. Borders and states

- Controls get a 1px `border-button-default`; hover shifts to `border-button-hover`, active to `border-button-active`.
- Cards and sections have no border and no shadow on the page ground. Tables use `border-table`.
- Focus: `ring-2 ring-offset-2 ring-border-focus-ring` (accent-500).
- Inputs are filled and borderless. State is an inset ring: `ring-2 ring-inset ring-transparent`, hover `border-button-hover`, focus-within `border-button-active`.
- Scroll areas: 24px masked blur plus gradient fade on scroll.

## 9. Components shown

Source list: 90+ components in `project/components/`, with preview HTML.

- **Actions and controls**: Button (primary, secondary, ghost, danger; medium 36px, small 32px, xs 24px), ButtonGroup, IconButton, LinkButton, CloseButton, SocialButton, Input (filled, inset ring), InputOTP, Textarea, Select, Dropdown, DatePicker, FileUpload, Slider, Checkbox (animated tick), Radio, Switch (skeuomorphic thumb with chip), SegmentedControl (sliding pill), Tabs (underline and pill), Pagination, Breadcrumb, Carousel
- **Feedback and overlays**: Tooltip, Notification, Announcement, Badge, Chip (status and KPI deltas), Avatar, Divider
- **Navigation and shell**: Sidebar (floating card, 260px), PageHeader, TreeView
- **Dashboard cards**: StatCard, ChartCard, RevenueChart, BarListCard, AlertsFeed, Contributions (heatmap), RecentHires, MotionCharts, MotionCountdown, MotionText, MotionControls
- **Data**: DataTable, Table, CalendarMonth, CalendarTemplate, KanbanColumn (Project Board), ProjectBoard
- **Agent and chat**: AIChat, AIImageGeneration, AIProfile, AgentProgress, AgentThinking, ChatThread, ChatStarter, Composer, GenerationFrame, MultiAgentChat, CodePanel, Gallery
- **Templates**: HomeDashboard, MarketingDashboard, FinanceDashboard, MedicalProfile, PatientInfoCard, ProfileCover, Cover

Distinctive traits:
- **Buttons**: the primary is the only filled-gradient control. Everything else is a flat tertiary or secondary surface with a 1px border and xs shadow. Press shrinks to 0.98.
- **Inputs**: filled grey box, no border. Focus shows as a ring, not a border change. Font size drops to 16px on phones to stop iOS zoom.
- **Cards**: grey (`secondary`) section on a white page, radius 16px, no border or shadow. Tiles inside are white with a 1px contact shadow.
- **Badges and chips**: tinted pill fills with a text colour pair. Always paired with a word.
- **Switch and checkbox**: the on-state uses the accent gradient and an inner white highlight at the top edge (the skeuomorphic detail).
- **Sidebar**: floating, 12px off the edge, with a shadow and a 1px white border. Selected row is a gradient with a white top highlight.
- **Menus and tooltips**: 16px radius, 1px border, dropdown shadow, scale-and-blur entrance.
- **Tables**: rounded section, header on the secondary surface, row dividers, sortable headers, gradient checkboxes.
- **Charts**: 2.5px line strokes, vertical area gradients fading to zero, bars with a 4px top radius, dashed comparison lines.
- **Density**: comfortable. Gaps are 16px between rows and 8px inside cards. Heights fixed per row.

## 10. Personality

BoardUI is quiet, neutral and product-literal. Greys carry almost all of the chrome, and blue is the only saturated UI colour, so the content (numbers, status chips, charts) provides the colour. Depth comes from tone changes between grey cards and white tiles, not from heavy borders or shadows. The small skeuomorphic details (gradient buttons, inner white highlights on selected states, a physical-feeling press) add tactility without decoration. Typography is Inter at medium weight, with tabular figures for numbers.

---

## Appendix: all 302 colour tokens, resolved

| Token | Light | Dark |
|---|---|---|
| `color-foreground-full` | #ffffff <sub>(via {color-white})</sub> | oklch(0.371 0 0) <sub>(via {color-neutral-700})</sub> |
| `color-foreground-icon-primary` | oklch(0.145 0 0) <sub>(via {color-neutral-950})</sub> | oklch(0.985 0 0) <sub>(via {color-neutral-50})</sub> |
| `color-foreground-icon-hover` | #000000 <sub>(via {color-black})</sub> | #ffffff <sub>(via {color-white})</sub> |
| `color-foreground-icon-secondary` | oklch(0.556 0 0) <sub>(via {color-neutral-500})</sub> | oklch(0.556 0 0) <sub>(via {color-neutral-500})</sub> |
| `color-foreground-icon-tertiary` | oklch(0.708 0 0) <sub>(via {color-neutral-400})</sub> | oklch(0.439 0 0) <sub>(via {color-neutral-600})</sub> |
| `color-foreground-icon-quaternary` | oklch(0.87 0 0) <sub>(via {color-neutral-300})</sub> | oklch(0.371 0 0) <sub>(via {color-neutral-700})</sub> |
| `color-foreground-icon-error` | oklch(0.577 0.245 27.325) <sub>(via {color-red-600})</sub> | oklch(0.704 0.191 22.216) <sub>(via {color-red-400})</sub> |
| `color-foreground-icon-disabled` | oklch(0.87 0 0) <sub>(via {color-neutral-300})</sub> | oklch(0.269 0 0) <sub>(via {color-neutral-800})</sub> |
| `color-foreground-disabled` | oklch(0.708 0 0) <sub>(via {color-neutral-400})</sub> | oklch(0.371 0 0) <sub>(via {color-neutral-700})</sub> |
| `color-foreground-disabled-danger` | oklch(0.808 0.114 19.571) <sub>(via {color-red-300})</sub> | oklch(0.704 0.191 22.216) <sub>(via {color-red-400})</sub> |
| `color-input-disabled-foreground` | oklch(0.87 0 0) <sub>(via {color-neutral-300})</sub> | oklch(0.439 0 0) <sub>(via {color-neutral-600})</sub> |
| `color-icon-button-disabled-foreground` | oklch(0.87 0 0) <sub>(via {color-neutral-300})</sub> | oklch(0.556 0 0) <sub>(via {color-neutral-500})</sub> |
| `color-button-primary-disabled-foreground` | oklch(0.708 0 0) <sub>(via {color-neutral-400})</sub> | oklch(0.556 0 0) <sub>(via {color-neutral-500})</sub> |
| `color-text-primary` | oklch(0.145 0 0) <sub>(via {color-neutral-950})</sub> | oklch(0.985 0 0) <sub>(via {color-neutral-50})</sub> |
| `color-text-secondary` | oklch(0.556 0 0) <sub>(via {color-neutral-500})</sub> | oklch(0.556 0 0) <sub>(via {color-neutral-500})</sub> |
| `color-text-tertiary` | oklch(0.708 0 0) <sub>(via {color-neutral-400})</sub> | oklch(0.439 0 0) <sub>(via {color-neutral-600})</sub> |
| `color-text-disabled` | oklch(0.87 0 0) <sub>(via {color-neutral-300})</sub> | oklch(0.269 0 0) <sub>(via {color-neutral-800})</sub> |
| `color-text-disabled-danger` | oklch(0.808 0.114 19.571) <sub>(via {color-red-300})</sub> | oklch(0.808 0.114 19.571) <sub>(via {color-red-300})</sub> |
| `color-text-placeholder` | oklch(0.708 0 0) <sub>(via {color-neutral-400})</sub> | oklch(0.708 0 0) <sub>(via {color-neutral-400})</sub> |
| `color-text-error-primary` | oklch(0.637 0.237 25.331) <sub>(via {color-red-500})</sub> | oklch(0.704 0.191 22.216) <sub>(via {color-red-400})</sub> |
| `color-text-destructive` | #ab1016 | #df3a42 |
| `color-input-disabled-text` | oklch(0.87 0 0) <sub>(via {color-neutral-300})</sub> | rgba(115, 115, 115, 0.4) |
| `color-text-white` | #ffffff <sub>(via {color-white})</sub> | #ffffff <sub>(via {color-white})</sub> |
| `color-background-full` | #ffffff <sub>(via {color-white})</sub> | #121212 <sub>(via {color-neutral-925})</sub> |
| `color-ticket-detail-surface` | #ffffff <sub>(via {color-white})</sub> | #121212 <sub>(via {color-neutral-925})</sub> |
| `color-ticket-detail-low-background` | oklch(0.87 0.065 274.039) <sub>(via {color-indigo-200})</sub> | rgba(30, 26, 77, 0.6) |
| `color-ticket-detail-low-hover` | oklch(0.785 0.115 274.713) <sub>(via {color-indigo-300})</sub> | rgba(30, 26, 77, 0.8) |
| `color-ticket-detail-medium-hover` | oklch(0.905 0.182 98.111) <sub>(via {color-yellow-300})</sub> | rgba(67, 32, 4, 0.8) |
| `color-ticket-detail-high-hover` | oklch(0.837 0.128 66.29) <sub>(via {color-orange-300})</sub> | rgba(68, 19, 6, 0.8) |
| `color-ticket-detail-urgent-hover` | oklch(0.81 0.117 11.638) <sub>(via {color-rose-300})</sub> | rgba(77, 2, 24, 0.8) |
| `color-ticket-detail-low-text` | oklch(0.398 0.195 277.366) <sub>(via {color-indigo-800})</sub> | oklch(0.785 0.115 274.713) <sub>(via {color-indigo-300})</sub> |
| `color-ticket-detail-resource-background` | oklch(0.932 0.032 255.585) <sub>(via {color-blue-100})</sub> | rgba(22, 36, 86, 0.6) |
| `color-ticket-detail-resource-text` | oklch(0.546 0.245 262.881) <sub>(via {color-blue-600})</sub> | oklch(0.809 0.105 251.813) <sub>(via {color-blue-300})</sub> |
| `color-ticket-detail-favorite` | #ffb83c | #ffb83c |
| `color-project-board-empty-panel` | rgba(242, 242, 242, 0.8) | rgba(38, 38, 38, 0.6) |
| `color-project-board-empty-front` | #d9d9d9 | #2d2d2d |
| `color-project-board-empty-middle` | #e5e5e5 | oklch(0.371 0 0) <sub>(via {color-neutral-700})</sub> |
| `color-project-board-empty-back` | #ededed | #464646 |
| `color-project-board-empty-detail` | #ffffff <sub>(via {color-white})</sub> | oklch(0.556 0 0) <sub>(via {color-neutral-500})</sub> |
| `color-background-primary-default` | #ffffff <sub>(via {color-white})</sub> | oklch(0.269 0 0) <sub>(via {color-neutral-800})</sub> |
| `color-background-inner-default` | #ffffff <sub>(via {color-white})</sub> | rgba(38, 38, 38, 0.6) |
| `color-background-primary-hover` | #f7f7f7 <sub>(via {color-neutral-100})</sub> | rgba(64, 64, 64, 0.6) |
| `color-background-primary-active` | #ebebeb <sub>(via {color-neutral-200})</sub> | oklch(0.269 0 0) <sub>(via {color-neutral-800})</sub> |
| `color-background-primary-disabled` | #f7f7f7 <sub>(via {color-neutral-100})</sub> | oklch(0.269 0 0) <sub>(via {color-neutral-800})</sub> |
| `color-input-disabled-background` | #f7f7f7 <sub>(via {color-neutral-100})</sub> | rgba(38, 38, 38, 0.3) |
| `color-background-secondary-default` | #f7f7f7 <sub>(via {color-neutral-100})</sub> | oklch(0.205 0 0) <sub>(via {color-neutral-900})</sub> |
| `color-background-secondary-hover` | #ebebeb <sub>(via {color-neutral-200})</sub> | oklch(0.269 0 0) <sub>(via {color-neutral-800})</sub> |
| `color-background-tertiary-default` | #ebebeb <sub>(via {color-neutral-200})</sub> | oklch(0.269 0 0) <sub>(via {color-neutral-800})</sub> |
| `color-background-tertiary-hover` | oklch(0.87 0 0) <sub>(via {color-neutral-300})</sub> | oklch(0.371 0 0) <sub>(via {color-neutral-700})</sub> |
| `color-background-tertiary-error` | oklch(0.936 0.032 17.717) <sub>(via {color-red-100})</sub> | rgba(70, 8, 9, 0.6) |
| `color-background-recent-hire-role` | #f7f7f7 <sub>(via {color-neutral-100})</sub> | rgba(23, 23, 23, 0.6) |
| `color-avatar-neutral-background` | oklch(0.87 0 0) <sub>(via {color-neutral-300})</sub> | oklch(0.269 0 0) <sub>(via {color-background-primary-default})</sub> |
| `color-background-quaternary-default` | oklch(0.87 0 0) <sub>(via {color-neutral-300})</sub> | oklch(0.371 0 0) <sub>(via {color-neutral-700})</sub> |
| `color-background-quaternary-hover` | oklch(0.708 0 0) <sub>(via {color-neutral-400})</sub> | oklch(0.439 0 0) <sub>(via {color-neutral-600})</sub> |
| `color-background-quaternary-error` | oklch(0.885 0.062 18.334) <sub>(via {color-red-200})</sub> | oklch(0.885 0.062 18.334) <sub>(via {color-red-200})</sub> |
| `color-file-upload-icon-background` | oklch(0.87 0 0) <sub>(via {color-neutral-300})</sub> | oklch(0.439 0 0) <sub>(via {color-neutral-600})</sub> |
| `color-file-upload-icon-foreground` | oklch(0.708 0 0) <sub>(via {color-neutral-400})</sub> | oklch(0.708 0 0) <sub>(via {color-neutral-400})</sub> |
| `color-file-upload-icon-foreground-hover` | oklch(0.556 0 0) <sub>(via {color-neutral-500})</sub> | oklch(0.87 0 0) <sub>(via {color-neutral-300})</sub> |
| `color-border-button-default` | #ebebeb <sub>(via {color-neutral-200})</sub> | oklch(0.371 0 0) <sub>(via {color-neutral-700})</sub> |
| `color-border-button-hover` | oklch(0.87 0 0) <sub>(via {color-neutral-300})</sub> | oklch(0.556 0 0) <sub>(via {color-neutral-500})</sub> |
| `color-border-button-active` | oklch(0.708 0 0) <sub>(via {color-neutral-400})</sub> | oklch(0.439 0 0) <sub>(via {color-neutral-600})</sub> |
| `color-border-button-white` | #ffffff <sub>(via {color-white})</sub> | oklch(0.274 0.006 286.033) <sub>(via {color-zinc-800})</sub> |
| `color-border-error-default` | oklch(0.637 0.237 25.331) <sub>(via {color-red-500})</sub> | oklch(0.704 0.191 22.216) <sub>(via {color-red-400})</sub> |
| `color-border-checkbox-default` | oklch(0.87 0 0) <sub>(via {color-neutral-300})</sub> | oklch(0.371 0 0) <sub>(via {color-neutral-700})</sub> |
| `color-border-checkbox-hover` | oklch(0.708 0 0) <sub>(via {color-neutral-400})</sub> | oklch(0.556 0 0) <sub>(via {color-neutral-500})</sub> |
| `color-border-checkbox-active` | oklch(0.708 0 0) <sub>(via {color-neutral-400})</sub> | oklch(0.556 0 0) <sub>(via {color-neutral-500})</sub> |
| `color-border-checkbox-white` | #ffffff <sub>(via {color-white})</sub> | #ffffff <sub>(via {color-white})</sub> |
| `color-border-component-detail-container` | #ebebeb <sub>(via {color-neutral-200})</sub> | oklch(0.269 0 0) <sub>(via {color-neutral-800})</sub> |
| `color-border-ai-profile-card` | #ebebeb <sub>(via {color-neutral-200})</sub> | oklch(0.269 0 0) <sub>(via {color-neutral-800})</sub> |
| `color-border-table` | #ebebeb <sub>(via {color-neutral-200})</sub> | oklch(0.269 0 0) <sub>(via {color-neutral-800})</sub> |
| `color-border-button-group` | #ebebeb <sub>(via {color-neutral-200})</sub> | rgba(82, 82, 82, 0.6) |
| `color-border-sidebar-profile-hover` | oklch(0.87 0 0) <sub>(via {color-neutral-300})</sub> | oklch(0.439 0 0) <sub>(via {color-neutral-600})</sub> |
| `color-separator-border` | #ebebeb <sub>(via {color-neutral-200})</sub> | oklch(0.269 0 0) <sub>(via {color-neutral-800})</sub> |
| `color-separator-border-strong` | #ebebeb <sub>(via {color-neutral-200})</sub> | rgba(64, 64, 64, 0.6) |
| `color-border-focus-ring` | oklch(0.623 0.214 259.815) <sub>(via {color-accent-500})</sub> | oklch(0.623 0.214 259.815) <sub>(via {color-accent-500})</sub> |
| `color-state-success-text` | oklch(0.453 0.124 130.933) <sub>(via {color-lime-800})</sub> | oklch(0.453 0.124 130.933) <sub>(via {color-lime-800})</sub> |
| `color-state-success-base` | oklch(0.938 0.127 124.321) <sub>(via {color-lime-200})</sub> | oklch(0.938 0.127 124.321) <sub>(via {color-lime-200})</sub> |
| `color-control-indicator-background` | #ffffff <sub>(via {color-white})</sub> | #ffffff <sub>(via {color-white})</sub> |
| `color-control-indicator-background-subtle` | #f7f7f7 <sub>(via {color-neutral-100})</sub> | #f7f7f7 <sub>(via {color-neutral-100})</sub> |
| `color-switch-off-chip-start` | #ffffff <sub>(via {color-white})</sub> | oklch(0.269 0 0) <sub>(via {color-background-tertiary-default})</sub> |
| `color-switch-off-chip-end` | #f7f7f7 <sub>(via {color-neutral-100})</sub> | oklch(0.269 0 0) <sub>(via {color-background-tertiary-default})</sub> |
| `color-switch-on-chip-start` | #2273fe | #2273fe |
| `color-switch-on-chip-end` | #144be9 | #144be9 |
| `color-stat-card-icon-background` | #ffffff <sub>(via {color-white})</sub> | oklch(0.269 0 0) <sub>(via {color-neutral-800})</sub> |
| `color-segmented-control-background` | #f7f7f7 <sub>(via {color-neutral-100})</sub> | #121212 <sub>(via {color-neutral-925})</sub> |
| `color-segmented-control-selected-background` | #ffffff <sub>(via {color-white})</sub> | oklch(0.269 0 0) <sub>(via {color-neutral-800})</sub> |
| `color-theme-toggle-sidebar-background` | #ebebeb <sub>(via {color-neutral-200})</sub> | oklch(0.269 0 0) <sub>(via {color-neutral-800})</sub> |
| `color-theme-toggle-sidebar-selected-background` | #ffffff <sub>(via {color-white})</sub> | oklch(0.371 0 0) <sub>(via {color-neutral-700})</sub> |
| `color-ai-chat-composer-add-background` | #f7f7f7 <sub>(via {color-neutral-100})</sub> | oklch(0.371 0 0) <sub>(via {color-neutral-700})</sub> |
| `color-ai-chat-composer-add-hover-background` | #ebebeb <sub>(via {color-neutral-200})</sub> | oklch(0.439 0 0) <sub>(via {color-neutral-600})</sub> |
| `color-composer-panel-tab-background` | #ebebeb <sub>(via {color-neutral-200})</sub> | rgba(64, 64, 64, 0.5) |
| `color-composer-panel-add-background` | #ebebeb <sub>(via {color-neutral-200})</sub> | oklch(0.371 0 0) <sub>(via {color-neutral-700})</sub> |
| `color-composer-panel-add-hover-background` | oklch(0.87 0 0) <sub>(via {color-neutral-300})</sub> | oklch(0.439 0 0) <sub>(via {color-neutral-600})</sub> |
| `color-composer-panel-tile-border` | #ebebeb <sub>(via {color-neutral-200})</sub> | rgba(255, 255, 255, 0.14) |
| `color-composer-panel-rail-background` | #f7f7f7 <sub>(via {color-neutral-100})</sub> | rgba(23, 23, 23, 0.5) |
| `color-questionnaire-key-background` | #f7f7f7 <sub>(via {color-neutral-100})</sub> | oklch(0.371 0 0) <sub>(via {color-neutral-700})</sub> |
| `color-questionnaire-key-hover-background` | #ebebeb <sub>(via {color-neutral-200})</sub> | oklch(0.439 0 0) <sub>(via {color-neutral-600})</sub> |
| `color-agent-progress-ring` | oklch(0.371 0 0) <sub>(via {color-neutral-700})</sub> | rgba(255, 255, 255, 0.5) |
| `color-button-ghost-background` | oklch(0.932 0.032 255.585) <sub>(via {color-accent-100})</sub> | oklch(0.379 0.146 265.522) <sub>(via {color-accent-900})</sub> |
| `color-button-ghost-hover` | oklch(0.882 0.059 254.128) <sub>(via {color-accent-200})</sub> | oklch(0.424 0.199 265.638) <sub>(via {color-accent-800})</sub> |
| `color-button-ghost-active` | oklch(0.809 0.105 251.813) <sub>(via {color-accent-300})</sub> | oklch(0.488 0.243 264.376) <sub>(via {color-accent-700})</sub> |
| `color-button-ghost-disabled` | oklch(0.97 0.014 254.604) <sub>(via {color-accent-50})</sub> | oklch(0.269 0 0) <sub>(via {color-neutral-800})</sub> |
| `color-button-ghost-foreground` | oklch(0.488 0.243 264.376) <sub>(via {color-accent-700})</sub> | oklch(0.809 0.105 251.813) <sub>(via {color-accent-300})</sub> |
| `color-button-ghost-disabled-foreground` | oklch(0.809 0.105 251.813) <sub>(via {color-accent-300})</sub> | oklch(0.439 0 0) <sub>(via {color-neutral-600})</sub> |
| `color-dropdown-item-hover-background` | #f7f7f7 <sub>(via {color-neutral-100})</sub> | rgba(64, 64, 64, 0.6) |
| `color-kbd-background` | oklch(0.87 0 0) <sub>(via {color-neutral-300})</sub> | oklch(0.371 0 0) <sub>(via {color-neutral-700})</sub> |
| `color-kbd-foreground` | oklch(0.556 0 0) <sub>(via {color-neutral-500})</sub> | oklch(0.708 0 0) <sub>(via {color-neutral-400})</sub> |
| `color-docs-file-chip-background` | oklch(0.977 0.014 308.299) <sub>(via {color-purple-50})</sub> | rgba(60, 3, 102, 0.5) |
| `color-docs-file-chip-border` | oklch(0.946 0.033 307.174) <sub>(via {color-purple-100})</sub> | oklch(0.438 0.218 303.724) <sub>(via {color-purple-800})</sub> |
| `color-docs-file-chip-foreground` | oklch(0.627 0.265 303.9) <sub>(via {color-purple-500})</sub> | oklch(0.714 0.203 305.504) <sub>(via {color-purple-400})</sub> |
| `color-docs-command-accent` | oklch(0.714 0.203 305.504) <sub>(via {color-purple-400})</sub> | oklch(0.714 0.203 305.504) <sub>(via {color-purple-400})</sub> |
| `color-docs-code-background` | #ffffff <sub>(via {color-background-primary-default})</sub> | #121212 <sub>(via {color-background-full})</sub> |
| `color-docs-install-rail` | #ebebeb <sub>(via {color-border-button-default})</sub> | rgba(38, 38, 38, 0.6) |
| `color-badge-neutral-background` | #ebebeb <sub>(via {color-neutral-200})</sub> | oklch(0.269 0 0) <sub>(via {color-neutral-800})</sub> |
| `color-team-menu-count-background` | #ebebeb <sub>(via {color-neutral-200})</sub> | oklch(0.371 0 0) <sub>(via {color-neutral-700})</sub> |
| `color-team-menu-count-foreground` | oklch(0.556 0 0) <sub>(via {color-neutral-500})</sub> | oklch(0.708 0 0) <sub>(via {color-neutral-400})</sub> |
| `color-badge-new-background` | oklch(0.932 0.032 255.585) <sub>(via {color-accent-100})</sub> | oklch(0.282 0.091 267.935) <sub>(via {color-accent-950})</sub> |
| `color-badge-new-text` | oklch(0.546 0.245 262.881) <sub>(via {color-accent-600})</sub> | #3392ff <sub>(via {color-accent-400})</sub> |
| `color-tab-count-selected-background` | oklch(0.932 0.032 255.585) <sub>(via {color-accent-100})</sub> | rgba(25, 60, 184, 0.6) |
| `color-pill-tab-blue-selected-background` | oklch(0.97 0.014 254.604) <sub>(via {color-accent-50})</sub> | rgba(22, 36, 86, 0.6) |
| `color-pill-tab-blue-hover-background` | #f7f7f7 <sub>(via {color-neutral-100})</sub> | oklch(0.269 0 0) <sub>(via {color-neutral-800})</sub> |
| `color-notification-information-background` | oklch(0.932 0.032 255.585) <sub>(via {color-blue-100})</sub> | rgba(25, 60, 184, 0.5) |
| `color-notification-information-foreground` | oklch(0.546 0.245 262.881) <sub>(via {color-blue-600})</sub> | oklch(0.809 0.105 251.813) <sub>(via {color-blue-300})</sub> |
| `color-notification-success-background` | oklch(0.967 0.067 122.328) <sub>(via {color-lime-100})</sub> | rgba(60, 99, 0, 0.5) |
| `color-notification-success-foreground` | oklch(0.648 0.2 131.684) <sub>(via {color-lime-600})</sub> | oklch(0.897 0.196 126.665) <sub>(via {color-lime-300})</sub> |
| `color-notification-error-background` | oklch(0.941 0.03 12.58) <sub>(via {color-rose-100})</sub> | rgba(165, 0, 54, 0.5) |
| `color-notification-error-foreground` | oklch(0.586 0.253 17.585) <sub>(via {color-rose-600})</sub> | oklch(0.81 0.117 11.638) <sub>(via {color-rose-300})</sub> |
| `color-notification-center-background` | #ffffff <sub>(via {color-white})</sub> | oklch(0.205 0 0) <sub>(via {color-neutral-900})</sub> |
| `color-status-lime-background` | oklch(0.938 0.127 124.321) <sub>(via {color-lime-200})</sub> | rgba(25, 46, 3, 0.6) |
| `color-status-lime-text` | oklch(0.453 0.124 130.933) <sub>(via {color-lime-800})</sub> | oklch(0.768 0.233 130.85) <sub>(via {color-lime-500})</sub> |
| `color-status-yellow-background` | oklch(0.945 0.129 101.54) <sub>(via {color-yellow-200})</sub> | rgba(67, 32, 4, 0.6) |
| `color-status-yellow-text` | oklch(0.476 0.114 61.907) <sub>(via {color-yellow-800})</sub> | oklch(0.795 0.184 86.047) <sub>(via {color-yellow-500})</sub> |
| `color-status-rose-background` | oklch(0.892 0.058 10.001) <sub>(via {color-rose-200})</sub> | rgba(77, 2, 24, 0.6) |
| `color-status-rose-text` | oklch(0.455 0.188 13.697) <sub>(via {color-rose-800})</sub> | oklch(0.645 0.246 16.439) <sub>(via {color-rose-500})</sub> |
| `color-status-cyan-background` | oklch(0.917 0.08 205.041) <sub>(via {color-cyan-200})</sub> | rgba(5, 51, 69, 0.6) |
| `color-status-cyan-text` | oklch(0.45 0.085 224.283) <sub>(via {color-cyan-800})</sub> | oklch(0.789 0.154 211.53) <sub>(via {color-cyan-400})</sub> |
| `color-status-orange-background` | oklch(0.901 0.076 70.697) <sub>(via {color-orange-200})</sub> | rgba(68, 19, 6, 0.6) |
| `color-status-orange-text` | oklch(0.47 0.157 37.304) <sub>(via {color-orange-800})</sub> | oklch(0.705 0.213 47.604) <sub>(via {color-orange-500})</sub> |
| `color-status-blue-background` | oklch(0.882 0.059 254.128) <sub>(via {color-blue-200})</sub> | rgba(22, 36, 86, 0.6) |
| `color-status-blue-text` | oklch(0.424 0.199 265.638) <sub>(via {color-blue-800})</sub> | oklch(0.809 0.105 251.813) <sub>(via {color-blue-300})</sub> |
| `color-status-purple-background` | oklch(0.946 0.033 307.174) <sub>(via {color-purple-100})</sub> | rgba(89, 22, 139, 0.5) |
| `color-status-purple-text` | oklch(0.558 0.288 302.321) <sub>(via {color-purple-600})</sub> | oklch(0.827 0.119 306.383) <sub>(via {color-purple-300})</sub> |
| `color-status-dot-green-halo` | oklch(0.962 0.044 156.743) <sub>(via {color-green-100})</sub> | rgba(1, 102, 48, 0.4) |
| `color-status-dot-yellow-halo` | oklch(0.945 0.129 101.54) <sub>(via {color-yellow-200})</sub> | rgba(137, 75, 0, 0.4) |
| `color-status-dot-indigo-halo` | oklch(0.93 0.034 272.788) <sub>(via {color-indigo-100})</sub> | rgba(55, 42, 172, 0.4) |
| `color-date-range-background` | oklch(0.932 0.032 255.585) <sub>(via {color-accent-100})</sub> | oklch(0.282 0.091 267.935) <sub>(via {color-accent-950})</sub> |
| `color-date-range-edge-background` | oklch(0.809 0.105 251.813) <sub>(via {color-accent-300})</sub> | oklch(0.424 0.199 265.638) <sub>(via {color-accent-800})</sub> |
| `color-calendar-event-blue-background` | oklch(0.932 0.032 255.585) <sub>(via {color-blue-100})</sub> | oklch(0.282 0.091 267.935) <sub>(via {color-blue-950})</sub> |
| `color-calendar-event-blue-title` | oklch(0.488 0.243 264.376) <sub>(via {color-blue-700})</sub> | oklch(0.809 0.105 251.813) <sub>(via {color-blue-300})</sub> |
| `color-calendar-event-blue-time` | oklch(0.488 0.243 264.376) <sub>(via {color-blue-700})</sub> | oklch(0.809 0.105 251.813) <sub>(via {color-blue-300})</sub> |
| `color-calendar-event-pink-background` | oklch(0.948 0.028 342.258) <sub>(via {color-pink-100})</sub> | oklch(0.284 0.109 3.907) <sub>(via {color-pink-950})</sub> |
| `color-calendar-event-pink-title` | oklch(0.525 0.223 3.958) <sub>(via {color-pink-700})</sub> | oklch(0.823 0.12 346.018) <sub>(via {color-pink-300})</sub> |
| `color-calendar-event-pink-time` | oklch(0.525 0.223 3.958) <sub>(via {color-pink-700})</sub> | oklch(0.823 0.12 346.018) <sub>(via {color-pink-300})</sub> |
| `color-calendar-event-purple-background` | oklch(0.946 0.033 307.174) <sub>(via {color-purple-100})</sub> | oklch(0.291 0.149 302.717) <sub>(via {color-purple-950})</sub> |
| `color-calendar-event-purple-title` | oklch(0.496 0.265 301.924) <sub>(via {color-purple-700})</sub> | oklch(0.827 0.119 306.383) <sub>(via {color-purple-300})</sub> |
| `color-calendar-event-purple-time` | oklch(0.496 0.265 301.924) <sub>(via {color-purple-700})</sub> | oklch(0.827 0.119 306.383) <sub>(via {color-purple-300})</sub> |
| `color-calendar-event-lime-background` | oklch(0.967 0.067 122.328) <sub>(via {color-lime-100})</sub> | oklch(0.274 0.072 132.109) <sub>(via {color-lime-950})</sub> |
| `color-calendar-event-lime-title` | oklch(0.453 0.124 130.933) <sub>(via {color-lime-800})</sub> | oklch(0.897 0.196 126.665) <sub>(via {color-lime-300})</sub> |
| `color-calendar-event-lime-time` | oklch(0.532 0.157 131.589) <sub>(via {color-lime-700})</sub> | oklch(0.897 0.196 126.665) <sub>(via {color-lime-300})</sub> |
| `color-calendar-event-emerald-background` | oklch(0.95 0.052 163.051) <sub>(via {color-emerald-100})</sub> | oklch(0.262 0.051 172.552) <sub>(via {color-emerald-950})</sub> |
| `color-calendar-event-emerald-title` | oklch(0.432 0.095 166.913) <sub>(via {color-emerald-800})</sub> | oklch(0.845 0.143 164.978) <sub>(via {color-emerald-300})</sub> |
| `color-calendar-event-emerald-time` | oklch(0.508 0.118 165.612) <sub>(via {color-emerald-700})</sub> | oklch(0.845 0.143 164.978) <sub>(via {color-emerald-300})</sub> |
| `color-text-error-placeholder` | oklch(0.704 0.191 22.216) <sub>(via {color-red-400})</sub> | oklch(0.704 0.191 22.216) <sub>(via {color-red-400})</sub> |
| `color-chart-track` | #ebebeb <sub>(via {color-neutral-200})</sub> | oklch(0.269 0 0) <sub>(via {color-neutral-800})</sub> |
| `color-chart-cursor` | oklch(0.87 0 0) <sub>(via {color-neutral-300})</sub> | oklch(0.371 0 0) <sub>(via {color-neutral-700})</sub> |
| `color-chart-neutral` | oklch(0.87 0 0) <sub>(via {color-neutral-300})</sub> | oklch(0.269 0 0) <sub>(via {color-neutral-800})</sub> |
| `color-chart-1` | oklch(0.777 0.152 181.912) <sub>(via {color-teal-400})</sub> | oklch(0.777 0.152 181.912) <sub>(via {color-teal-400})</sub> |
| `color-chart-1-active` | oklch(0.704 0.14 182.503) <sub>(via {color-teal-500})</sub> | oklch(0.704 0.14 182.503) <sub>(via {color-teal-500})</sub> |
| `color-chart-2` | oklch(0.841 0.238 128.85) <sub>(via {color-lime-400})</sub> | oklch(0.841 0.238 128.85) <sub>(via {color-lime-400})</sub> |
| `color-chart-2-active` | oklch(0.768 0.233 130.85) <sub>(via {color-lime-500})</sub> | oklch(0.768 0.233 130.85) <sub>(via {color-lime-500})</sub> |
| `color-chart-3` | oklch(0.718 0.202 349.761) <sub>(via {color-pink-400})</sub> | oklch(0.718 0.202 349.761) <sub>(via {color-pink-400})</sub> |
| `color-chart-3-active` | oklch(0.656 0.241 354.308) <sub>(via {color-pink-500})</sub> | oklch(0.656 0.241 354.308) <sub>(via {color-pink-500})</sub> |
| `color-chart-4` | oklch(0.746 0.16 232.661) <sub>(via {color-sky-400})</sub> | oklch(0.746 0.16 232.661) <sub>(via {color-sky-400})</sub> |
| `color-chart-4-active` | oklch(0.685 0.169 237.323) <sub>(via {color-sky-500})</sub> | oklch(0.685 0.169 237.323) <sub>(via {color-sky-500})</sub> |
| `color-chart-5` | oklch(0.714 0.203 305.504) <sub>(via {color-purple-400})</sub> | oklch(0.714 0.203 305.504) <sub>(via {color-purple-400})</sub> |
| `color-chart-5-active` | oklch(0.627 0.265 303.9) <sub>(via {color-purple-500})</sub> | oklch(0.627 0.265 303.9) <sub>(via {color-purple-500})</sub> |
| `color-chart-6` | #3392ff <sub>(via {color-blue-400})</sub> | #3392ff <sub>(via {color-blue-400})</sub> |
| `color-chart-6-active` | oklch(0.623 0.214 259.815) <sub>(via {color-blue-500})</sub> | oklch(0.623 0.214 259.815) <sub>(via {color-blue-500})</sub> |
| `color-chart-7` | oklch(0.765 0.177 163.223) <sub>(via {color-emerald-400})</sub> | oklch(0.765 0.177 163.223) <sub>(via {color-emerald-400})</sub> |
| `color-chart-7-active` | oklch(0.696 0.17 162.48) <sub>(via {color-emerald-500})</sub> | oklch(0.696 0.17 162.48) <sub>(via {color-emerald-500})</sub> |
| `color-chart-8` | oklch(0.852 0.199 91.936) <sub>(via {color-yellow-400})</sub> | oklch(0.852 0.199 91.936) <sub>(via {color-yellow-400})</sub> |
| `color-chart-8-active` | oklch(0.795 0.184 86.047) <sub>(via {color-yellow-500})</sub> | oklch(0.795 0.184 86.047) <sub>(via {color-yellow-500})</sub> |
| `color-chart-9` | oklch(0.673 0.182 276.935) <sub>(via {color-indigo-400})</sub> | oklch(0.673 0.182 276.935) <sub>(via {color-indigo-400})</sub> |
| `color-chart-9-active` | oklch(0.585 0.233 277.117) <sub>(via {color-indigo-500})</sub> | oklch(0.585 0.233 277.117) <sub>(via {color-indigo-500})</sub> |
| `color-chart-agents-bar` | oklch(0.827 0.119 306.383) <sub>(via {color-purple-300})</sub> | oklch(0.627 0.265 303.9) <sub>(via {color-purple-500})</sub> |
| `color-chart-agents-bar-active` | oklch(0.714 0.203 305.504) <sub>(via {color-purple-400})</sub> | oklch(0.558 0.288 302.321) <sub>(via {color-purple-600})</sub> |
| `color-accent-50` | oklch(0.97 0.014 254.604) <sub>(via {color-blue-50})</sub> | oklch(0.97 0.014 254.604) <sub>(via {color-blue-50})</sub> |
| `color-accent-100` | oklch(0.932 0.032 255.585) <sub>(via {color-blue-100})</sub> | oklch(0.932 0.032 255.585) <sub>(via {color-blue-100})</sub> |
| `color-accent-200` | oklch(0.882 0.059 254.128) <sub>(via {color-blue-200})</sub> | oklch(0.882 0.059 254.128) <sub>(via {color-blue-200})</sub> |
| `color-accent-300` | oklch(0.809 0.105 251.813) <sub>(via {color-blue-300})</sub> | oklch(0.809 0.105 251.813) <sub>(via {color-blue-300})</sub> |
| `color-accent-400` | #3392ff <sub>(via {color-blue-400})</sub> | #3392ff <sub>(via {color-blue-400})</sub> |
| `color-accent-500` | oklch(0.623 0.214 259.815) <sub>(via {color-blue-500})</sub> | oklch(0.623 0.214 259.815) <sub>(via {color-blue-500})</sub> |
| `color-accent-600` | oklch(0.546 0.245 262.881) <sub>(via {color-blue-600})</sub> | oklch(0.546 0.245 262.881) <sub>(via {color-blue-600})</sub> |
| `color-accent-700` | oklch(0.488 0.243 264.376) <sub>(via {color-blue-700})</sub> | oklch(0.488 0.243 264.376) <sub>(via {color-blue-700})</sub> |
| `color-accent-800` | oklch(0.424 0.199 265.638) <sub>(via {color-blue-800})</sub> | oklch(0.424 0.199 265.638) <sub>(via {color-blue-800})</sub> |
| `color-accent-900` | oklch(0.379 0.146 265.522) <sub>(via {color-blue-900})</sub> | oklch(0.379 0.146 265.522) <sub>(via {color-blue-900})</sub> |
| `color-accent-950` | oklch(0.282 0.091 267.935) <sub>(via {color-blue-950})</sub> | oklch(0.282 0.091 267.935) <sub>(via {color-blue-950})</sub> |
| `color-white` | #ffffff | #ffffff |
| `color-black` | #000000 | #000000 |
| `color-neutral-50` | oklch(0.985 0 0) | oklch(0.985 0 0) |
| `color-neutral-100` | #f7f7f7 | #f7f7f7 |
| `color-neutral-200` | #ebebeb | #ebebeb |
| `color-neutral-300` | oklch(0.87 0 0) | oklch(0.87 0 0) |
| `color-neutral-400` | oklch(0.708 0 0) | oklch(0.708 0 0) |
| `color-neutral-500` | oklch(0.556 0 0) | oklch(0.556 0 0) |
| `color-neutral-600` | oklch(0.439 0 0) | oklch(0.439 0 0) |
| `color-neutral-700` | oklch(0.371 0 0) | oklch(0.371 0 0) |
| `color-neutral-800` | oklch(0.269 0 0) | oklch(0.269 0 0) |
| `color-neutral-900` | oklch(0.205 0 0) | oklch(0.205 0 0) |
| `color-neutral-925` | #121212 | #121212 |
| `color-neutral-950` | oklch(0.145 0 0) | oklch(0.145 0 0) |
| `color-slate-200` | #ebeff5 | #ebeff5 |
| `color-zinc-800` | oklch(0.274 0.006 286.033) | oklch(0.274 0.006 286.033) |
| `color-blue-50` | oklch(0.97 0.014 254.604) | oklch(0.97 0.014 254.604) |
| `color-blue-100` | oklch(0.932 0.032 255.585) | oklch(0.932 0.032 255.585) |
| `color-blue-200` | oklch(0.882 0.059 254.128) | oklch(0.882 0.059 254.128) |
| `color-blue-300` | oklch(0.809 0.105 251.813) | oklch(0.809 0.105 251.813) |
| `color-blue-400` | #3392ff | #3392ff |
| `color-blue-500` | oklch(0.623 0.214 259.815) | oklch(0.623 0.214 259.815) |
| `color-blue-600` | oklch(0.546 0.245 262.881) | oklch(0.546 0.245 262.881) |
| `color-blue-700` | oklch(0.488 0.243 264.376) | oklch(0.488 0.243 264.376) |
| `color-blue-800` | oklch(0.424 0.199 265.638) | oklch(0.424 0.199 265.638) |
| `color-blue-900` | oklch(0.379 0.146 265.522) | oklch(0.379 0.146 265.522) |
| `color-blue-950` | oklch(0.282 0.091 267.935) | oklch(0.282 0.091 267.935) |
| `color-red-100` | oklch(0.936 0.032 17.717) | oklch(0.936 0.032 17.717) |
| `color-red-200` | oklch(0.885 0.062 18.334) | oklch(0.885 0.062 18.334) |
| `color-red-300` | oklch(0.808 0.114 19.571) | oklch(0.808 0.114 19.571) |
| `color-red-400` | oklch(0.704 0.191 22.216) | oklch(0.704 0.191 22.216) |
| `color-red-500` | oklch(0.637 0.237 25.331) | oklch(0.637 0.237 25.331) |
| `color-red-600` | oklch(0.577 0.245 27.325) | oklch(0.577 0.245 27.325) |
| `color-red-900` | oklch(0.396 0.141 25.723) | oklch(0.396 0.141 25.723) |
| `color-red-950` | oklch(0.258 0.092 26.042) | oklch(0.258 0.092 26.042) |
| `color-rose-100` | oklch(0.941 0.03 12.58) | oklch(0.941 0.03 12.58) |
| `color-rose-200` | oklch(0.892 0.058 10.001) | oklch(0.892 0.058 10.001) |
| `color-rose-300` | oklch(0.81 0.117 11.638) | oklch(0.81 0.117 11.638) |
| `color-rose-500` | oklch(0.645 0.246 16.439) | oklch(0.645 0.246 16.439) |
| `color-rose-600` | oklch(0.586 0.253 17.585) | oklch(0.586 0.253 17.585) |
| `color-rose-800` | oklch(0.455 0.188 13.697) | oklch(0.455 0.188 13.697) |
| `color-orange-200` | oklch(0.901 0.076 70.697) | oklch(0.901 0.076 70.697) |
| `color-orange-300` | oklch(0.837 0.128 66.29) | oklch(0.837 0.128 66.29) |
| `color-orange-500` | oklch(0.705 0.213 47.604) | oklch(0.705 0.213 47.604) |
| `color-orange-800` | oklch(0.47 0.157 37.304) | oklch(0.47 0.157 37.304) |
| `color-amber-400` | oklch(0.828 0.189 84.429) | oklch(0.828 0.189 84.429) |
| `color-yellow-200` | oklch(0.945 0.129 101.54) | oklch(0.945 0.129 101.54) |
| `color-yellow-300` | oklch(0.905 0.182 98.111) | oklch(0.905 0.182 98.111) |
| `color-yellow-400` | oklch(0.852 0.199 91.936) | oklch(0.852 0.199 91.936) |
| `color-yellow-500` | oklch(0.795 0.184 86.047) | oklch(0.795 0.184 86.047) |
| `color-yellow-800` | oklch(0.476 0.114 61.907) | oklch(0.476 0.114 61.907) |
| `color-lime-100` | oklch(0.967 0.067 122.328) | oklch(0.967 0.067 122.328) |
| `color-lime-200` | oklch(0.938 0.127 124.321) | oklch(0.938 0.127 124.321) |
| `color-lime-300` | oklch(0.897 0.196 126.665) | oklch(0.897 0.196 126.665) |
| `color-lime-400` | oklch(0.841 0.238 128.85) | oklch(0.841 0.238 128.85) |
| `color-lime-500` | oklch(0.768 0.233 130.85) | oklch(0.768 0.233 130.85) |
| `color-lime-600` | oklch(0.648 0.2 131.684) | oklch(0.648 0.2 131.684) |
| `color-lime-700` | oklch(0.532 0.157 131.589) | oklch(0.532 0.157 131.589) |
| `color-lime-800` | oklch(0.453 0.124 130.933) | oklch(0.453 0.124 130.933) |
| `color-lime-950` | oklch(0.274 0.072 132.109) | oklch(0.274 0.072 132.109) |
| `color-green-100` | oklch(0.962 0.044 156.743) | oklch(0.962 0.044 156.743) |
| `color-green-500` | oklch(0.723 0.219 149.579) | oklch(0.723 0.219 149.579) |
| `color-emerald-100` | oklch(0.95 0.052 163.051) | oklch(0.95 0.052 163.051) |
| `color-emerald-300` | oklch(0.845 0.143 164.978) | oklch(0.845 0.143 164.978) |
| `color-emerald-400` | oklch(0.765 0.177 163.223) | oklch(0.765 0.177 163.223) |
| `color-emerald-500` | oklch(0.696 0.17 162.48) | oklch(0.696 0.17 162.48) |
| `color-emerald-700` | oklch(0.508 0.118 165.612) | oklch(0.508 0.118 165.612) |
| `color-emerald-800` | oklch(0.432 0.095 166.913) | oklch(0.432 0.095 166.913) |
| `color-emerald-950` | oklch(0.262 0.051 172.552) | oklch(0.262 0.051 172.552) |
| `color-teal-400` | oklch(0.777 0.152 181.912) | oklch(0.777 0.152 181.912) |
| `color-teal-500` | oklch(0.704 0.14 182.503) | oklch(0.704 0.14 182.503) |
| `color-cyan-200` | oklch(0.917 0.08 205.041) | oklch(0.917 0.08 205.041) |
| `color-cyan-400` | oklch(0.789 0.154 211.53) | oklch(0.789 0.154 211.53) |
| `color-cyan-800` | oklch(0.45 0.085 224.283) | oklch(0.45 0.085 224.283) |
| `color-sky-400` | oklch(0.746 0.16 232.661) | oklch(0.746 0.16 232.661) |
| `color-sky-500` | oklch(0.685 0.169 237.323) | oklch(0.685 0.169 237.323) |
| `color-indigo-100` | oklch(0.93 0.034 272.788) | oklch(0.93 0.034 272.788) |
| `color-indigo-200` | oklch(0.87 0.065 274.039) | oklch(0.87 0.065 274.039) |
| `color-indigo-300` | oklch(0.785 0.115 274.713) | oklch(0.785 0.115 274.713) |
| `color-indigo-400` | oklch(0.673 0.182 276.935) | oklch(0.673 0.182 276.935) |
| `color-indigo-500` | oklch(0.585 0.233 277.117) | oklch(0.585 0.233 277.117) |
| `color-indigo-800` | oklch(0.398 0.195 277.366) | oklch(0.398 0.195 277.366) |
| `color-violet-200` | oklch(0.894 0.057 293.283) | oklch(0.894 0.057 293.283) |
| `color-violet-400` | oklch(0.702 0.183 293.541) | oklch(0.702 0.183 293.541) |
| `color-violet-500` | oklch(0.606 0.25 292.717) | oklch(0.606 0.25 292.717) |
| `color-violet-600` | oklch(0.541 0.281 293.009) | oklch(0.541 0.281 293.009) |
| `color-violet-700` | oklch(0.491 0.27 292.581) | oklch(0.491 0.27 292.581) |
| `color-violet-800` | oklch(0.432 0.232 292.759) | oklch(0.432 0.232 292.759) |
| `color-violet-950` | oklch(0.283 0.141 291.089) | oklch(0.283 0.141 291.089) |
| `color-purple-50` | oklch(0.977 0.014 308.299) | oklch(0.977 0.014 308.299) |
| `color-purple-100` | oklch(0.946 0.033 307.174) | oklch(0.946 0.033 307.174) |
| `color-purple-300` | oklch(0.827 0.119 306.383) | oklch(0.827 0.119 306.383) |
| `color-purple-400` | oklch(0.714 0.203 305.504) | oklch(0.714 0.203 305.504) |
| `color-purple-500` | oklch(0.627 0.265 303.9) | oklch(0.627 0.265 303.9) |
| `color-purple-600` | oklch(0.558 0.288 302.321) | oklch(0.558 0.288 302.321) |
| `color-purple-700` | oklch(0.496 0.265 301.924) | oklch(0.496 0.265 301.924) |
| `color-purple-800` | oklch(0.438 0.218 303.724) | oklch(0.438 0.218 303.724) |
| `color-purple-950` | oklch(0.291 0.149 302.717) | oklch(0.291 0.149 302.717) |
| `color-pink-100` | oklch(0.948 0.028 342.258) | oklch(0.948 0.028 342.258) |
| `color-pink-200` | oklch(0.899 0.061 343.231) | oklch(0.899 0.061 343.231) |
| `color-pink-300` | oklch(0.823 0.12 346.018) | oklch(0.823 0.12 346.018) |
| `color-pink-400` | oklch(0.718 0.202 349.761) | oklch(0.718 0.202 349.761) |
| `color-pink-500` | oklch(0.656 0.241 354.308) | oklch(0.656 0.241 354.308) |
| `color-pink-700` | oklch(0.525 0.223 3.958) | oklch(0.525 0.223 3.958) |
| `color-pink-950` | oklch(0.284 0.109 3.907) | oklch(0.284 0.109 3.907) |
