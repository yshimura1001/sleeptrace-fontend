<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { authFetch } from '@/utils/api'

const router = useRouter()
const loading = ref(false)
const error = ref('')

// フォームの型定義
interface SleepLogForm {
  sleep_date: string
  sleep_score: number | null
  bed_time: string
  wakeup_time: string
  sleep_duration: number | null
  wakeup_count: number | null
  deep_sleep_continuity: number | null
  deep_sleep_percentage: number | null
  light_sleep_percentage: number | null
  rem_sleep_percentage: number | null
}

const formData = reactive<SleepLogForm>({
  sleep_date: '',
  sleep_score: null,
  bed_time: '',
  wakeup_time: '',
  sleep_duration: null,
  wakeup_count: null,
  deep_sleep_continuity: null,
  deep_sleep_percentage: null,
  light_sleep_percentage: null,
  rem_sleep_percentage: null,
})

// 睡眠時間の時間 (HH:MM)
const durationTime = ref<string>('')




const submitForm = async () => {
  loading.value = true
  error.value = ''

  try {
    // 睡眠時間の計算 (HH:MM -> 分)
    let totalMinutes = 0
    if (durationTime.value) {
      const parts = durationTime.value.split(':').map(Number)
      if (parts.length === 2 && parts[0] !== undefined && parts[1] !== undefined) {
          totalMinutes = parts[0] * 60 + parts[1]
      }
    }
    formData.sleep_duration = totalMinutes > 0 ? totalMinutes : null

    // 数値型への変換
    const deep = Number(formData.deep_sleep_percentage || 0)
    const light = Number(formData.light_sleep_percentage || 0)
    const rem = Number(formData.rem_sleep_percentage || 0)

    // バリデーション: 合計が100%になるかチェック
    if (deep + light + rem !== 100) {
      throw new Error(
        `深い睡眠・浅い睡眠・レム睡眠の割合の合計は100%である必要があります。（現在: ${deep + light + rem}%）`,
      )
    }

    // 数値型への変換とnullチェック
    const payload = {
      ...formData,
      sleep_score: Number(formData.sleep_score),
      sleep_duration: Number(formData.sleep_duration),
      wakeup_count: Number(formData.wakeup_count),
      deep_sleep_continuity: Number(formData.deep_sleep_continuity),
      deep_sleep_percentage: Number(formData.deep_sleep_percentage),
      light_sleep_percentage: Number(formData.light_sleep_percentage),
      rem_sleep_percentage: Number(formData.rem_sleep_percentage),
    }

    const response = await authFetch('/api/sleep_logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to submit data')
    }

    // Success: redirect to dashboard
    await router.push('/')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
    <Card>
      <CardHeader>
        <CardTitle>睡眠データ登録</CardTitle>
        <CardDescription>日々の睡眠データを記録しましょう。</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          v-if="error"
          class="mb-4 bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm font-medium"
        >
          {{ error }}
        </div>

        <form @submit.prevent="submitForm" class="space-y-6">
          <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <!-- Date -->
            <div class="space-y-2">
              <Label for="sleep_date">日付</Label>
              <Input type="date" id="sleep_date" v-model="formData.sleep_date" required />
            </div>

            <!-- Score -->
            <div class="space-y-2">
              <Label for="sleep_score">睡眠スコア (0-100)</Label>
              <Input
                type="number"
                id="sleep_score"
                v-model="formData.sleep_score"
                min="0"
                max="100"
                required
              />
            </div>

            <!-- Bed Time -->
            <div class="space-y-2">
              <Label for="bed_time">就寝時間</Label>
              <Input type="time" id="bed_time" v-model="formData.bed_time" required />
            </div>

            <!-- Wakeup Time -->
            <div class="space-y-2">
              <Label for="wakeup_time">起床時間</Label>
              <Input type="time" id="wakeup_time" v-model="formData.wakeup_time" required />
            </div>

            <!-- Sleep Duration -->
            <div class="space-y-2">
              <Label for="duration_time">睡眠時間</Label>
              <Input
                type="time"
                id="duration_time"
                v-model="durationTime"
                required
              />
            </div>

            <!-- Wakeup Count -->
            <div class="space-y-2">
              <Label for="wakeup_count">目が覚めた回数</Label>
              <Input
                type="number"
                id="wakeup_count"
                v-model="formData.wakeup_count"
                min="0"
                required
              />
            </div>
          </div>

          <div class="border-t pt-6">
            <h3 class="text-lg font-medium leading-none tracking-tight mb-4">詳細データ (0-100)</h3>
            <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="deep_sleep_continuity">深い睡眠の持続性</Label>
                <Input
                  type="number"
                  id="deep_sleep_continuity"
                  v-model="formData.deep_sleep_continuity"
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="deep_sleep_percentage">深い睡眠の割合 (%)</Label>
                <Input
                  type="number"
                  id="deep_sleep_percentage"
                  v-model="formData.deep_sleep_percentage"
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="light_sleep_percentage">浅い睡眠の割合 (%)</Label>
                <Input
                  type="number"
                  id="light_sleep_percentage"
                  v-model="formData.light_sleep_percentage"
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="rem_sleep_percentage">レム睡眠の割合 (%)</Label>
                <Input
                  type="number"
                  id="rem_sleep_percentage"
                  v-model="formData.rem_sleep_percentage"
                  min="0"
                  max="100"
                  required
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-4 pt-4">
            <Button variant="outline" type="button" @click="router.push('/')"> キャンセル </Button>
            <Button type="submit" :disabled="loading">
              {{ loading ? '送信中...' : '保存' }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
