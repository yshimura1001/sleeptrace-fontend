<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Eye } from 'lucide-vue-next'
import { authFetch } from '@/utils/api'

const route = useRoute()
const viewTargetUser = ref<{ id: number; username: string } | null>(null)
const viewTargetId = computed(() => route.query.viewUser)

const fetchTargetUser = async () => {
    if (!viewTargetId.value) {
        viewTargetUser.value = null
        return
    }
    try {
        const res = await authFetch(`/api/users/${viewTargetId.value}`)
        if (res.ok) {
            const json = await res.json()
            viewTargetUser.value = json.data
        }
    } catch (e) {
        console.error(e)
    }
}

watch(viewTargetId, async (newVal) => {
    if (newVal) {
        await fetchTargetUser()
    } else {
        viewTargetUser.value = null
    }
}, { immediate: true })
</script>

<template>
    <div v-if="viewTargetId" class="container mx-auto mt-4 px-4 sm:px-6 lg:px-8">
        <Alert class="bg-primary/10 border-primary/20">
            <Eye class="h-4 w-4" />
            <AlertTitle>閲覧モード</AlertTitle>
            <AlertDescription class="flex items-center justify-between">
                <span>
                    {{ viewTargetUser ? `${viewTargetUser.username} (ID: ${viewTargetUser.id})` : `ユーザーID: ${viewTargetId}` }} のデータを閲覧しています。
                </span>
                <RouterLink to="/" class="text-xs underline hover:text-primary">
                    元のユーザーに戻る
                </RouterLink>
            </AlertDescription>
        </Alert>
    </div>
</template>
