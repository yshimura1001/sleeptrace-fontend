export const minutesToTime = (totalMin: number, wrap24 = false): string => {
  if (totalMin == null) return '-'
  let h = Math.floor(totalMin / 60)
  const m = Math.floor(totalMin % 60)
  if (wrap24) {
    h = h % 24
  }
  return `${h}:${m.toString().padStart(2, '0')}`
}
