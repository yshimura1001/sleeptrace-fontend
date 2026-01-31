<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDark } from '@vueuse/core'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions
} from 'chart.js'
import { Line } from 'vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { authFetch } from '@/utils/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
)

interface SleepLog {
  id: number
  sleep_date: string
  sleep_score: number
  bed_time: string
  wakeup_time: string
  sleep_duration: number
  wakeup_count: number
  deep_sleep_continuity: number
  deep_sleep_percentage: number
  light_sleep_percentage: number
  rem_sleep_percentage: number
}

import { useRouter, useRoute } from 'vue-router'

const route = useRoute()

const sleepLogs = ref<SleepLog[]>([])
const loading = ref(true)
const error = ref('')

const fetchData = async () => {
  loading.value = true
  try {
    // 最新100件を取得
    let url = '/api/sleep_logs?limit=100'
    if (route.query.viewUser) {
        url += `&targetUserId=${route.query.viewUser}`
    }
    const res = await authFetch(url)
    if (!res.ok) throw new Error('Failed to fetch data')
    const json = await res.json()
    // 日付昇順に並び替え
    sleepLogs.value = (json.data as SleepLog[]).reverse()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

// --- Helper: Simple Linear Regression for Trend Line ---
const calculateTrendLine = (data: number[]) => {
  const n = data.length
  if (n === 0) return []

  const x = Array.from({ length: n }, (_, i) => i) // 0, 1, 2...
  const y = data

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * (y[i] ?? 0), 0)
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  return x.map(xi => slope * xi + intercept)
}

// --- Color Logic for Charts ---
const isDark = useDark()
const textColor = computed(() => isDark.value ? '#e5e7eb' : '#666') // gray-200 vs gray-500
const gridColor = computed(() => isDark.value ? '#374151' : '#e5e7eb') // gray-700 vs gray-200

// --- Common Chart Options ---
const commonOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    datalabels: {
      align: 'top',
      color: textColor.value,
      font: { size: 10 },
      formatter: (value: number) => Math.round(value * 10) / 10
    },
    legend: {
      position: 'top',
      labels: {
        color: textColor.value,
        usePointStyle: true,
        boxWidth: 20,
        generateLabels: (chart) => {
          const labels = ChartJS.defaults.plugins.legend.labels.generateLabels(chart)
          labels.forEach((label) => {
            label.fontColor = textColor.value
            if (label.datasetIndex === 0) {
              label.pointStyle = 'line'
            }
          })
          return labels
        }
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: textColor.value }
    },
    y: {
      grid: { color: gridColor.value },
      ticks: { color: textColor.value }
    }
  }
}))

