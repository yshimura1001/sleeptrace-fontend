<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface SleepLog {
  id: number
  sleep_date: string
  sleep_score: number
  sleep_duration: number
  // 他のフィールドも必要に応じて追加
}

const sleepLogs = ref<SleepLog[]>([])
const loading = ref(false)
const error = ref('')

const fetchSleepLogs = async () => {
  loading.value = true
  try {
    const response = await fetch('http://localhost:8787/api/sleep_logs')
    if (!response.ok) throw new Error('Failed to fetch data')
    sleepLogs.value = await response.json()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSleepLogs()
})
</script>

<template>
  <div class="py-10">
    <header>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">ダッシュボード</h1>
      </div>
    </header>
    <main>
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="px-4 py-8 sm:px-0">
          <div v-if="loading" class="text-gray-500">読み込み中...</div>
          <div v-else-if="error" class="text-red-500">{{ error }}</div>

          <div v-else class="flex flex-col">
            <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">スコア</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">睡眠時間</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="log in sleepLogs" :key="log.id">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ log.sleep_date }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ log.sleep_score }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ log.sleep_duration }}分</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>
