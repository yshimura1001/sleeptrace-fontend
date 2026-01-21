<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const weeklyData = [
  {
    day: '月',
    score: 85,
    bedTime: '23:45',
    wakeTime: '6:40',
    awakeCount: 0,
    deepSleepScore: 100,
    duration: '6:40',
    deep: 10,
    light: 62,
    rem: 20,
  },
  {
    day: '火',
    score: 83,
    bedTime: '23:36',
    wakeTime: '6:35',
    awakeCount: 1, // サンプルで赤くなってた箇所
    deepSleepScore: 100,
    duration: '6:49',
    deep: 11,
    light: 60,
    rem: 24,
  },
  {
    day: '水',
    score: 87,
    bedTime: '23:58',
    wakeTime: '6:50',
    awakeCount: 0,
    deepSleepScore: 100,
    duration: '6:32',
    deep: 12,
    light: 64,
    rem: 22,
  },
  {
    day: '木',
    score: 84,
    bedTime: '23:50',
    wakeTime: '6:45',
    awakeCount: 0,
    deepSleepScore: 100,
    duration: '6:54',
    deep: 9,
    light: 58,
    rem: 28,
  },
  {
    day: '金',
    score: 86,
    bedTime: '23:40',
    wakeTime: '6:30',
    awakeCount: 0,
    deepSleepScore: 100,
    duration: '6:30',
    deep: 13,
    light: 61,
    rem: 21,
  },
  {
    day: '土',
    score: 88,
    bedTime: '00:10',
    wakeTime: '7:00',
    awakeCount: 0,
    deepSleepScore: 100,
    duration: '6:20',
    deep: 14,
    light: 63,
    rem: 19,
  },
  {
    day: '日',
    score: 85,
    bedTime: '23:55',
    wakeTime: '6:40',
    awakeCount: 0,
    deepSleepScore: 100,
    duration: '6:19',
    deep: 11,
    light: 62,
    rem: 20,
  },
]

// 条件付きスタイル関数 (共通)
// 値が基準より小さい場合は青背景・白文字、大きい場合は赤背景・白文字
const getStyle = (val: number, min: number, max: number) => {
  if (val < min) return 'bg-blue-400 text-white'
  if (val > max) return 'bg-red-400 text-white'
  return ''
}

// 時間文字列 (H:MM) を分に変換して判定
const getDurationStyle = (durationStr: string) => {
  if (!durationStr) return ''
  const parts = durationStr.split(':')
  if (parts.length < 2) return ''

  const h = Number(parts[0])
  const m = Number(parts[1])

  if (isNaN(h) || isNaN(m)) return ''

  const totalMin = h * 60 + m
  // 基準: 6:00 (360分) - 10:00 (600分)
  return getStyle(totalMin, 360, 600)
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
        <TableRow v-for="(row, index) in weeklyData" :key="index">
          <TableCell class="font-medium">{{ row.day }}</TableCell>
          <TableCell :class="getStyle(row.score, 80, 100)">{{ row.score }}</TableCell>
          <TableCell>{{ row.bedTime }}</TableCell>
          <TableCell>{{ row.wakeTime }}</TableCell>
          <TableCell :class="getStyle(row.awakeCount, 0, 1)">{{ row.awakeCount }}</TableCell>
          <TableCell :class="getStyle(row.deepSleepScore, 90, 100)">{{
            row.deepSleepScore
          }}</TableCell>
          <TableCell :class="getDurationStyle(row.duration)">{{ row.duration }}</TableCell>
          <TableCell :class="getStyle(row.deep, 10, 20)">{{ row.deep }}%</TableCell>
          <TableCell :class="getStyle(row.light, 50, 60)">{{ row.light }}%</TableCell>
          <TableCell :class="getStyle(row.rem, 20, 30)">{{ row.rem }}%</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
