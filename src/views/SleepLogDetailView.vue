<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
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
import { authFetch } from '@/utils/api'

const { toast } = useToast()
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const error = ref('')

const isViewMode = computed(() => !!route.query.viewUser)

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

// 時間入力用のref
const bedTimeHour = ref<number>(0)
const bedTimeMinute = ref<number>(0)
const wakeupTimeHour = ref<number>(0)
const wakeupTimeMinute = ref<number>(0)
const durationHour = ref<number>(0)
const durationMinute = ref<number>(0)

// 時間と分を結合してHH:MM形式に変換
const formatTimeFromParts = (hour: number, minute: number): string => {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

// HH:MM形式を時間と分に分解
const parseTime = (time: string): { hour: number; minute: number } => {
  if (!time) return { hour: 0, minute: 0 }
  const parts = time.split(':').map(Number)
  return { hour: parts[0] || 0, minute: parts[1] || 0 }
}

// 時間選択肢の生成
const hourOptions = Array.from({ length: 25 }, (_, i) => i)
const minuteOptions = Array.from({ length: 60 }, (_, i) => i)

const fetchLog = async () => {
  loading.value = true
  try {
    const id = route.params.id
    let url = `/api/sleep_logs/${id}`
    if (isViewMode.value) {
        url += `?targetUserId=${route.query.viewUser}`
    }
    const response = await authFetch(url)
    if (!response.ok) throw new Error('Failed to fetch sleep log')
    const data = await response.json()

    // Populate form data
    formData.sleep_date = data.sleep_date
    formData.sleep_score = data.sleep_score
    formData.bed_time = data.bed_time
    formData.wakeup_time = data.wakeup_time
    formData.sleep_duration = data.sleep_duration

    // 時間の初期値を設定
    const bedTimeParsed = parseTime(data.bed_time)
    bedTimeHour.value = bedTimeParsed.hour
    bedTimeMinute.value = bedTimeParsed.minute

    const wakeupTimeParsed = parseTime(data.wakeup_time)
    wakeupTimeHour.value = wakeupTimeParsed.hour
    wakeupTimeMinute.value = wakeupTimeParsed.minute

    // 睡眠時間の初期値を設定 (分 -> 時間と分)
    if (data.sleep_duration) {
      durationHour.value = Math.floor(data.sleep_duration / 60)
      durationMinute.value = data.sleep_duration % 60
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
    // 睡眠時間の計算 (時間と分から分に変換)
    const totalMinutes = durationHour.value * 60 + durationMinute.value
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
      bed_time: formatTimeFromParts(bedTimeHour.value, bedTimeMinute.value),
      wakeup_time: formatTimeFromParts(wakeupTimeHour.value, wakeupTimeMinute.value),
      sleep_duration: Number(formData.sleep_duration),
      wakeup_count: Number(formData.wakeup_count),
      deep_sleep_continuity: Number(formData.deep_sleep_continuity),
      deep_sleep_percentage: Number(formData.deep_sleep_percentage),
      light_sleep_percentage: Number(formData.light_sleep_percentage),
      rem_sleep_percentage: Number(formData.rem_sleep_percentage),
    }

    const id = route.params.id
    const response = await authFetch(`/api/sleep_logs/${id}`, {
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
    const response = await authFetch(`/api/sleep_logs/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      let errorMessage = 'Failed to delete data'
      if (errorData.error) {
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error
        } else if (typeof errorData.error === 'object') {
          errorMessage = errorData.error.message || JSON.stringify(errorData.error)
        }
      }
      throw new Error(errorMessage)
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
          <fieldset :disabled="isViewMode">
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
              <Label>就寝時間</Label>
              <div class="flex items-center gap-2">
                <select
                  v-model="bedTimeHour"
                  class="flex h-9 w-20 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option v-for="h in hourOptions" :key="h" :value="h">{{ String(h).padStart(2, '0') }}</option>
                </select>
                <span class="text-muted-foreground">:</span>
                <select
                  v-model="bedTimeMinute"
                  class="flex h-9 w-20 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option v-for="m in minuteOptions" :key="m" :value="m">{{ String(m).padStart(2, '0') }}</option>
                </select>
              </div>
            </div>

            <!-- Wakeup Time -->
            <div class="space-y-2">
              <Label>起床時間</Label>
              <div class="flex items-center gap-2">
                <select
                  v-model="wakeupTimeHour"
                  class="flex h-9 w-20 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option v-for="h in hourOptions" :key="h" :value="h">{{ String(h).padStart(2, '0') }}</option>
                </select>
                <span class="text-muted-foreground">:</span>
                <select
                  v-model="wakeupTimeMinute"
                  class="flex h-9 w-20 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option v-for="m in minuteOptions" :key="m" :value="m">{{ String(m).padStart(2, '0') }}</option>
                </select>
              </div>
            </div>

            <!-- Sleep Duration -->
            <div class="space-y-2">
              <Label>睡眠時間</Label>
              <div class="flex items-center gap-2">
                <select
                  v-model="durationHour"
                  class="flex h-9 w-20 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option v-for="h in hourOptions" :key="h" :value="h">{{ String(h).padStart(2, '0') }}</option>
                </select>
                <span class="text-muted-foreground">:</span>
                <select
                  v-model="durationMinute"
                  class="flex h-9 w-20 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option v-for="m in minuteOptions" :key="m" :value="m">{{ String(m).padStart(2, '0') }}</option>
                </select>
              </div>
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
          </fieldset>

          <div class="flex justify-between items-center pt-4">
            <div>
              <AlertDialog v-if="!isViewMode">
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
              <Button variant="outline" type="button" @click="router.push({ path: '/logs', query: route.query })">
                {{ isViewMode ? '戻る' : 'キャンセル' }}
              </Button>
              <Button v-if="!isViewMode" type="submit" :disabled="loading">
                {{ loading ? '更新中...' : '更新' }}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
