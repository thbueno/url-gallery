import { useCallback, useEffect, useState } from "react"

import { useSiteSavedRefresh } from "@/hooks/useSiteSavedRefresh"
import { type OverviewStats, computeOverview } from "@/lib/overview-stats"
import { savedSiteStore } from "@/lib/store"

/** Overview numbers from every saved site (the gallery's search and tag filters don't apply). */
export function useOverview() {
  const [stats, setStats] = useState<OverviewStats | null>(null)

  const reload = useCallback(async () => {
    setStats(computeOverview(await savedSiteStore.getAll()))
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  useSiteSavedRefresh(reload)

  return { stats, reload }
}
