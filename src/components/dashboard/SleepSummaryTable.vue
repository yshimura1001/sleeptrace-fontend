<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ダミーデータまたはプロップスとして受け取る想定
// 今回はサンプルに合わせて一旦内部で定義、後でProps化を検討
const summaryData = [
  {
    label: '最小',
    score: 83,
    bedTime: '23:36',
    wakeTime: '6:35',
    awakeCount: 0,
    deepSleepScore: 100,
    duration: '6:19',
    deep: '10%',
    light: '60%',
    rem: '20%',
  },
  {
    label: '平均',
    score: 85,
    bedTime: '23:44',
    wakeTime: '6:39',
    awakeCount: 0,
    deepSleepScore: 100,
    duration: '6:39',
    deep: '11%',
    light: '62%',
    rem: '24%',
    isAverage: true, // 平均行の強調用
  },
  {
    label: '最大',
    score: 87,
    bedTime: '23:58',
    wakeTime: '6:50',
    awakeCount: 0,
    deepSleepScore: 100,
    duration: '6:54',
    deep: '12%',
    light: '64%',
    rem: '28%',
  },
  {
    label: '参考値',
    score: '80-100',
    bedTime: 'なし',
    wakeTime: 'なし',
    awakeCount: '0-1回',
    deepSleepScore: '70-100',
    duration: 'なし',
    deep: '20-60%',
    light: '0-55%',
    rem: '10-30%',
    isReference: true, // 参考値行のスタイル用
  },
]
// 条件付きスタイル関数 (共通)
// 値が基準より小さい場合は青背景・白文字、大きい場合は赤背景・白文字
const getStyle = (val: number | string, min: number, max: number) => {
  if (typeof val !== 'number') return ''
  if (val < min) return 'bg-blue-400 text-white'
  if (val > max) return 'bg-red-400 text-white'
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
          <TableHead>夜間の睡眠<br />(時間)</TableHead>
          <TableHead>深い睡眠<br />(%)</TableHead>
          <TableHead>浅い睡眠<br />(%)</TableHead>
          <TableHead>レム睡眠<br />(%)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="(row, index) in summaryData"
          :key="index"
          :class="{
            'bg-muted/30 font-medium': row.isAverage,
            'text-muted-foreground text-sm': row.isReference,
          }"
        >
          <TableCell class="font-bold">{{ row.label }}</TableCell>
          <TableCell :class="getCellStyle(row, 'score', 80, 100)">{{ row.score }}</TableCell>
          <TableCell>{{ row.bedTime }}</TableCell>
          <TableCell>{{ row.wakeTime }}</TableCell>
          <TableCell :class="getCellStyle(row, 'awakeCount', 0, 1)">{{ row.awakeCount }}</TableCell>
          <TableCell :class="getCellStyle(row, 'deepSleepScore', 70, 100)">{{
            row.deepSleepScore
          }}</TableCell>
          <TableCell>{{ row.duration }}</TableCell>
          <TableCell :class="getCellStyle(row, 'deep', 20, 60)">{{ row.deep }}</TableCell>
          <TableCell :class="getCellStyle(row, 'light', 0, 55)">{{ row.light }}</TableCell>
          <TableCell :class="getCellStyle(row, 'rem', 10, 30)">{{ row.rem }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
