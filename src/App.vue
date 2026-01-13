<script setup lang="ts">
import { ref, onMounted } from 'vue'

const sleepLogs = ref([])

// APIからデータを取得する関数
const fetchSleepLogs = async () => {
  const response = await fetch('http://localhost:8787/api/sleep')
  sleepLogs.value = await response.json()
}
// 画面が読み込まれた時に実行
onMounted(() => {
  fetchSleepLogs()
})
</script>

<template>
<div>
    <h2>睡眠ログ一覧</h2>
    <table border="1">
      <thead>
        <tr>
          <th>日付</th>
          <th>スコア</th>
          <th>睡眠時間</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in sleepLogs" :key="log.id">
          <td>{{ log.sleep_date }}</td>
          <td>{{ log.sleep_score }}</td>
          <td>{{ log.sleep_duration }}分</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
