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

// ダミーデータまたはプロップスとして受け取る想定
// 今回はサンプルに合わせて一旦内部で定義、後でProps化を検討
const props = defineProps<{
  statsData: any
  totalCount?: number
}>()

const minutesToTime = (totalMin: number, wrap24 = false) => {
  if (totalMin == null) return '-'
  let h = Math.floor(totalMin / 60)
  const m = Math.floor(totalMin % 60)
  if (wrap24) {
    h = h % 24
  }
  return `${h}:${m.toString().padStart(2, '0')}`
}

const computedSummaryData = computed(() => {
  if (!props.statsData) return []
  const s = props.statsData
  return [
    {
      label: '最小',
      score: s.min_score ?? '-',
      bedTime: '-', // 時間のMin/Maxは未実装
      wakeTime: '-',
      awakeCount: s.min_wakeup_count ?? '-',
      deepSleepScore: s.min_deep_sleep_continuity ?? '-',
      duration: minutesToTime(s.min_duration),
      deep: s.min_deep_sleep_percentage ? Math.round(s.min_deep_sleep_percentage) + '%' : '-',
      light: s.min_light_sleep_percentage ? Math.round(s.min_light_sleep_percentage) + '%' : '-',
      rem: s.min_rem_sleep_percentage ? Math.round(s.min_rem_sleep_percentage) + '%' : '-',
    },
    {
      label: '平均',
      score: s.avg_score ? Math.round(s.avg_score) : '-',
      bedTime: minutesToTime(s.avg_bed_time_min, true),
      wakeTime: minutesToTime(s.avg_wakeup_time_min, true),
      awakeCount: s.avg_wakeup_count != null ? Math.round(s.avg_wakeup_count * 10) / 10 : '-',
      deepSleepScore: s.avg_deep_sleep_continuity ? Math.round(s.avg_deep_sleep_continuity) : '-',
      duration: minutesToTime(s.avg_duration),
      deep: s.avg_deep_sleep_percentage ? Math.round(s.avg_deep_sleep_percentage) + '%' : '-',
      light: s.avg_light_sleep_percentage ? Math.round(s.avg_light_sleep_percentage) + '%' : '-',
      rem: s.avg_rem_sleep_percentage ? Math.round(s.avg_rem_sleep_percentage) + '%' : '-',
      isAverage: true, // 平均行の強調用
    },
    {
      label: '最大',
      score: s.max_score ?? '-',
      bedTime: '-',
      wakeTime: '-',
      awakeCount: s.max_wakeup_count ?? '-',
      deepSleepScore: s.max_deep_sleep_continuity ?? '-',
      duration: minutesToTime(s.max_duration),
      deep: s.max_deep_sleep_percentage ? Math.round(s.max_deep_sleep_percentage) + '%' : '-',
      light: s.max_light_sleep_percentage ? Math.round(s.max_light_sleep_percentage) + '%' : '-',
      rem: s.max_rem_sleep_percentage ? Math.round(s.max_rem_sleep_percentage) + '%' : '-',
    },
    {
      label: '基準値',
      score: '80-100点',
      bedTime: 'なし',
      wakeTime: 'なし',
      awakeCount: '0-1回',
      deepSleepScore: '70-100点',
      duration: '10:00以下',
      deep: '20-60%',
      light: '0-55%',
      rem: '10-30%',
      isReference: true, // 参考値行のスタイル用
    },
  ]
})

// 条件付きスタイル関数 (共通)
// 値が基準より小さい場合は青背景・白文字、大きい場合は赤背景・白文字
const getStyle = (val: number | string, min: number, max: number) => {
  if (typeof val !== 'number') return ''
  if (val < min) return 'bg-blue-400 text-white dark:bg-blue-400 dark:text-gray-100'
  if (val > max) return 'bg-red-400 text-white dark:bg-red-400 dark:text-gray-100'
  return ''
}

const getCellStyle = (row: any, field: string, min: number, max: number) => {
  if (row.isReference) return ''
  // %を含む文字列の場合はパースする
  let val = row[field]
  if (typeof val === 'string' && val.includes('%')) {
    val = parseFloat(val.replace('%', ''))
  }
  return getStyle(val, min, max)
}

const getDurationCellStyle = (row: any) => {
  if (row.isReference) return ''
  const durationStr = row.duration
  if (typeof durationStr !== 'string' || !durationStr.includes(':')) return ''

  const parts = durationStr.split(':')
  if (parts.length < 2) return ''
  const h = Number(parts[0])
  const m = Number(parts[1])

  if (isNaN(h) || isNaN(m)) return ''

  // 10時間 (600分) より長い場合は赤色
  const totalMinutes = h * 60 + m
  if (totalMinutes > 600) {
    return 'bg-red-400 text-white dark:bg-red-400 dark:text-gray-100'
  }
  return ''
}
</script>

<template>
  <div class="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
    <Table>
      <TableHeader class="bg-muted/50">
        <TableRow>
          <TableHead class="w-[80px]">項目</TableHead>
          <TableHead>点数</TableHead>
          <TableHead>入眠時間</TableHead>
          <TableHead>起床時間</TableHead>
          <TableHead>目が覚めた<br />回数</TableHead>
          <TableHead>深い睡眠の<br />持続性</TableHead>
          <TableHead>夜間の睡眠時間</TableHead>
          <TableHead>深い睡眠<br />(%)</TableHead>
          <TableHead>浅い睡眠<br />(%)</TableHead>
          <TableHead>レム睡眠<br />(%)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="(row, index) in computedSummaryData"
          :key="index"
          :class="{
            'bg-muted/30 font-medium': row.isAverage,
            'text-muted-foreground text-sm': row.isReference,
          }"
        >
          <TableCell class="font-bold">{{ row.label }}</TableCell>
          <TableCell>{{ row.score }}</TableCell>
          <TableCell>{{ row.bedTime }}</TableCell>
          <TableCell>{{ row.wakeTime }}</TableCell>
          <TableCell :class="getCellStyle(row, 'awakeCount', 0, 1)">{{ row.awakeCount }}</TableCell>
          <TableCell :class="getCellStyle(row, 'deepSleepScore', 70, 100)">{{
            row.deepSleepScore
          }}</TableCell>
          <TableCell :class="getDurationCellStyle(row)">{{ row.duration }}</TableCell>
          <TableCell :class="getCellStyle(row, 'deep', 20, 60)">{{ row.deep }}</TableCell>
          <TableCell :class="getCellStyle(row, 'light', 0, 55)">{{ row.light }}</TableCell>
          <TableCell :class="getCellStyle(row, 'rem', 10, 30)">{{ row.rem }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <div class="bg-muted/50 p-2 text-right text-xs text-muted-foreground border-t">
      集計データ数: {{ props.totalCount ?? '-' }}件
    </div>
  </div>
</template>
