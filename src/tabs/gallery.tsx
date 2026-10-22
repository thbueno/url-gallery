import "@/style.css"

if (process.env.NODE_ENV === "development") {
  import("react-grab")
}

import { ListChecksIcon, SearchIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { BulkActionBar } from "@/components/gallery/BulkActionBar"
import { DataMenu } from "@/components/gallery/DataMenu"
import { GalleryGrid } from "@/components/gallery/GalleryGrid"
import { GalleryHeader } from "@/components/gallery/GalleryHeader"
import { NavRow } from "@/components/gallery/NavRow"
import { OverviewPlaceholder } from "@/components/gallery/OverviewPlaceholder"
import { PermissionBanner } from "@/components/gallery/PermissionBanner"
import { PinnedTagChips } from "@/components/gallery/PinnedTagChips"
import { SearchBox } from "@/components/gallery/SearchBox"
import { SeedDbButton } from "@/components/gallery/SeedDbButton"
import { SidebarFooter } from "@/components/gallery/SidebarFooter"
import { SidebarNav } from "@/components/gallery/SidebarNav"
import { SidebarShell } from "@/components/gallery/SidebarShell"
import { SortMenu } from "@/components/gallery/SortMenu"
import { TagList } from "@/components/gallery/TagList"
import { ThemeToggle } from "@/components/gallery/ThemeToggle"
import { headerButtonVariants } from "@/components/gallery/header-button"
import { Button } from "@/components/ui/button"
import { useBackupActions } from "@/hooks/useBackupActions"
import { useBulkSelection } from "@/hooks/useBulkSelection"
import { useGalleryPage } from "@/hooks/useGalleryPage"
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
  const sortOrder = useGalleryStore((s) => s.sortOrder)
  const totalSites = useGalleryStore((s) => s.totalSites)
  const load = useGalleryStore((s) => s.load)
  const setSortOrder = useGalleryStore((s) => s.setSortOrder)
  const setSearchQuery = useGalleryStore((s) => s.setSearchQuery)
  const setActiveTags = useGalleryStore((s) => s.setActiveTags)

  const pinnedTags = useTagSettingsStore((s) => s.pinnedTags)
  const hydrateTags = useTagSettingsStore((s) => s.hydrate)
  const togglePinTag = useTagSettingsStore((s) => s.togglePinTag)
  const reorderTags = useTagSettingsStore((s) => s.reorderTags)

  const [showPermissionBanner, setShowPermissionBanner] = useState(false)
  const [sidebarCollapsed, toggleSidebar] = useSidebarCollapsed()
  const [page, setPage] = useGalleryPage()

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

  function selectTags(tags: string[]) {
    setPage("gallery")
    return setActiveTags(tags)
  }

  function changeSearch(value: string) {
    if (value.trim()) setPage("gallery")
    return setSearchQuery(value)
  }

  function goToGallery() {
    setPage("gallery")
    // Clicking "Gallery" while already on it resets the tag filter.
    if (page === "gallery" && activeTags.length > 0) void setActiveTags([])
  }

  return (
    <div className="flex h-screen gap-3 overflow-hidden bg-background p-3 text-foreground">
      <SidebarShell
        collapsed={sidebarCollapsed}
        onToggleCollapsed={toggleSidebar}
        rail={
          <div className="flex flex-col gap-0.5">
            <NavRow compact label="Search" icon={<SearchIcon />} onClick={toggleSidebar} />
            <SidebarNav compact page={page} totalSites={totalSites} onPageChange={setPage} />
          </div>
        }
        footer={
          <SidebarFooter status={backup.status}>
            <div className="flex items-center gap-1">
              <DataMenu
                className="flex-1 basis-4"
                onExport={backup.exportBackup}
                onImportFile={backup.importFile}
                onCopyForAI={backup.copyForAI}
              />
              {process.env.NODE_ENV === "development" ? (
                <SeedDbButton className="flex-1" onSeeded={load} />
              ) : null}
            </div>
            <ThemeToggle />
          </SidebarFooter>
        }
      >
        <SearchBox value={searchQuery} onChange={changeSearch} />
        <SidebarNav
          className="px-0.5"
          page={page}
          totalSites={totalSites}
          onPageChange={(next) => (next === "gallery" ? goToGallery() : setPage(next))}
        />
        <TagList
          className="min-h-0 flex-1"
          tags={tagList.mergedTags}
          activeTags={activeTags}
          pinnedTags={pinnedTags}
          tagOrder={tagList.effectiveTagOrder}
          totalCount={tagList.totalCount}
          onSelect={selectTags}
          onTogglePinTag={togglePinTag}
          onRenameTag={tagList.rename}
          onDeleteTag={tagList.remove}
          onAddTag={tagList.add}
          onReorderTags={reorderTags}
        />
      </SidebarShell>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {page === "overview" ? (
          <OverviewPlaceholder className="m-1" />
        ) : (
          <>
            <GalleryHeader
              className="px-4 pb-3 pt-2"
              start={<SortMenu value={sortOrder} onChange={setSortOrder} />}
              center={
                selection.selectMode ? (
                  <BulkActionBar
                    className="max-w-2xl shrink-0"
                    selectedCount={selection.selectedIds.size}
                    tagNames={tagList.mergedTags.map((t) => t.name)}
                    onAddTag={selection.addTagToSelected}
                    onRemoveTag={selection.removeTagFromSelected}
                    onDelete={selection.deleteSelected}
                    onClear={selection.clearSelection}
                  />
                ) : (
                  <PinnedTagChips
                    className="max-w-xl shrink-0"
                    pinnedTags={pinnedTags}
                    activeTags={activeTags}
                    onSelect={setActiveTags}
                  />
                )
              }
              end={
                <Button
                  variant="outline"
                  aria-pressed={selection.selectMode}
                  onClick={selection.toggleSelectMode}
                  className={headerButtonVariants({ pressed: selection.selectMode })}
                >
                  <ListChecksIcon className="text-muted-foreground" aria-hidden="true" />
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
          </>
        )}
      </main>
    </div>
  )
}
