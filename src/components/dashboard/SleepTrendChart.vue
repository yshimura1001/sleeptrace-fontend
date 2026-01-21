<script setup lang="ts">
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import { computed } from 'vue'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
)

const props = defineProps<{
  weeklyData: any[]
}>()

const chartData = computed<ChartData<'bar'>>(() => {
  // 曜日マッピング (月曜始まり: 1, 2, 3, 4, 5, 6, 0)
  const days = [
    { key: '1', label: '月' },
    { key: '2', label: '火' },
    { key: '3', label: '水' },
    { key: '4', label: '木' },
    { key: '5', label: '金' },
    { key: '6', label: '土' },
    { key: '0', label: '日' },
  ]

  const deepSleepData = days.map((day) => {
    const data = props.weeklyData.find((d) => d.day_of_week === day.key)
    return data ? Math.round(data.avg_deep_sleep_percentage) : 0
  })

  const durationData = days.map((day) => {
    const data = props.weeklyData.find((d) => d.day_of_week === day.key)
    // 分 -> 時間 (小数点第1位)
    return data ? Math.round((data.avg_duration / 60) * 10) / 10 : 0
  })

  return {
    labels: days.map((d) => d.label),
    datasets: [
      {
        type: 'line' as const,
        label: '深い睡眠 (%)',
        backgroundColor: '#f87171',
        borderColor: '#f87171',
        data: deepSleepData,
        yAxisID: 'y1',
        tension: 0.3,
        datalabels: {
          align: 'top',
          color: '#fff',
          formatter: (value: number) => value + '%',
        },
      } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      {
        type: 'bar',
        label: '夜間の睡眠 (時間)',
        backgroundColor: '#4d93f6',
        data: durationData, // 時間単位 (例: 6.4時間)
        yAxisID: 'y',
        barPercentage: 0.6,
        datalabels: {
          anchor: 'end',
          align: 'end',
          color: '#333',
          formatter: (value: number) => value.toFixed(1),
        },
      },
    ],
  }
})

const chartOptions: ChartOptions<'bar' | 'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 20,
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
    datalabels: {
      color: '#333',
      font: {
        weight: 'bold',
      },
    } as any, // Plugin specific types might be tricky, casting to any for plugins config
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: '睡眠時間 (h)',
      },
      min: 0,
      suggestedMax: 8, // データラベルが見切れないように余白を確保
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      grid: {
        drawOnChartArea: false,
      },
      title: {
        display: true,
        text: '深い睡眠 (%)',
      },
      min: 0,
      max: 50, // パーセンテージなので適宜調整
    },
  },
}
</script>

<template>
  <div class="w-full h-[400px] mt-8 p-4 bg-card rounded-md border shadow-sm">
    <h3 class="text-lg font-semibold mb-4">睡眠傾向 (週間)</h3>
    <div class="h-[320px]">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
