<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface SleepLog {
  id: number
  sleep_date: string
  sleep_score: number
  sleep_duration: number
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
  <div class="container mx-auto py-10">
    <Card>
      <CardHeader>
        <CardTitle>ダッシュボード</CardTitle>
        <CardDescription>最近の睡眠ログ一覧です。</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="text-muted-foreground p-4">読み込み中...</div>
        <div v-else-if="error" class="text-destructive p-4">{{ error }}</div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>日付</TableHead>
              <TableHead>スコア</TableHead>
              <TableHead>睡眠時間</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="log in sleepLogs" :key="log.id">
              <TableCell class="font-medium">{{ log.sleep_date }}</TableCell>
              <TableCell>{{ log.sleep_score }}</TableCell>
              <TableCell>{{ log.sleep_duration }}分</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
