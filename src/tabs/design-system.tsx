import "@/style.css"

export default function DesignSystem() {
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="mb-8 text-2xl font-bold text-foreground">Design System</h1>
      <p className="text-sm text-muted-foreground">
        Components will appear here as they are built.
      </p>
    </div>
  )
}
