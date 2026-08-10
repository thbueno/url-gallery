import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Races a promise against a deadline so a slow/hung dependency (e.g. a stuck
// IndexedDB connection) can never block a caller indefinitely — resolves to
// `undefined` on timeout instead of rejecting, since callers use this only
// for best-effort UI enhancements that are safe to skip.
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | undefined> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(undefined), timeoutMs)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      () => {
        clearTimeout(timer)
        resolve(undefined)
      }
    )
  })
}
