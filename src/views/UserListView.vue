<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { authFetch } from '@/utils/api'

interface User {
  id: number
  username: string
  created_at: string
  is_public: number
}
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'

const users = ref<User[]>([])
const loading = ref(false)
const error = ref('')
const router = useRouter()
const authStore = useAuthStore()

const fetchUsers = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await authFetch('http://localhost:8787/api/users')
    if (!res.ok) throw new Error('Failed to fetch users')
    const json = await res.json()
    users.value = json.data
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const goToProfile = (id: number) => {
  router.push(`/users/${id}`)
}

const viewData = (e: Event, id: number) => {
  e.stopPropagation()
  router.push(`/?viewUser=${id}`)
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="container mx-auto py-10 max-w-4xl">
    <Card>
      <CardHeader>
        <CardTitle>ユーザー一覧</CardTitle>
        <CardDescription>登録されているユーザーの一覧です。</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="text-muted-foreground p-4">読み込み中...</div>
        <div v-else-if="error" class="text-destructive p-4">{{ error }}</div>
        <div v-else>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[100px]">ID</TableHead>
                <TableHead>ユーザー名</TableHead>
                <TableHead>登録日</TableHead>
                <TableHead class="text-right">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="user in users"
                :key="user.id"
                @click="goToProfile(user.id)"
                class="cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <TableCell class="font-medium">{{ user.id }}</TableCell>
                <TableCell class="font-bold text-primary">{{ user.username }}</TableCell>
                <TableCell>{{ new Date(user.created_at).toLocaleString() }}</TableCell>
                <TableCell class="text-right">
                  <Button
                    v-if="user.is_public === 1 && user.id !== authStore.user?.id"
                    variant="secondary"
                    size="sm"
                    @click="(e) => viewData(e, user.id)"
                  >
                    データを見る
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
