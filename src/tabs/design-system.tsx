import "@/style.css"

import {
  BookmarkIcon,
  ChartNoAxesColumnIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  GridIcon,
  LayersIcon,
  LayoutGridIcon,
  PaletteIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PlusIcon,
  TagIcon,
  Trash2Icon,
  TypeIcon,
} from "lucide-react"
import { useState } from "react"

import { BulkActionBar } from "@/components/gallery/BulkActionBar"
import { DataMenu } from "@/components/gallery/DataMenu"
import { GalleryEmptyState } from "@/components/gallery/GalleryEmptyState"
import { GalleryGrid } from "@/components/gallery/GalleryGrid"
import { GalleryHeader } from "@/components/gallery/GalleryHeader"
import { GallerySkeleton } from "@/components/gallery/GallerySkeleton"
import { HeaderButton } from "@/components/gallery/HeaderButton"
import { NavRow } from "@/components/gallery/NavRow"
import { OverviewPlaceholder } from "@/components/gallery/OverviewPlaceholder"
import { PermissionBanner } from "@/components/gallery/PermissionBanner"
import { PinnedTagChips } from "@/components/gallery/PinnedTagChips"
import { SearchBox } from "@/components/gallery/SearchBox"
import { SeedDbButton } from "@/components/gallery/SeedDbButton"
import { SelectModeButton } from "@/components/gallery/SelectModeButton"
import { SidebarFooter } from "@/components/gallery/SidebarFooter"
import { SidebarIconButton } from "@/components/gallery/SidebarIconButton"
import { SidebarInput } from "@/components/gallery/SidebarInput"
import { SidebarNav } from "@/components/gallery/SidebarNav"
import { SidebarRail } from "@/components/gallery/SidebarRail"
import { SidebarShell } from "@/components/gallery/SidebarShell"
import { SortMenu } from "@/components/gallery/SortMenu"
import { TagList } from "@/components/gallery/TagList"
import { ThemeToggle } from "@/components/gallery/ThemeToggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import type { SortOrder } from "@/lib/sort-sites"
import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"

// ── Token display helpers ────────────────────────────────────────────────────

const colorTokens = [
  { token: "--background", label: "Background" },
  { token: "--foreground", label: "Foreground" },
  { token: "--card", label: "Card" },
  { token: "--card-foreground", label: "Card FG" },
  { token: "--primary", label: "Primary" },
  { token: "--primary-foreground", label: "Primary FG" },
  { token: "--secondary", label: "Secondary" },
  { token: "--secondary-foreground", label: "Secondary FG" },
  { token: "--muted", label: "Muted" },
  { token: "--muted-foreground", label: "Muted FG" },
  { token: "--accent", label: "Accent" },
  { token: "--accent-foreground", label: "Accent FG" },
  { token: "--destructive", label: "Destructive" },
  { token: "--border", label: "Border" },
  { token: "--input", label: "Input" },
  { token: "--ring", label: "Ring" },
  { token: "--sidebar", label: "Sidebar" },
  { token: "--sidebar-border", label: "Sidebar Border" },
  { token: "--surface-section", label: "Surface Section" },
  { token: "--surface-inner", label: "Surface Inner" },
  { token: "--surface-tertiary", label: "Surface Tertiary" },
  { token: "--surface-hover", label: "Surface Hover" },
  { token: "--tag-bg", label: "Tag BG" },
  { token: "--border-hover", label: "Border Hover" },
  { token: "--separator", label: "Separator" },
  { token: "--accent-soft", label: "Accent Soft" },
  { token: "--accent-soft-foreground", label: "Accent Soft FG" },
  { token: "--primary-gradient-from", label: "Gradient From" },
  { token: "--primary-gradient-to", label: "Gradient To" },
]

