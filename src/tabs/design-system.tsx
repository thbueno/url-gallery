import "@/style.css"

import {
  BookmarkIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  GridIcon,
  LayersIcon,
  PaletteIcon,
  TagIcon,
  TypeIcon,
} from "lucide-react"

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
  { token: "--radius-sm", label: "sm · 4px", className: "rounded-sm" },
  { token: "--radius", label: "base · 8px", className: "rounded-lg" },
  { token: "--radius-lg", label: "lg · 12px", className: "rounded-xl" },
  { token: "--radius-xl", label: "xl · 16px", className: "rounded-[var(--radius-xl)]" },
  { token: "--radius-card", label: "card · 12px", className: "rounded-card" },
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
    <div className="group flex w-[var(--card-min-width)] flex-col overflow-hidden rounded-card border bg-card shadow-sm transition-all duration-150 hover:shadow-md hover:ring-1 hover:ring-[hsl(var(--card-hover-ring))]">
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

// ── Sidebar nav ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "colors", label: "Colors", icon: PaletteIcon },
  { id: "typography", label: "Typography", icon: TypeIcon },
  { id: "radius", label: "Radius", icon: LayersIcon },
  { id: "buttons", label: "Buttons", icon: GridIcon },
  { id: "badges", label: "Badges", icon: BookmarkIcon },
  { id: "inputs", label: "Inputs", icon: TypeIcon },
  { id: "cards", label: "Cards", icon: LayersIcon },
  { id: "feedback", label: "Feedback", icon: GridIcon },
  { id: "dropdown", label: "Dropdown Menu", icon: ChevronDownIcon },
  { id: "gallery-preview", label: "Gallery Preview", icon: GridIcon },
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

          {/* ── Components: Buttons ───────────────────────────────── */}
          <Section id="buttons" label="Components" title="Button">
            <DemoBox label="Variants">
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
            </DemoBox>
            <DemoBox label="Category tags (primary use-case)">
              {["Tools", "Reading", "Dev", "Design", "Productivity", "Reference", "Video"].map(
                (cat) => (
                  <Badge key={cat} variant="secondary">
                    {cat}
                  </Badge>
                )
              )}
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
        </div>
      </main>
    </div>
  )
}
