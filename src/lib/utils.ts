import type { Updater } from "@tanstack/vue-table"
import type { ClassValue } from "clsx"
import type { Ref } from "vue"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
  ref.value
    = typeof updaterOrValue === "function"
      ? updaterOrValue(ref.value)
      : updaterOrValue
}

export const minutesToTime = (totalMin: number, wrap24 = false): string => {
  if (totalMin == null) return '-'
  let h = Math.floor(totalMin / 60)
  const m = Math.floor(totalMin % 60)
  if (wrap24) {
    h = h % 24
  }
  return `${h}:${m.toString().padStart(2, '0')}`
}