const shadowTokens = [
  { token: "--shadow-xs", label: "xs", className: "shadow-xs" },
  { token: "--shadow-sm", label: "sm", className: "shadow-sm" },
  { token: "--shadow-md", label: "md", className: "shadow-md" },
  { token: "--shadow-lg", label: "lg", className: "shadow-lg" },
  { token: "--shadow-pop", label: "pop", className: "shadow-pop" },
  { token: "--shadow-primary", label: "primary", className: "shadow-primary" },
]

const typeScale = [
  { token: "--text-xs", label: "xs · 11px", sample: "Caption text, timestamps, labels" },
  { token: "--text-sm", label: "sm · 13px", sample: "Body copy, secondary content" },
  { token: "--text-base", label: "base · 15px", sample: "Primary reading text" },
  { token: "--text-lg", label: "lg · 17px", sample: "Subheadings, card titles" },
  { token: "--text-xl", label: "xl · 20px", sample: "Section headings" },
  { token: "--text-2xl", label: "2xl · 24px", sample: "Page headings" },
  { token: "--text-3xl", label: "3xl · 30px", sample: "Display headings" },
]

const radiusTokens = [
  { token: "--radius-sm", label: "sm · 0.6r", className: "rounded-sm" },
  { token: "--radius", label: "base · r", className: "rounded-[var(--radius)]" },
  { token: "--radius-lg", label: "lg · 1.35r", className: "rounded-lg" },
  { token: "--radius-xl", label: "xl · 1.75r", className: "rounded-xl" },
  { token: "--radius-card", label: "card · 1.5r", className: "rounded-card" },
  { token: "--radius-inner", label: "inner · 1.5r − inset", className: "rounded-inner" },
]

// ── Section shell ────────────────────────────────────────────────────────────

function Section({
  id,
  label,
  title,
  children,
}: {
  id: string
  label: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-8 space-y-6">
      <div className="space-y-1">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </p>
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <Separator />
      </div>
      {children}
    </section>
  )
}