// Specific options for charts with custom scales
const wakeupOptions = computed<ChartOptions<'line'>>(() => ({
  ...commonOptions.value,
  scales: {
    ...commonOptions.value.scales,
    y: {
      ...commonOptions.value.scales?.y,
      ticks: {
        ...commonOptions.value.scales?.y?.ticks,
        stepSize: 1
      }
    } as any // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}))

// Specific options for charts with custom scales
const deepContinuityOptions = computed<ChartOptions<'line'>>(() => ({
  ...commonOptions.value,
  scales: {
    ...commonOptions.value.scales,
    y: {
      ...commonOptions.value.scales?.y,
      max: 100
    }
  }
}))

const deepPercentageOptions = computed<ChartOptions<'line'>>(() => ({
  ...commonOptions.value,
  scales: {
    ...commonOptions.value.scales,
    y: {
      ...commonOptions.value.scales?.y,
      min: 10
    }
  }
}))

const lightPercentageOptions = computed<ChartOptions<'line'>>(() => ({
  ...commonOptions.value,
  scales: {
    ...commonOptions.value.scales,
    y: {
      ...commonOptions.value.scales?.y,
      max: 70
    }
  }
}))



// --- Helper: Create Dashed Line Canvas for Legend ---
const createDashedLineCanvas = (color: string) => {
  const canvas = document.createElement('canvas')
  canvas.width = 30
  canvas.height = 10
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(0, 5)
    ctx.lineTo(30, 5)
    ctx.stroke()
  }
  return canvas
}

// --- Chart 1: Wakeup Count ---
const wakeupChartData = computed<ChartData<'line'>>(() => {
  const labels = sleepLogs.value.map(l => l.sleep_date)
  const data = sleepLogs.value.map(l => l.wakeup_count)
  const trend = calculateTrendLine(data)

  return {
    labels,
    datasets: [
      {
        label: '目が覚めた回数',
        data,
        borderColor: '#60a5fa', // blue-400
        backgroundColor: '#60a5fa',
        tension: 0,
      },
      {
        label: '基準 (1回)',
        data: labels.map(() => 1),
        borderColor: '#f87171', // red-400
        backgroundColor: '#f87171',
        borderWidth: 2,
        pointRadius: 0,
        pointStyle: 'line',
        datalabels: { display: false }
      },
      {
        label: 'トレンド',
        data: trend,
        borderColor: '#93c5fd', // blue-300
        backgroundColor: '#93c5fd',
        borderDash: [5, 5],
        pointRadius: 0,
        pointStyle: createDashedLineCanvas('#93c5fd'),
        datalabels: { display: false }
      }
    ]
  }
})

// --- Chart 2: Light Sleep Percentage ---
const lightSleepChartData = computed<ChartData<'line'>>(() => {
  const labels = sleepLogs.value.map(l => l.sleep_date)
  const data = sleepLogs.value.map(l => l.light_sleep_percentage)
  const trend = calculateTrendLine(data)

  return {
    labels,
    datasets: [
      {
        label: '浅い睡眠 (%)',
        data,
        borderColor: '#60a5fa',
        backgroundColor: '#60a5fa',
        tension: 0,
      },
      {
        label: '基準 (55%)',
        data: labels.map(() => 55),
        borderColor: '#f87171', // red-400
        backgroundColor: '#f87171',
        borderWidth: 2,
        pointRadius: 0,
        pointStyle: 'line',
        datalabels: { display: false }
      },
      {
        label: 'トレンド',
        data: trend,
        borderColor: '#93c5fd',
        backgroundColor: '#93c5fd',
        borderDash: [5, 5],
        pointRadius: 0,
        pointStyle: createDashedLineCanvas('#93c5fd'),
        datalabels: { display: false }
      }
    ]
  }
})

// --- Chart 3: Deep Sleep Continuity ---
const deepSleepContinuityChartData = computed<ChartData<'line'>>(() => {
  const labels = sleepLogs.value.map(l => l.sleep_date)
  const data = sleepLogs.value.map(l => l.deep_sleep_continuity)
  const trend = calculateTrendLine(data)

  return {
    labels,
    datasets: [
      {
        label: '深い睡眠の持続性',
        data,
        borderColor: '#60a5fa',
        backgroundColor: '#60a5fa',
        tension: 0,
      },
      {
        label: '基準 (70点)',
        data: labels.map(() => 70),
        borderColor: '#f87171',
        backgroundColor: '#f87171',
        borderWidth: 2,
        pointRadius: 0,
        pointStyle: 'line',
        datalabels: { display: false }
      },
      {
        label: 'トレンド',
        data: trend,
        borderColor: '#93c5fd',
        backgroundColor: '#93c5fd',
        borderDash: [5, 5],
        pointRadius: 0,
        pointStyle: createDashedLineCanvas('#93c5fd'),
        datalabels: { display: false }
      }
    ]
  }
})

// --- Chart 4: Deep Sleep Percentage ---
const deepSleepPercentageChartData = computed<ChartData<'line'>>(() => {
  const labels = sleepLogs.value.map(l => l.sleep_date)
  const data = sleepLogs.value.map(l => l.deep_sleep_percentage)
  const trend = calculateTrendLine(data)

  return {
    labels,
    datasets: [
      {
        label: '深い睡眠 (%)',
        data,
        borderColor: '#60a5fa',
        backgroundColor: '#60a5fa',
        tension: 0,
      },
      {
        label: '上限 (60%)',
        data: labels.map(() => 60),
        borderColor: '#eab308', // yellow-500
        backgroundColor: '#eab308',
        borderWidth: 2,
        pointRadius: 0,
        pointStyle: 'line',
        datalabels: { display: false }
      },
      {
        label: '下限 (20%)',
        data: labels.map(() => 20),
        borderColor: '#f87171', // red-400
        backgroundColor: '#f87171',
        borderWidth: 2,
        pointRadius: 0,
        pointStyle: 'line',
        datalabels: { display: false }
      },
      {
        label: 'トレンド',
        data: trend,
        borderColor: '#93c5fd',
        backgroundColor: '#93c5fd',
        borderDash: [5, 5],
        pointRadius: 0,
        pointStyle: createDashedLineCanvas('#93c5fd'),
        datalabels: { display: false }
      }
    ]
  }
})

</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold tracking-tight mb-6">睡眠分析</h1>

    <div v-if="loading" class="text-center py-10">読み込み中...</div>
    <div v-else-if="error" class="text-center text-red-500 py-10">{{ error }}</div>

    <div v-else class="space-y-6">
      <!-- Chart 1 -->
      <Card>
        <CardHeader>
          <CardTitle>目が覚めた回数</CardTitle>
        </CardHeader>
        <CardContent class="h-[400px]">
          <Line :data="wakeupChartData" :options="wakeupOptions" />
        </CardContent>
      </Card>

      <!-- Chart 3 -->
      <Card>
        <CardHeader>
          <CardTitle>深い睡眠の持続性</CardTitle>
        </CardHeader>
        <CardContent class="h-[400px]">
          <Line :data="deepSleepContinuityChartData" :options="deepContinuityOptions" />
        </CardContent>
      </Card>

      <!-- Chart 4 -->
      <Card>
        <CardHeader>
          <CardTitle>深い睡眠の割合</CardTitle>
        </CardHeader>
        <CardContent class="h-[400px]">
          <Line :data="deepSleepPercentageChartData" :options="deepPercentageOptions" />
        </CardContent>
      </Card>

      <!-- Chart 2 -->
      <Card>
        <CardHeader>
          <CardTitle>浅い睡眠の割合</CardTitle>
        </CardHeader>
        <CardContent class="h-[400px]">
          <Line :data="lightSleepChartData" :options="lightPercentageOptions" />
        </CardContent>
      </Card>

      <div class="text-right text-sm text-muted-foreground">
        集計データ数：{{ sleepLogs.length }}件
      </div>
    </div>
  </div>
</template>
