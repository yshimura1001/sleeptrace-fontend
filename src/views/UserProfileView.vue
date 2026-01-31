<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-vue-next'
import { authFetch } from '@/utils/api'

interface UserData {
  id: number
  username: string
  created_at: string
}

const route = useRoute()
const router = useRouter()
const user = ref<UserData | null>(null)
const loading = ref(false)
const error = ref('')

const fetchUser = async () => {
  loading.value = true
  error.value = ''
  try {
    const id = route.params.id
    const res = await authFetch(`/api/users/${id}`)
    if (!res.ok) throw new Error('Failed to fetch user')
    const json = await res.json()
    user.value = json.data
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

    <div v-if="loading" class="text-center py-10">読み込み中...</div>
    <div v-else-if="error" class="text-center text-destructive py-10">{{ error }}</div>

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
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1">
                <p class="text-sm text-muted-foreground">登録日</p>
                <p class="font-medium">{{ new Date(user.created_at).toLocaleString() }}</p>
            </div>
            <!-- Future: Add permission settings or stats here -->
        </div>
      </CardContent>
    </Card>
  </div>
</template>
