import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { SEED_TOTAL, seedDatabase } from "@/lib/gallery-io"
import { cn } from "@/lib/utils"

interface SeedDbButtonProps {
  /** Called after seeding finishes (reload the gallery). */
  onSeeded: () => Promise<void>
  className?: string
}

/** Dev-only button that fills the gallery with synthetic test sites. Callers gate on NODE_ENV. */
export function SeedDbButton({ onSeeded, className }: SeedDbButtonProps) {
  const [isSeeding, setIsSeeding] = useState(false)

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          disabled={isSeeding}
          className={cn(
            "h-7 justify-start px-2 text-[length:var(--text-xs)] text-muted-foreground",
            className
          )}
        >
          {isSeeding ? "Seeding…" : "Seed DB"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Seed the database with test data?</AlertDialogTitle>
          <AlertDialogDescription>
            This inserts {SEED_TOTAL} synthetic test site records with fake URLs cycling through a
            hardcoded domain list (github.com, stackoverflow.com, youtube.com, twitter.com,
            reddit.com, figma.com, docs.google.com, npmjs.com, medium.com, vercel.com). It is not
            real bookmarks or externally-fetched data — purely local synthetic data for exercising
            the gallery UI.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              setIsSeeding(true)
              await seedDatabase()
              await onSeeded()
              setIsSeeding(false)
            }}
          >
            Seed database
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
