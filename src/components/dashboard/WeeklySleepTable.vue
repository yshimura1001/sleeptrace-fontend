<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { computed } from 'vue'

const props = defineProps<{
  weeklyData: any[]
  totalCount?: number
}>()

const minutesToTime = (totalMin: number, wrap24 = false) => {
  let h = Math.floor(totalMin / 60)
  const m = Math.floor(totalMin % 60)
  if (wrap24) {
    h = h % 24
  }
  return `${h}:${m.toString().padStart(2, '0')}`
}

const computedWeeklyData = computed(() => {
  const days = [
    { key: '1', label: '月' },
    { key: '2', label: '火' },
    { key: '3', label: '水' },
    { key: '4', label: '木' },
    { key: '5', label: '金' },
    { key: '6', label: '土' },
    { key: '0', label: '日' },
  ]

  return days.map((day) => {
    const data = props.weeklyData.find((d) => d.day_of_week === day.key)
    if (!data) {
      return {
        day: day.label,
        score: '-',
        bedTime: '-',
        wakeTime: '-',
        awakeCount: '-',
        deepSleepScore: '-',
        duration: '-',
        deep: '-',
        light: '-',
        rem: '-',
      }
    }

    return {
      day: day.label,
      score: Math.round(data.avg_score),
      bedTime: minutesToTime(data.avg_bed_time_min, true),
      wakeTime: minutesToTime(data.avg_wakeup_time_min, true),
      awakeCount: Math.round(data.avg_wakeup_count * 10) / 10, // 小数点1位まで
      deepSleepScore: Math.round(data.avg_deep_sleep_continuity),
      duration: minutesToTime(data.avg_duration),
      deep: Math.round(data.avg_deep_sleep_percentage),
      light: Math.round(data.avg_light_sleep_percentage),
      rem: Math.round(data.avg_rem_sleep_percentage),
    }
  })
})

// 条件付きスタイル関数 (共通)
// 値が基準より小さい場合は青背景・白文字、大きい場合は赤背景・白文字
// 判定ロジック: 「悪い」値を赤くする。

// 値が基準より小さいと「悪い」場合 (点数など) -> 赤
const getLowIsBadStyle = (val: number | string, min: number) => {
  if (typeof val !== 'number') return ''
  if (val < min) return 'bg-red-400 text-white dark:bg-red-400 dark:text-gray-100'
  return ''
}

// 値が基準より大きいと「悪い」場合 (回数など) -> 赤
const getHighIsBadStyle = (val: number | string, max: number) => {
  if (typeof val !== 'number') return ''
  if (val > max) return 'bg-red-400 text-white dark:bg-red-400 dark:text-gray-100'
  return ''
}

// 範囲外が「悪い」場合 (割合など) -> 赤
const getRangeOutStyle = (val: number | string, min: number, max: number) => {
  if (typeof val !== 'number') {
     // %つき文字列のパースなどは呼び出し元で行う想定、またはここで対応
     if (typeof val === 'string' && val.includes('%')) {
        val = parseFloat(val.replace('%', ''))
     } else {
        return ''
     }
  }
  if (val < min || val > max) return 'bg-red-400 text-white dark:bg-red-400 dark:text-gray-100'
  return ''
}

// 時間文字列 (H:MM) を分に変換して判定
// 基準: 6:00 (360分) 未満 or 10:00 (600分) 超過 -> 赤
const getDurationStyle = (durationStr: string) => {
  if (!durationStr) return ''
  const parts = durationStr.split(':')
  if (parts.length < 2) return ''

  const h = Number(parts[0])
  const m = Number(parts[1])

  if (isNaN(h) || isNaN(m)) return ''

  const totalMin = h * 60 + m
  if (totalMin < 360 || totalMin > 600) {
     return 'bg-red-400 text-white dark:bg-red-400 dark:text-gray-100'
  }
  return ''
}
</script>

<template>
  <div class="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden mt-6">
    <Table>
      <TableHeader class="bg-muted/50">
        <TableRow>
          <TableHead class="w-[80px]">曜日</TableHead>
          <TableHead>点数</TableHead>
          <TableHead>入眠時間</TableHead>
          <TableHead>起床時間</TableHead>
          <TableHead>目が覚めた<br />回数</TableHead>
          <TableHead>深い睡眠の<br />持続性</TableHead>
          <TableHead>夜間の睡眠<br />(時間)</TableHead>
          <TableHead>深い睡眠<br />(%)</TableHead>
          <TableHead>浅い睡眠<br />(%)</TableHead>
          <TableHead>レム睡眠<br />(%)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="(row, index) in computedWeeklyData" :key="index">
          <TableCell class="font-medium">{{ row.day }}</TableCell>
          <TableCell :class="getLowIsBadStyle(row.score, 80)">{{ row.score }}</TableCell>
          <TableCell>{{ row.bedTime }}</TableCell>
          <TableCell>{{ row.wakeTime }}</TableCell>
          <TableCell :class="getHighIsBadStyle(row.awakeCount, 1)">{{ row.awakeCount }}</TableCell>
          <TableCell :class="getLowIsBadStyle(row.deepSleepScore, 70)">{{
            row.deepSleepScore
          }}</TableCell>
          <TableCell :class="getDurationStyle(row.duration)">{{ row.duration }}</TableCell>
          <TableCell :class="getLowIsBadStyle(row.deep, 20)">{{ row.deep }}%</TableCell>
          <TableCell :class="getHighIsBadStyle(row.light, 55)">{{ row.light }}%</TableCell>
          <TableCell :class="getRangeOutStyle(row.rem, 10, 30)">{{ row.rem }}%</TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <div class="bg-muted/50 p-2 text-right text-xs text-muted-foreground border-t">
      集計データ数: {{ props.totalCount ?? '-' }}件
    </div>
  </div>
</template>
