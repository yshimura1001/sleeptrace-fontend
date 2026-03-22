import type { Updater } from "@tanstack/vue-table"
import type { ClassValue } from "clsx"
import type { Ref } from "vue"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// CSSのクラス名を結合しつつ、Tailwindのクラス名の競合を解決する関数。(重複した場合、後者を優先。)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// TanStack TableのUpdater<T>に対応するためのヘルパー関数。
// 値そのもの、または「古い値を受け取って新しい値を返す関数」のどちらも受け入れ、Refの値を更新。
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