function DemoBox({
  label,
  children,
  className,
}: {
  label?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="space-y-2">
      {label && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
      )}
      <div
        className={cn(
          "flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-4",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

// ── Color swatch ─────────────────────────────────────────────────────────────

function ColorSwatch({ token, label }: { token: string; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-10 w-full rounded-md border shadow-sm"
        style={{ background: `hsl(var(${token}))` }}
      />
      <div className="space-y-0.5">
        <p className="font-mono text-[10px] font-medium text-foreground">{label}</p>
        <p className="font-mono text-[9px] text-muted-foreground">{token}</p>
      </div>
    </div>
  )
}

// ── Gallery card preview ──────────────────────────────────────────────────────

const DEMO_SITES = [
  {
    title: "Vercel",
    domain: "vercel.com",
    category: "Tools",
    favicon: "V",
    thumbColor: "from-zinc-900 to-zinc-700",
    accent: "bg-zinc-800",
  },
  {
    title: "Linear",
    domain: "linear.app",
    category: "Productivity",
    favicon: "L",
    thumbColor: "from-indigo-950 to-violet-900",
    accent: "bg-violet-900",
  },
  {
    title: "GitHub",
    domain: "github.com",
    category: "Dev",
    favicon: "G",
    thumbColor: "from-zinc-950 to-zinc-800",
    accent: "bg-zinc-900",
  },
]

function SiteCardPreview({ title, domain, category, favicon, thumbColor }: (typeof DEMO_SITES)[0]) {
  return (
    <div className="group flex w-[var(--card-min-width)] flex-col overflow-hidden rounded-card border bg-card shadow-sm transition-all duration-150 hover:shadow-md hover:ring-1 hover:ring-border-hover">
      {/* Thumbnail area */}
      <div className={cn("relative h-32 bg-gradient-to-br", thumbColor)}>
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <GridIcon className="h-16 w-16 text-white" />
        </div>
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="text-[10px]">
            {category}
          </Badge>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-1 p-3">
        <div className="flex items-center gap-2">
          <Avatar className="size-5 rounded-sm">
            <AvatarFallback className="rounded-sm text-[10px]">{favicon}</AvatarFallback>
          </Avatar>
          <span className="truncate text-[var(--text-sm)] font-medium text-card-foreground">
            {title}
          </span>
        </div>
        <span className="font-mono text-[var(--text-xs)] text-muted-foreground">{domain}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t px-3 py-2">
        <span className="font-mono text-[var(--text-xs)] text-muted-foreground">0 visits</span>
        <Button variant="ghost" size="icon" className="size-6 text-muted-foreground">
          <ExternalLinkIcon className="size-3" />
        </Button>
      </div>
    </div>
  )
}

function SiteCardSkeleton() {
  return (
    <div className="flex w-[var(--card-min-width)] flex-col overflow-hidden rounded-card border bg-card shadow-sm">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-5 rounded-sm" />
          <Skeleton className="h-3.5 w-24" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="flex items-center justify-between border-t px-3 py-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="size-6 rounded-md" />
      </div>
    </div>
  )
}

// ── Gallery feature components (real components, demo props) ──────────────────

const DEMO_TAGS = ["Video", "Music", "Dev Tools", "Docs", "Uncategorized"]

const DEMO_GRID_SITES: SavedSite[] = DEMO_SITES.map((site, i) => ({
  id: i + 1,
  url: `https://${site.domain}`,
  title: site.title,
  favicon: null,
  thumb: null,
  tags: [DEMO_TAGS[i % DEMO_TAGS.length] ?? "Uncategorized"],
  savedAt: 0,
  openCount: 0,
  pinned: i === 0,
}))

function GalleryComponentsDemo() {
  const [query, setQuery] = useState("")
  const [active, setActive] = useState<string[]>([])
  const [collapsed, setCollapsed] = useState(false)
  const [selected, setSelected] = useState(2)
  const [sort, setSort] = useState<SortOrder>("savedAt")
  const [selectOn, setSelectOn] = useState(false)

  return (
    <>
      <DemoBox label="GalleryHeader — SortMenu + PinnedTagChips (centre slot) + Select toggle">
        <GalleryHeader
          className="w-full"
          start={<SortMenu value={sort} onChange={setSort} />}
          center={
            <PinnedTagChips
              className="max-w-xl shrink-0"
              pinnedTags={["Video", "Dev Tools"]}
              activeTags={active}
              onSelect={setActive}
            />
          }
          end={<SelectModeButton selectMode={selectOn} onToggle={() => setSelectOn((v) => !v)} />}
        />
      </DemoBox>

      <DemoBox label="HeaderButton (idle, pressed) — SidebarIconButton (sm, destructive, md, lg) — SidebarInput (md, sm)">
        <HeaderButton>Idle</HeaderButton>
        <HeaderButton pressed>Pressed</HeaderButton>
        <SidebarIconButton aria-label="Add">
          <PlusIcon />
        </SidebarIconButton>
        <SidebarIconButton tone="destructive" aria-label="Delete">
          <Trash2Icon />
        </SidebarIconButton>
        <SidebarIconButton size="md" aria-label="Collapse">
          <PanelLeftCloseIcon />
        </SidebarIconButton>
        <SidebarIconButton size="lg" aria-label="Expand">
          <PanelLeftOpenIcon />
        </SidebarIconButton>
        <SidebarInput className="w-40" placeholder="Search sites" />
        <SidebarInput size="sm" className="w-40" placeholder="New tag name…" />
      </DemoBox>

      <DemoBox label="SearchBox (sidebar search field)">
        <SearchBox className="w-60" value={query} onChange={setQuery} />
      </DemoBox>

      <DemoBox label="NavRow — idle, active, with count, compact (icon-only rail)">
        <div className="flex w-60 flex-col gap-0.5 rounded-card bg-surface-section p-1.5">
          <NavRow active icon={<LayoutGridIcon />} label="Gallery" count={24} onClick={() => {}} />
          <NavRow icon={<ChartNoAxesColumnIcon />} label="Overview" onClick={() => {}} />
        </div>
        <div className="flex w-12 flex-col gap-0.5 rounded-card bg-surface-section p-1.5">
          <NavRow compact active icon={<LayoutGridIcon />} label="Gallery" onClick={() => {}} />
          <NavRow compact icon={<ChartNoAxesColumnIcon />} label="Overview" onClick={() => {}} />
        </div>
      </DemoBox>

      <DemoBox label="ThemeToggle (segmented light / dark)">
        <ThemeToggle className="w-60" />
      </DemoBox>

      <DemoBox label="OverviewPlaceholder">
        <OverviewPlaceholder className="w-full" />
      </DemoBox>

      <DemoBox label="BulkActionBar (select mode)">
        <BulkActionBar
          className="max-w-2xl shrink-0"
          selectedCount={selected}
          tagNames={DEMO_TAGS}
          onAddTag={() => setSelected((n) => n + 1)}
          onRemoveTag={() => setSelected((n) => Math.max(0, n - 1))}
          onDelete={() => setSelected(0)}
          onClear={() => setSelected(0)}
        />
      </DemoBox>

      <DemoBox label="PermissionBanner">
        <PermissionBanner className="w-full" onDismiss={() => {}} onGranted={() => {}} />
      </DemoBox>

      <DemoBox label="GalleryEmptyState — no results / no sites">
        <GalleryEmptyState
          className="w-72"
          searchQuery="figma"
          activeTags={[]}
          onClearSearch={() => {}}
        />
        <GalleryEmptyState
          className="w-72"
          searchQuery=""
          activeTags={[]}
          onClearSearch={() => {}}
        />
      </DemoBox>

      <DemoBox label="GalleryGrid — virtualized cards (scrolls inside a fixed height)">
        <GalleryGrid
          className="h-96 w-full"
          sites={DEMO_GRID_SITES}
          isLoading={false}
          searchQuery=""
          activeTags={active}
          availableTags={DEMO_TAGS}
          selectMode={false}
          selectedIds={new Set()}
          onOpenSite={() => {}}
          onTagsChange={() => {}}
          onPinToggle={() => {}}
          onDeleteSite={() => {}}
          onToggleSelect={() => {}}
          onClearSearch={() => {}}
        />
      </DemoBox>

      <DemoBox label="SeedDbButton (dev only — confirming inserts synthetic sites into the local DB)">
        <SeedDbButton className="flex-none" onSeeded={async () => {}} />
      </DemoBox>

      <DemoBox label="GallerySkeleton">
        <GallerySkeleton className="w-full" cols={3} />
      </DemoBox>

      <DemoBox
        label="SidebarShell — search, SidebarNav, TagList, SidebarFooter (DataMenu + ThemeToggle)"
        className="items-start"
      >
        <SidebarShell
          className="h-[34rem]"
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          rail={
            <SidebarRail
              page="gallery"
              totalSites={15}
              onPageChange={() => {}}
              onSearch={() => setCollapsed(false)}
            />
          }
          footer={
            <SidebarFooter status="Backup downloaded">
              <DataMenu onExport={() => {}} onImportFile={() => {}} onCopyForAI={() => {}} />
              <ThemeToggle />
            </SidebarFooter>
          }
        >
          <SearchBox value={query} onChange={setQuery} />
          <SidebarNav className="px-0.5" page="gallery" totalSites={15} onPageChange={() => {}} />
          <TagList
            className="min-h-0 flex-1"
            tags={DEMO_TAGS.map((name, i) => ({ name, count: i + 1 }))}
            activeTags={active}
            pinnedTags={["Video"]}
            tagOrder={DEMO_TAGS}
            totalCount={15}
            onSelect={setActive}
            onTogglePinTag={() => {}}
            onRenameTag={async () => {}}
            onDeleteTag={async () => {}}
            onAddTag={async () => {}}
            onReorderTags={() => {}}
          />
        </SidebarShell>
      </DemoBox>
    </>
  )
}

// ── Sidebar nav ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "colors", label: "Colors", icon: PaletteIcon },
  { id: "typography", label: "Typography", icon: TypeIcon },
  { id: "radius", label: "Radius", icon: LayersIcon },
  { id: "elevation", label: "Elevation", icon: LayersIcon },
  { id: "buttons", label: "Buttons", icon: GridIcon },
  { id: "badges", label: "Badges", icon: BookmarkIcon },
  { id: "inputs", label: "Inputs", icon: TypeIcon },
  { id: "cards", label: "Cards", icon: LayersIcon },
  { id: "feedback", label: "Feedback", icon: GridIcon },
  { id: "dropdown", label: "Dropdown Menu", icon: ChevronDownIcon },
  { id: "gallery-preview", label: "Gallery Preview", icon: GridIcon },
  { id: "gallery-components", label: "Gallery Components", icon: LayersIcon },
]

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DesignSystem() {
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-sidebar shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-4">
          <div className="flex size-6 items-center justify-center rounded bg-primary">
            <BookmarkIcon className="size-3 text-primary-foreground" />
          </div>
          <div>
            <p className="text-[var(--text-sm)] font-semibold text-sidebar-foreground">
              URL Gallery
            </p>
            <p className="font-mono text-[9px] text-muted-foreground">Design System</p>
          </div>
        </div>

        <ScrollArea className="flex-1 py-3">
          <nav className="space-y-0.5 px-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[var(--text-sm)]",
                  "text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="size-3.5 shrink-0" />
                {item.label}
              </a>
            ))}
          </nav>
        </ScrollArea>

        <div className="border-t border-sidebar-border px-4 py-3">
          <p className="font-mono text-[9px] text-muted-foreground">
            dev only · NODE_ENV=development
          </p>
        </div>
      </aside>

      {/* Content */}
      <main className="scrollbar-minimal flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl space-y-16 px-10 py-10">
          {/* Page header */}
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Design System
            </h1>
            <p className="text-[var(--text-base)] text-muted-foreground">
              All tokens, primitives, and patterns for URL Gallery. Every value reads from{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[var(--text-xs)]">
                src/style.css
              </code>
              .
            </p>
          </div>

          {/* ── Foundation: Colors ─────────────────────────────────── */}
          <Section id="colors" label="Foundation" title="Color Tokens">
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {colorTokens.map((t) => (
                <ColorSwatch key={t.token} token={t.token} label={t.label} />
              ))}
            </div>
          </Section>

          {/* ── Foundation: Typography ─────────────────────────────── */}
          <Section id="typography" label="Foundation" title="Type Scale">
            <div className="space-y-1 divide-y divide-border rounded-lg border">
              {typeScale.map(({ token, label, sample }) => (
                <div
                  key={token}
                  className="flex items-baseline gap-6 px-4 py-3 first:pt-4 last:pb-4"
                >
                  <span
                    className="w-36 shrink-0 text-foreground"
                    style={{ fontSize: `var(${token})` }}
                  >
                    {sample}
                  </span>
                  <span className="font-mono text-[var(--text-xs)] text-muted-foreground">
                    {label}
                  </span>
                  <code className="ml-auto font-mono text-[var(--text-xs)] text-muted-foreground">
                    {token}
                  </code>
                </div>
              ))}
            </div>
            <DemoBox label="Font family — sans (Inter, bundled locally)">
              <span className="font-sans text-[var(--text-base)] text-foreground">
                The quick brown fox jumps over the lazy dog 0123456789
              </span>
            </DemoBox>
            <DemoBox label="Font family — display (headings)">
              <span className="font-display text-xl font-semibold text-foreground">
                URL Gallery — save the web you love
              </span>
            </DemoBox>
            <DemoBox label="Font family — mono">
              <span className="font-mono text-[var(--text-sm)] text-muted-foreground">
                github.com · vercel.com · linear.app
              </span>
            </DemoBox>
          </Section>

          {/* ── Foundation: Radius ────────────────────────────────── */}
          <Section id="radius" label="Foundation" title="Border Radius">
            <div className="flex flex-wrap gap-6">
              {radiusTokens.map(({ token, label, className: cls }) => (
                <div key={token} className="flex flex-col items-center gap-2">
                  <div className={cn("size-14 border-2 border-primary bg-muted", cls)} />
                  <div className="text-center">
                    <p className="font-mono text-[var(--text-xs)] font-medium text-foreground">
                      {label}
                    </p>
                    <p className="font-mono text-[9px] text-muted-foreground">{token}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Foundation: Elevation ─────────────────────────────── */}
          <Section id="elevation" label="Foundation" title="Elevation">
            <div className="flex flex-wrap gap-6">
              {shadowTokens.map(({ token, label, className: cls }) => (
                <div key={token} className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "size-16 rounded-card",
                      token === "--shadow-primary"
                        ? "bg-primary-gradient"
                        : "border bg-surface-inner",
                      cls
                    )}
                  />
                  <div className="text-center">
                    <p className="font-mono text-[var(--text-xs)] font-medium text-foreground">
                      {label}
                    </p>
                    <p className="font-mono text-[var(--text-xs)] text-muted-foreground">{token}</p>
                  </div>
                </div>
              ))}
            </div>
            <DemoBox label="Surfaces — section holds an inner tile">
              <div className="rounded-card bg-surface-section p-3">
                <div className="rounded-inner bg-surface-inner p-4 text-[var(--text-sm)] text-foreground">
                  Inner surface on a section surface
                </div>
              </div>
              <div className="rounded-card bg-surface-tertiary px-4 py-3 text-[var(--text-sm)] text-foreground">
                Tertiary surface
              </div>
            </DemoBox>
          </Section>

          {/* ── Components: Buttons ───────────────────────────────── */}
          <Section id="buttons" label="Components" title="Button">
            <DemoBox label="Variants">
              <Button variant="gradient">Gradient</Button>
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </DemoBox>
            <DemoBox label="Sizes">
              <Button size="lg">Large</Button>
              <Button size="default">Default</Button>
              <Button size="sm">Small</Button>
              <Button size="icon">
                <BookmarkIcon />
              </Button>
            </DemoBox>
            <DemoBox label="With icon">
              <Button variant="gradient">
                <BookmarkIcon />
                Save site
              </Button>
              <Button>
                <BookmarkIcon />
                Save site
              </Button>
              <Button variant="outline">
                <ExternalLinkIcon />
                Open link
              </Button>
            </DemoBox>
            <DemoBox label="States">
              <Button variant="gradient" disabled>
                Disabled gradient
              </Button>
              <Button disabled>Disabled</Button>
              <Button variant="outline" disabled>
                Disabled outline
              </Button>
            </DemoBox>
          </Section>

          {/* ── Components: Badges ────────────────────────────────── */}
          <Section id="badges" label="Components" title="Badge">
            <DemoBox label="Variants">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="tag">Tag</Badge>
            </DemoBox>
            <DemoBox label="Neutral tag chips (one style, no hue)">
              {[
                "Tools",
                "Reading",
                "Dev",
                "Design",
                "Productivity",
                "Reference",
                "Uncategorized",
              ].map((cat) => (
                <Badge key={cat} variant="tag">
                  {cat}
                </Badge>
              ))}
            </DemoBox>
            <DemoBox label="Neutral tag chips on a section surface" className="bg-surface-section">
              {["Tools", "Reading", "Dev"].map((cat) => (
                <Badge key={cat} variant="tag">
                  {cat}
                </Badge>
              ))}
            </DemoBox>
          </Section>

          {/* ── Components: Input ─────────────────────────────────── */}
          <Section id="inputs" label="Components" title="Input">
            <DemoBox label="States">
              <div className="flex w-full flex-col gap-3">
                <Input placeholder="Search saved sites…" className="max-w-sm" />
                <Input placeholder="Disabled" disabled className="max-w-sm" />
                <Input placeholder="With value" defaultValue="github.com" className="max-w-sm" />
              </div>
            </DemoBox>
          </Section>

          {/* ── Components: Cards ─────────────────────────────────── */}
          <Section id="cards" label="Components" title="Card">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Site</CardTitle>
                  <CardDescription>A site you fav-clicked while browsing.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-[var(--text-sm)] text-muted-foreground">
                    Thumbnail, favicon, title, domain, category, and open count.
                  </p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button size="sm">Open</Button>
                  <Button size="sm" variant="ghost">
                    Remove
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-muted-foreground">Empty state</CardTitle>
                  <CardDescription>No sites saved yet.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-[var(--text-sm)] text-muted-foreground">
                    Click the ★ button on any page to save it here.
                  </p>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ── Components: Feedback ──────────────────────────────── */}
          <Section id="feedback" label="Components" title="Feedback & Utilities">
            <DemoBox label="Avatar">
              <Avatar>
                <AvatarImage src="" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">AB</AvatarFallback>
              </Avatar>
              <Avatar className="size-6 rounded-sm">
                <AvatarFallback className="rounded-sm text-[10px]">V</AvatarFallback>
              </Avatar>
            </DemoBox>

            <DemoBox label="Skeleton — loading placeholder shapes">
              <div className="flex w-full flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-28 w-full rounded-card" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <Skeleton className="h-6 w-16 rounded-md" />
                </div>
              </div>
            </DemoBox>

            <DemoBox label="Separator">
              <div className="flex w-full flex-col gap-4">
                <div className="space-y-1">
                  <Separator />
                  <p className="font-mono text-[var(--text-xs)] text-muted-foreground">
                    horizontal
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[var(--text-sm)]">Tools</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-[var(--text-sm)]">Dev</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-[var(--text-sm)]">Reading</span>
                </div>
              </div>
            </DemoBox>
          </Section>

          {/* ── Components: Dropdown Menu ─────────────────────────── */}
          <Section id="dropdown" label="Components" title="Dropdown Menu">
            <DemoBox label="Category override (primary use-case)">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-md border bg-muted px-2.5 py-1.5 text-sm transition-colors hover:bg-accent"
                  >
                    <TagIcon className="size-3.5 text-muted-foreground" />
                    Dev Tools
                    <ChevronDownIcon className="size-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-36">
                  <DropdownMenuLabel className="text-[10px]">Change category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {[
                    "Video",
                    "Music",
                    "News",
                    "Social",
                    "Shopping",
                    "Dev Tools",
                    "Docs",
                    "Design",
                    "Uncategorized",
                  ].map((cat) => (
                    <DropdownMenuItem
                      key={cat}
                      className={cn(
                        "text-xs",
                        cat === "Dev Tools" && "font-medium text-accent-foreground"
                      )}
                    >
                      {cat}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </DemoBox>
          </Section>

          {/* ── Gallery Preview ───────────────────────────────────── */}
          <Section id="gallery-preview" label="Patterns" title="Gallery — Site Card Preview">
            <p className="text-[var(--text-sm)] text-muted-foreground">
              The SiteCard as it will appear in the gallery grid. All values use token variables —
              no hardcoded colors, sizes, or radius.
            </p>

            <DemoBox label="Populated cards">
              <div className="flex flex-wrap gap-[var(--gallery-gap)]">
                {DEMO_SITES.map((site) => (
                  <SiteCardPreview key={site.domain} {...site} />
                ))}
              </div>
            </DemoBox>

            <DemoBox label="Skeleton loading state">
              <div className="flex flex-wrap gap-[var(--gallery-gap)]">
                <SiteCardSkeleton />
                <SiteCardSkeleton />
                <SiteCardSkeleton />
              </div>
            </DemoBox>
          </Section>

          {/* ── Gallery feature components ────────────────────────── */}
          <Section id="gallery-components" label="Patterns" title="Gallery — Feature Components">
            <p className="text-[var(--text-sm)] text-muted-foreground">
              The real components the gallery page is composed from, rendered with demo props.
            </p>
            <GalleryComponentsDemo />
          </Section>
        </div>
      </main>
    </div>
  )
}
