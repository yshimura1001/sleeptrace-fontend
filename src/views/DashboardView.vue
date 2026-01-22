<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SleepSummaryTable from '@/components/dashboard/SleepSummaryTable.vue'
import WeeklySleepTable from '@/components/dashboard/WeeklySleepTable.vue'
import SleepTrendChart from '@/components/dashboard/SleepTrendChart.vue'
import SleepTrendTable from '@/components/dashboard/SleepTrendTable.vue'

const loading = ref(true)
const error = ref('')
const statsData = ref<any>(null)
const weeklyData = ref<any[]>([])

const fetchData = async () => {
  loading.value = true
  error.value = ''
  try {
    const [statsRes, weeklyRes] = await Promise.all([
      fetch('http://localhost:8787/api/dashboard/statistics'),
      fetch('http://localhost:8787/api/dashboard/weekly'),
    ])

    if (!statsRes.ok || !weeklyRes.ok) {
      throw new Error('Failed to fetch dashboard data')
    }

    const statsJson = await statsRes.json()
    const weeklyJson = await weeklyRes.json()

    statsData.value = statsJson.data
    weeklyData.value = weeklyJson.data
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="container mx-auto py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight">ダッシュボード</h1>
      <p class="text-muted-foreground">最近の睡眠ステータスの概要です。</p>
    </div>

    <div v-if="loading" class="text-muted-foreground p-4">読み込み中...</div>
    <div v-else-if="error" class="text-destructive p-4">{{ error }}</div>

    <div v-else class="space-y-6">
      <!-- 1. トレンド分析 -->
      <section>
        <h2 class="text-xl font-semibold mb-3">トレンド</h2>
        <SleepTrendTable :trends="statsData?.trends" :total-count="statsData?.count" />
      </section>

      <!-- 2. 統計表 -->
      <section>
        <h2 class="text-xl font-semibold mb-3">統計</h2>
        <SleepSummaryTable :stats-data="statsData" :total-count="statsData?.count" />
      </section>

      <!-- 2. 週間データ表 -->
      <section>
        <h2 class="text-xl font-semibold mb-3">週間データ</h2>
        <WeeklySleepTable
          :weekly-data="weeklyData"
          :total-count="weeklyData.reduce((acc, curr) => acc + (curr.count || 0), 0)"
        />
      </section>

      <!-- 3. トレンドチャート -->
      <section>
        <SleepTrendChart :weekly-data="weeklyData" />
      </section>
    </div>
  </div>
</template>
