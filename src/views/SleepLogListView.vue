<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface SleepLog {
  id: number
  sleep_date: string
  sleep_score: number
  sleep_duration: number
  bed_time: string
  wakeup_time: string
  wakeup_count: number
  deep_sleep_continuity: number
  deep_sleep_percentage: number
  light_sleep_percentage: number
  rem_sleep_percentage: number
}

const router = useRouter()
const route = useRoute()

const sleepLogs = ref<SleepLog[]>([])
const loading = ref(false)
const error = ref('')

// 現在の表示月 (YYYY-MM)
const currentMonth = ref('')

const fetchSleepLogs = async (month: string) => {
  loading.value = true
  error.value = ''
  try {
    const response = await fetch(`http://localhost:8787/api/sleep_logs?month=${month}`)
    if (!response.ok) throw new Error('Failed to fetch data')
    const json = await response.json()
    sleepLogs.value = json.data
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const getPreviousMonth = (month: string) => {
  const parts = month.split('-')
  if (parts.length < 2) return month
  const y = Number(parts[0])
  const m = Number(parts[1])
  const date = new Date(y, m - 1 - 1, 1) // month is 0-indexed in Date
  const year = date.getFullYear()
  const mo = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${year}-${mo}`
}

const getNextMonth = (month: string) => {
  const parts = month.split('-')
  if (parts.length < 2) return month
  const y = Number(parts[0])
  const m = Number(parts[1])
  const date = new Date(y, m - 1 + 1, 1)
  const year = date.getFullYear()
  const mo = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${year}-${mo}`
}

const handleMonthChange = (direction: 'prev' | 'next') => {
  const newMonth =
    direction === 'prev' ? getPreviousMonth(currentMonth.value) : getNextMonth(currentMonth.value)
  router.push({ query: { ...route.query, month: newMonth } })
}

const goToDetail = (id: number) => {
  router.push(`/logs/${id}`)
}

onMounted(() => {
  // 初期月設定: クエリパラメータがあればそれを使用、なければ現在月
  const queryMonth = route.query.month as string
  if (queryMonth && /^\d{4}-\d{2}$/.test(queryMonth)) {
    currentMonth.value = queryMonth
  } else {
    // Current month defaults
    const now = new Date()
    const y = now.getFullYear()
    const m = (now.getMonth() + 1).toString().padStart(2, '0')
    currentMonth.value = `${y}-${m}`
    // URLも更新しておく
    router.replace({ query: { ...route.query, month: currentMonth.value } })
  }
  fetchSleepLogs(currentMonth.value)
})

watch(
  () => route.query.month,
  (newMonth) => {
    if (newMonth && typeof newMonth === 'string' && /^\d{4}-\d{2}$/.test(newMonth)) {
      currentMonth.value = newMonth
      fetchSleepLogs(newMonth)
    }
  },
)

const formatDateWithDay = (dateString: string) => {
  const date = new Date(dateString)
  const days = ['日', '月', '火', '水', '木', '金', '土']
  const day = days[date.getUTCDay()]
  return `${dateString.replace(/-/g, '/')} (${day})`
}

const formatMonthDisplay = (monthStr: string) => {
  if (!monthStr) return ''
  const parts = monthStr.split('-')
  if (parts.length < 2) return monthStr
  return `${parts[0]}年 ${parseInt(parts[1] || '0')}月`
}

const getStyle = (val: number, min: number, max: number) => {
  if (val < min) return 'bg-blue-400 text-white'
  if (val > max) return 'bg-red-400 text-white'
  return ''
}

const getColorClass = (columnName: string, value: number) => {
  switch (columnName) {
    case 'sleep_score':
      return getStyle(value, 80, 100)

    case 'wakeup_count':
      return getStyle(value, 0, 1)

    case 'deep_sleep_continuity':
      return getStyle(value, 70, 100)

    case 'deep_sleep_percentage':
      return getStyle(value, 20, 60)

    case 'light_sleep_percentage':
      return getStyle(value, 0, 55)

    case 'rem_sleep_percentage':
      return getStyle(value, 10, 30)

    default:
      return ''
  }
}
</script>

<template>
  <div class="container mx-auto py-10">
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>睡眠ログ一覧</CardTitle>
            <CardDescription>過去の睡眠データの履歴です。</CardDescription>
          </div>
          <div class="flex items-center space-x-4">
            <Button variant="outline" size="icon" @click="handleMonthChange('prev')">
              <ChevronLeft class="h-4 w-4" />
            </Button>
            <span class="text-lg font-bold min-w-[100px] text-center">{{
              formatMonthDisplay(currentMonth)
            }}</span>
            <Button variant="outline" size="icon" @click="handleMonthChange('next')">
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="text-muted-foreground p-4">読み込み中...</div>
        <div v-else-if="error" class="text-destructive p-4">{{ error }}</div>

        <div v-else>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日付</TableHead>
                <TableHead>スコア</TableHead>
                <TableHead>入眠時間</TableHead>
                <TableHead>起床時間</TableHead>
                <TableHead>睡眠時間</TableHead>
                <TableHead>目が覚めた回数</TableHead>
                <TableHead>深い睡眠の持続性(点数)</TableHead>
                <TableHead>深い睡眠の割合(%)</TableHead>
                <TableHead>浅い睡眠の割合(%)</TableHead>
                <TableHead>レム睡眠の割合(%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="log in sleepLogs"
                :key="log.id"
                @click="goToDetail(log.id)"
                class="cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <TableCell class="font-medium">{{ formatDateWithDay(log.sleep_date) }}</TableCell>
                <TableCell :class="getColorClass('sleep_score', log.sleep_score)">
                  {{ log.sleep_score }}
                </TableCell>
                <TableCell>{{ log.bed_time }}</TableCell>
                <TableCell>{{ log.wakeup_time }}</TableCell>
                <TableCell :class="getColorClass('sleep_duration', log.sleep_duration)"
                  >{{
                    Math.floor(log.sleep_duration / 60)
                      .toString()
                      .padStart(2, '0')
                  }}時間{{ (log.sleep_duration % 60).toString().padStart(2, '0') }}分</TableCell
                >
                <TableCell :class="getColorClass('wakeup_count', log.wakeup_count)"
                  >{{ log.wakeup_count }}回</TableCell
                >
                <TableCell
                  :class="getColorClass('deep_sleep_continuity', log.deep_sleep_continuity)"
                  >{{ log.deep_sleep_continuity }}</TableCell
                >
                <TableCell
                  :class="getColorClass('deep_sleep_percentage', log.deep_sleep_percentage)"
                  >{{ log.deep_sleep_percentage }}%</TableCell
                >
                <TableCell
                  :class="getColorClass('light_sleep_percentage', log.light_sleep_percentage)"
                  >{{ log.light_sleep_percentage }}%</TableCell
                >
                <TableCell :class="getColorClass('rem_sleep_percentage', log.rem_sleep_percentage)"
                  >{{ log.rem_sleep_percentage }}%</TableCell
                >
              </TableRow>
              <TableRow v-if="sleepLogs.length === 0">
                <TableCell colspan="9" class="text-center py-10 text-muted-foreground">
                  この月のデータはありません。
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
