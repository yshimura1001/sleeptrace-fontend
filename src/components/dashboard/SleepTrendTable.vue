<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowUp, ArrowDown, Minus } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{
  trends?: {
    wakeup_count: number
    deep_sleep_continuity: number
    deep_sleep_percentage: number
    light_sleep_percentage: number
  }
  totalCount?: number
}>()

const trendItems = computed(() => {
  if (!props.trends) return []
  const t = props.trends
  return [
    { key: 'wakeup_count', label: '目が覚めた回数', slope: t.wakeup_count },
    { key: 'deep_sleep_continuity', label: '深い睡眠の持続性', slope: t.deep_sleep_continuity },
    { key: 'deep_sleep_percentage', label: '深い睡眠の割合', slope: t.deep_sleep_percentage },
    { key: 'light_sleep_percentage', label: '浅い睡眠の割合', slope: t.light_sleep_percentage },
  ]
})

const getTrendInfo = (key: string, slope: number) => {
  const isUp = slope > 0
  const isDown = slope < 0

  if (!isUp && !isDown) return { text: '-', color: 'text-muted-foreground', icon: Minus }

  // 改善 (Good) or 悪化 (Bad) determination
  let isImprovement = false

  switch (key) {
    case 'wakeup_count':
      // 下降が改善
      isImprovement = isDown
      break
    case 'light_sleep_percentage':
      // 下降が改善
      isImprovement = isDown
      break
    case 'deep_sleep_continuity':
    case 'deep_sleep_percentage':
      // 上昇が改善
      isImprovement = isUp
      break
  }

  const text = isImprovement ? '改善' : '悪化'
  // 改善=Green, 悪化=Red
  const color = isImprovement ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  const icon = isUp ? ArrowUp : ArrowDown

  return { text, color, icon }
}
</script>

<template>
  <div class="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden mb-6">
    <Table class="border-collapse border">
      <TableHeader class="bg-muted/50">
        <TableRow>
          <TableHead
            v-for="item in trendItems"
            :key="item.label"
            class="text-center border border-muted font-bold"
          >
            {{ item.label }}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="trendItems.length > 0">
          <TableCell
            v-for="item in trendItems"
            :key="item.label"
            class="text-center border border-muted"
          >
            <div v-if="item.slope !== 0" :class="['flex items-center justify-center font-bold', getTrendInfo(item.key, item.slope).color]">
              <component :is="getTrendInfo(item.key, item.slope).icon" class="w-5 h-5 mr-1" />
              {{ getTrendInfo(item.key, item.slope).text }}
            </div>
            <div v-else class="text-muted-foreground flex items-center justify-center">
              <Minus class="w-5 h-5" />
            </div>
          </TableCell>
        </TableRow>
        <TableRow v-else>
          <TableCell class="text-center text-muted-foreground p-4" :colspan="4">データがありません</TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <div class="bg-muted/50 p-2 text-right text-xs text-muted-foreground border-t">
      集計データ数: {{ props.totalCount ?? '-' }}件
    </div>
  </div>
</template>
