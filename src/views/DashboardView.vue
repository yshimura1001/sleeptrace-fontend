<script setup lang="ts">
import { ref } from 'vue'
import SleepSummaryTable from '@/components/dashboard/SleepSummaryTable.vue'
import WeeklySleepTable from '@/components/dashboard/WeeklySleepTable.vue'
import SleepTrendChart from '@/components/dashboard/SleepTrendChart.vue'

// 将来的にはここでデータをフェッチして各コンポーネントに渡す
const loading = ref(false)
const error = ref('')
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
      <!-- 1. サマリー統計表 -->
      <section>
        <h2 class="text-xl font-semibold mb-3">統計</h2>
        <SleepSummaryTable />
      </section>

      <!-- 2. 週間データ表 -->
      <section>
        <h2 class="text-xl font-semibold mb-3">週間データ</h2>
        <WeeklySleepTable />
      </section>

      <!-- 3. トレンドチャート -->
      <section>
        <SleepTrendChart />
      </section>
    </div>
  </div>
</template>
