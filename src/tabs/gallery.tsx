import "@/style.css"

if (process.env.NODE_ENV === "development") {
  import("react-grab")
}

import { useEffect, useState } from "react"

import { BulkActionBar } from "@/components/gallery/BulkActionBar"
import { DataMenu } from "@/components/gallery/DataMenu"
import { GalleryGrid } from "@/components/gallery/GalleryGrid"
import { GalleryHeader } from "@/components/gallery/GalleryHeader"
import { PermissionBanner } from "@/components/gallery/PermissionBanner"
import { PinnedTagChips } from "@/components/gallery/PinnedTagChips"
import { SearchBox } from "@/components/gallery/SearchBox"
import { SeedDbButton } from "@/components/gallery/SeedDbButton"
import { SidebarFooter } from "@/components/gallery/SidebarFooter"
import { SidebarShell } from "@/components/gallery/SidebarShell"
import { TagList } from "@/components/gallery/TagList"
import { ThemeToggle } from "@/components/gallery/ThemeToggle"
import { Button } from "@/components/ui/button"
import { useBackupActions } from "@/hooks/useBackupActions"
import { useBulkSelection } from "@/hooks/useBulkSelection"
import { useGalleryTags } from "@/hooks/useGalleryTags"
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed"
import { useSiteActions } from "@/hooks/useSiteActions"
import { useSiteSavedRefresh } from "@/hooks/useSiteSavedRefresh"
import { backfillThumbnails } from "@/lib/gallery-io"
import { useGalleryStore } from "@/store/galleryStore"
import { useTagSettingsStore } from "@/store/tagSettingsStore"

export default function GalleryPage() {
  const sites = useGalleryStore((s) => s.sites)
  const activeTags = useGalleryStore((s) => s.activeTags)
  const isLoading = useGalleryStore((s) => s.isLoading)
  const searchQuery = useGalleryStore((s) => s.searchQuery)
  const load = useGalleryStore((s) => s.load)
  const setSearchQuery = useGalleryStore((s) => s.setSearchQuery)
  const setActiveTags = useGalleryStore((s) => s.setActiveTags)

  const pinnedTags = useTagSettingsStore((s) => s.pinnedTags)
  const hydrateTags = useTagSettingsStore((s) => s.hydrate)
  const togglePinTag = useTagSettingsStore((s) => s.togglePinTag)
  const reorderTags = useTagSettingsStore((s) => s.reorderTags)

  const [showPermissionBanner, setShowPermissionBanner] = useState(false)
  const [sidebarCollapsed, toggleSidebar] = useSidebarCollapsed()

  const tagList = useGalleryTags()
  const siteActions = useSiteActions()
  const selection = useBulkSelection()
  const backup = useBackupActions({
    load,
    onThumbnailsSkipped: () => setShowPermissionBanner(true),
  })

  useEffect(() => {
    chrome.storage.local.get("permissionDeclined", (result) => {
      if (result.permissionDeclined === true) setShowPermissionBanner(true)
    })
    hydrateTags()
  }, [hydrateTags])

  useEffect(() => {
    load()
  }, [load])

  useSiteSavedRefresh(load)

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <SidebarShell
        collapsed={sidebarCollapsed}
        onToggleCollapsed={toggleSidebar}
        className="m-2"
        footer={
          <SidebarFooter status={backup.status}>
            <DataMenu
              onExport={backup.exportBackup}
              onImportFile={backup.importFile}
              onCopyForAI={backup.copyForAI}
            />
            {process.env.NODE_ENV === "development" ? <SeedDbButton onSeeded={load} /> : null}
            <ThemeToggle className="ml-auto" />
          </SidebarFooter>
        }
      >
        <TagList
          className="min-h-0 flex-1"
          tags={tagList.mergedTags}
          activeTags={activeTags}
          pinnedTags={pinnedTags}
          tagOrder={tagList.effectiveTagOrder}
          totalCount={tagList.totalCount}
          onSelect={setActiveTags}
          onTogglePinTag={togglePinTag}
          onRenameTag={tagList.rename}
          onDeleteTag={tagList.remove}
          onAddTag={tagList.add}
          onReorderTags={reorderTags}
        />
      </SidebarShell>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <GalleryHeader
          start={<SearchBox value={searchQuery} onChange={setSearchQuery} />}
          center={
            selection.selectMode ? (
              <BulkActionBar
                selectedCount={selection.selectedIds.size}
                tagNames={tagList.mergedTags.map((t) => t.name)}
                onAddTag={selection.addTagToSelected}
                onRemoveTag={selection.removeTagFromSelected}
                onDelete={selection.deleteSelected}
                onClear={selection.clearSelection}
              />
            ) : (
              <PinnedTagChips
                pinnedTags={pinnedTags}
                activeTags={activeTags}
                onSelect={setActiveTags}
              />
            )
          }
          end={
            <Button
              variant={selection.selectMode ? "outline" : "ghost"}
              size="sm"
              onClick={selection.toggleSelectMode}
            >
              {selection.selectMode ? "Cancel" : "Select"}
            </Button>
          }
        />

        {showPermissionBanner && (
          <PermissionBanner
            onDismiss={() => setShowPermissionBanner(false)}
            onGranted={() => void backfillThumbnails(null)}
          />
        )}

        <GalleryGrid
          className="min-h-0 flex-1"
          sites={sites}
          isLoading={isLoading}
          searchQuery={searchQuery}
          activeTags={activeTags}
          availableTags={tagList.effectiveTagOrder}
          selectMode={selection.selectMode}
          selectedIds={selection.selectedIds}
          onOpenSite={siteActions.openSite}
          onTagsChange={siteActions.changeTags}
          onPinToggle={siteActions.togglePinned}
          onDeleteSite={siteActions.removeSite}
          onToggleSelect={selection.toggleSelect}
          onClearSearch={() => setSearchQuery("")}
        />
      </main>
    </div>
  )
}
