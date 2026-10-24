/**
 * Focuses the first open tab matching a `chrome.tabs.query` URL pattern and
 * its window. Returns false (touching nothing) when no tab matches, so the
 * caller can open a new one.
 */
export async function focusExistingTab(urlPattern: string): Promise<boolean> {
  const [existing] = await chrome.tabs.query({ url: urlPattern })
  if (existing?.id === undefined) return false
  await chrome.tabs.update(existing.id, { active: true })
  if (existing.windowId !== undefined) {
    await chrome.windows.update(existing.windowId, { focused: true })
  }
  return true
}
