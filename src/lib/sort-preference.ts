import { type SortOrder, isSortOrder } from "@/lib/sort-sites"

const STORAGE_KEY = "url-gallery-sort"
const DEFAULT_ORDER: SortOrder = "savedAt"

type SortStorage = Pick<Storage, "getItem" | "setItem">

/**
 * The sort choice lives in sessionStorage: it survives a reload of this tab and is forgotten when
 * the tab closes. Storage can be missing or blocked, so every access is guarded.
 */
const tabStorage = (): SortStorage => window.sessionStorage

export function loadSortOrder(getStorage: () => SortStorage = tabStorage): SortOrder {
  try {
    const stored = getStorage().getItem(STORAGE_KEY)
    return isSortOrder(stored) ? stored : DEFAULT_ORDER
  } catch {
    return DEFAULT_ORDER
  }
}

export function saveSortOrder(order: SortOrder, getStorage: () => SortStorage = tabStorage): void {
  try {
    getStorage().setItem(STORAGE_KEY, order)
  } catch {}
}
