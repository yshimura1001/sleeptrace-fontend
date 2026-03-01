<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { User, Eye, EyeOff } from 'lucide-vue-next'
import { authFetch } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'

interface UserData {
  id: number
  username: string
  is_public: number
  created_at: string
}

const { toast } = useToast()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const user = ref<UserData | null>(null)

const isOwnProfile = computed(() => {
  return Number(route.params.id) === authStore.user?.id
})

const formData = reactive({
  username: '',
  current_password: '',
  new_password: '',
  is_public: 0,
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)

const fetchUser = async () => {
  loading.value = true
  error.value = ''
  try {
    const id = route.params.id
    const res = await authFetch(`/api/users/${id}`)
    if (!res.ok) throw new Error('Failed to fetch user')
    const json = await res.json()
    user.value = json.data

    if (json.data) {
      formData.username = json.data.username
      formData.is_public = json.data.is_public
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  if (formData.new_password && !formData.current_password) {
    error.value = 'パスワードを変更するには現在のパスワードを入力してください。'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const payload: Record<string, any> = {}

    if (formData.username !== user.value?.username) {
      payload.username = formData.username
    }
    if (formData.new_password) {
      payload.current_password = formData.current_password
      payload.new_password = formData.new_password
    }
    if (formData.is_public !== user.value?.is_public) {
      payload.is_public = formData.is_public
    }

    if (Object.keys(payload).length === 0) {
      toast({ title: '変更がありません' })
      loading.value = false
      return
    }

    const id = route.params.id
    const res = await authFetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Update failed')
    }

    if (payload.username && authStore.user) {
      authStore.setAuth(authStore.token!, {
        id: authStore.user.id,
        username: payload.username,
      })
    }

    formData.current_password = ''
    formData.new_password = ''

    toast({ title: 'プロフィールを更新しました。' })

    await fetchUser()
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
    const res = await authFetch(`/api/users/${id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Delete failed')
    }

    toast({ title: 'アカウントを削除しました。' })

    authStore.logout()
    router.push('/login')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUser()
})
</script>

<template>
  <div class="container mx-auto py-10 max-w-2xl">
    <Button variant="ghost" class="mb-4" @click="router.back()">← 戻る</Button>

    <div v-if="loading && !user" class="text-center py-10">読み込み中...</div>
    <div v-else-if="error && !user" class="text-center text-destructive py-10">{{ error }}</div>

    <Card v-else-if="user">
      <CardHeader>
        <div class="flex items-center gap-4">
          <div class="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User class="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle class="text-2xl">{{ user.username }}</CardTitle>
            <CardDescription>ID: {{ user.id }}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-6">
        <div
          v-if="error"
          class="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm font-medium"
        >
          {{ error }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <p class="text-sm text-muted-foreground">登録日</p>
            <p class="font-medium">{{ new Date(user.created_at).toLocaleString() }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm text-muted-foreground">公開設定</p>
            <p class="font-medium">{{ user.is_public ? '公開' : '非公開' }}</p>
          </div>
        </div>

        <form v-if="isOwnProfile" @submit.prevent="submitForm" class="space-y-6 border-t pt-6">
          <h3 class="text-lg font-medium">プロフィール編集</h3>

          <div class="space-y-2">
            <Label for="username">ユーザー名</Label>
            <Input
              id="username"
              type="text"
              v-model="formData.username"
              minlength="3"
              required
            />
          </div>

          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Label>データ公開設定</Label>
              <p class="text-sm text-muted-foreground">
                オンにすると他のユーザーがあなたの睡眠データを閲覧できます。
              </p>
            </div>
            <Switch
              :modelValue="formData.is_public === 1"
              @update:modelValue="(val: boolean) => formData.is_public = val ? 1 : 0"
            />
          </div>

          <div class="space-y-4 border-t pt-4">
            <h4 class="text-md font-medium">パスワード変更</h4>
            <p class="text-sm text-muted-foreground">
              パスワードを変更する場合のみ入力してください。
            </p>

            <div class="space-y-2">
              <Label for="current_password">現在のパスワード</Label>
              <div class="relative">
                <Input
                  id="current_password"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  v-model="formData.current_password"
                  class="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  @click="showCurrentPassword = !showCurrentPassword"
                >
                  <EyeOff v-if="showCurrentPassword" class="h-4 w-4 text-muted-foreground" />
                  <Eye v-else class="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="new_password">新しいパスワード (6文字以上)</Label>
              <div class="relative">
                <Input
                  id="new_password"
                  :type="showNewPassword ? 'text' : 'password'"
                  v-model="formData.new_password"
                  minlength="6"
                  class="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  @click="showNewPassword = !showNewPassword"
                >
                  <EyeOff v-if="showNewPassword" class="h-4 w-4 text-muted-foreground" />
                  <Eye v-else class="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center pt-4">
            <AlertDialog>
              <AlertDialogTrigger as-child>
                <Button type="button" variant="destructive" :disabled="loading">
                  アカウント削除
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>本当にアカウントを削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    この操作は取り消せません。アカウントとすべての睡眠データが完全に削除されます。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction
                    @click="handleDelete"
                    class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    削除する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button type="submit" :disabled="loading">
              {{ loading ? '更新中...' : '更新' }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
