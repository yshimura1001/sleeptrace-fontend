<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { apiFetch } from '@/utils/api'
import { Eye, EyeOff } from 'lucide-vue-next'

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

const router = useRouter()
const authStore = useAuthStore()

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Login failed')
    }

    // Store token
    authStore.setAuth(data.token, data.user)

    // Redirect
    router.push('/')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-background">
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl">ログイン</CardTitle>
        <CardDescription>
          アカウント情報を入力してください。<br>
          ゲストユーザー: guest / Bc@r1#DMXn
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4">
        <div class="grid gap-2">
          <Label for="username">ユーザー名</Label>
          <Input id="username" type="text" v-model="username" required />
        </div>
        <div class="grid gap-2">
          <Label for="password">パスワード</Label>
          <div class="relative">
            <Input id="password" :type="showPassword ? 'text' : 'password'" v-model="password" required class="pr-10" />
            <Button type="button" variant="ghost" size="icon" class="absolute right-0 top-0 h-full px-3 hover:bg-transparent" @click="showPassword = !showPassword">
              <EyeOff v-if="showPassword" class="h-4 w-4 text-muted-foreground" />
              <Eye v-else class="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
        <div v-if="error" class="text-destructive text-sm">{{ error }}</div>
      </CardContent>
      <CardFooter>
        <Button class="w-full" @click="handleLogin" :disabled="loading">
          {{ loading ? 'ログイン中...' : 'ログイン' }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
