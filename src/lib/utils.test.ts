import { describe, expect, it, vi } from "vitest"

import { withTimeout } from "@/lib/utils"

describe("withTimeout", () => {
  it("resolves with the value when the promise settles before the deadline", async () => {
    const result = await withTimeout(Promise.resolve("done"), 100)
    expect(result).toBe("done")
  })

  it("resolves to undefined instead of hanging when the promise never settles", async () => {
    vi.useFakeTimers()
    const neverResolves = new Promise<string>(() => {})

    const result = withTimeout(neverResolves, 2000)
    await vi.advanceTimersByTimeAsync(2000)

    await expect(result).resolves.toBeUndefined()
    vi.useRealTimers()
  })

  it("resolves to undefined instead of rejecting when the promise rejects", async () => {
    const result = await withTimeout(Promise.reject(new Error("boom")), 100)
    expect(result).toBeUndefined()
  })
})
