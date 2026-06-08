import { useEffect, useState } from "react"

import "@/style.css"

import { Badge } from "@/components/ui/badge"
import { type SavedSite, savedSiteStore } from "@/lib/store"

export default function GalleryPage() {
  const [sites, setSites] = useState<SavedSite[]>([])
  const [blobUrls, setBlobUrls] = useState<Record<number, string>>({})

  useEffect(() => {
    savedSiteStore.getAll().then((all) => {
      setSites(all)

      // Create object URLs for thumb blobs
      const urls: Record<number, string> = {}
      for (const site of all) {
        if (site.id !== undefined && site.thumb instanceof Blob) {
          urls[site.id] = URL.createObjectURL(site.thumb)
        }
      }
      setBlobUrls(urls)
    })
  }, [])

  // Revoke blob URLs on unmount
  useEffect(() => {
    return () => {
      for (const url of Object.values(blobUrls)) {
        URL.revokeObjectURL(url)
      }
    }
  }, [blobUrls])

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <h1 className="text-2xl font-bold mb-6">URL Gallery</h1>

      {sites.length === 0 ? (
        <p className="text-muted-foreground">
          No saved sites yet. Click the bookmark button on any page to save it.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {sites.map((site) => {
            const thumbUrl = site.id !== undefined ? blobUrls[site.id] : undefined
            return (
              <li
                key={site.id}
                className="flex items-center gap-4 rounded-lg border border-border p-4"
              >
                {thumbUrl ? (
                  <img src={thumbUrl} alt={site.title} className="w-24 h-16 object-cover rounded" />
                ) : (
                  <div className="w-24 h-16 bg-muted rounded flex items-center justify-center">
                    {site.favicon ? (
                      <img src={site.favicon} alt="" className="w-8 h-8" />
                    ) : (
                      <span className="text-muted-foreground text-xs">No image</span>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <span className="font-medium truncate">{site.title}</span>
                  <span className="text-xs text-muted-foreground truncate">{site.url}</span>
                  <Badge variant="secondary" className="w-fit">
                    {site.category}
                  </Badge>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
