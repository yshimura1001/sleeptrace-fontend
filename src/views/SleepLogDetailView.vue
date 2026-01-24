<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/toast/use-toast'
const { toast } = useToast()
const router = useRouter()
const route = useRoute()
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


const fetchLog = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const response = await fetch(`http://localhost:8787/api/sleep_logs/${id}`)
    if (!response.ok) throw new Error('Failed to fetch sleep log')
    const data = await response.json()

    // Populate form data
    formData.sleep_date = data.sleep_date
    formData.sleep_score = data.sleep_score
    formData.bed_time = data.bed_time
    formData.wakeup_time = data.wakeup_time
    formData.sleep_duration = data.sleep_duration

    // 時間・分の初期値を設定 (分 -> HH:MM)
    if (data.sleep_duration) {
      const h = Math.floor(data.sleep_duration / 60)
      const m = data.sleep_duration % 60
      durationTime.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }

    formData.wakeup_count = data.wakeup_count
    formData.deep_sleep_continuity = data.deep_sleep_continuity
    formData.deep_sleep_percentage = data.deep_sleep_percentage
    formData.light_sleep_percentage = data.light_sleep_percentage
    formData.rem_sleep_percentage = data.rem_sleep_percentage
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

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

    const deep = Number(formData.deep_sleep_percentage || 0)
    const light = Number(formData.light_sleep_percentage || 0)
    const rem = Number(formData.rem_sleep_percentage || 0)

    if (deep + light + rem !== 100) {
      throw new Error(
        `深い睡眠・浅い睡眠・レム睡眠の割合の合計は100%である必要があります。（現在: ${deep + light + rem}%）`,
      )
    }

    const payload = {
      ...formData,
      sleep_score: Number(formData.sleep_score),
      bed_time: formData.bed_time ? formData.bed_time.slice(0, 5) : '',
      wakeup_time: formData.wakeup_time ? formData.wakeup_time.slice(0, 5) : '',
      sleep_duration: Number(formData.sleep_duration),
      wakeup_count: Number(formData.wakeup_count),
      deep_sleep_continuity: Number(formData.deep_sleep_continuity),
      deep_sleep_percentage: Number(formData.deep_sleep_percentage),
      light_sleep_percentage: Number(formData.light_sleep_percentage),
      rem_sleep_percentage: Number(formData.rem_sleep_percentage),
    }

    const id = route.params.id
    const response = await fetch(`http://localhost:8787/api/sleep_logs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      let errorMessage = 'Failed to update data'
      if (errorData.error) {
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error
        } else if (typeof errorData.error === 'object') {
          // Handle Zod error formatting if possible, or just stringify
          // Hono zValidator typically returns { success: false, error: { issues: [...] } } in some configs,
          // or straightforward error structure.
          // If the backend returns { error: ZodError }, handle it.
          errorMessage = JSON.stringify(errorData.error, null, 2)
        }
      }
      throw new Error(errorMessage)
    }

    // Success
    toast({
      title: '更新しました',
      description: '睡眠ログが正常に更新されました。',
    })
    // Optionally redirect or stay
    // router.push('/logs')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const handleDelete = async () => {
  loading.value = true
  error.value = ''

  try {
    const id = route.params.id
    const response = await fetch(`http://localhost:8787/api/sleep_logs/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete data')
    }

    toast({
      title: '削除しました',
      description: '睡眠ログを削除しました。',
    })

    router.push('/logs')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLog()
})
</script>

<template>
  <div class="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>睡眠データ詳細・編集</CardTitle>
            <CardDescription>睡眠データの確認と編集ができます。</CardDescription>
          </div>
          <Button variant="ghost" @click="router.push('/logs')"> 一覧に戻る </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          v-if="error"
          class="mb-4 bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm font-medium"
        >
          {{ error }}
        </div>

        <div v-if="loading && !formData.sleep_date" class="p-4 text-center text-muted-foreground">
          読み込み中...
        </div>

        <form v-else @submit.prevent="submitForm" class="space-y-6">
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

          <div class="flex justify-between items-center pt-4">
            <div>
              <AlertDialog>
                <AlertDialogTrigger as-child>
                  <Button type="button" variant="destructive" :disabled="loading"> 削除 </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>
                      この操作は取り消せません。この睡眠ログは完全に削除されます。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction
                      @click="handleDelete"
                      class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >削除</AlertDialogAction
                    >
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div class="flex space-x-4">
              <Button variant="outline" type="button" @click="router.push('/logs')">
                キャンセル
              </Button>
              <Button type="submit" :disabled="loading">
                {{ loading ? '更新中...' : '更新' }}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
