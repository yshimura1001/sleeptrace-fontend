<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import ThemeToggle from '@/components/layout/ThemeToggle.vue'
import { useAuthStore } from '@/stores/auth'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { User, LogOut } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const isViewMode = computed(() => !!route.query.viewUser)

const headerClass = computed(() =>
  isViewMode.value
    ? 'bg-foreground text-background border-b-0'
    : 'bg-background border-b text-foreground'
)

const navLinkClass = computed(() =>
  isViewMode.value
    ? 'text-sm font-medium transition-colors hover:text-background/80 text-background/60'
    : 'text-sm font-medium transition-colors hover:text-primary text-muted-foreground'
)

const navActiveClass = computed(() =>
  isViewMode.value ? '!text-background font-bold' : '!text-foreground'
)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header :class="headerClass">
    <div class="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-8">
        <RouterLink to="/" class="flex items-center gap-2">
          <img src="/favicon.svg" alt="SleepTrace" class="h-8 w-8" />
          <span class="text-xl font-bold" :class="isViewMode ? 'text-background' : 'text-foreground'">SleepTrace</span>
        </RouterLink>
        <nav class="hidden md:flex gap-6">
          <RouterLink
            :to="{ path: '/', query: route.query }"
            :class="navLinkClass"
            :active-class="navActiveClass"
          >
            ダッシュボード
          </RouterLink>
          <RouterLink
            v-if="!isViewMode"
            to="/input"
            :class="navLinkClass"
            :active-class="navActiveClass"
          >
            データ入力
          </RouterLink>
          <RouterLink
            :to="{ path: '/logs', query: route.query }"
            :class="navLinkClass"
            :active-class="navActiveClass"
          >
            睡眠ログ一覧
          </RouterLink>
          <RouterLink
            :to="{ path: '/analysis', query: route.query }"
            :class="navLinkClass"
            :active-class="navActiveClass"
          >
            分析
          </RouterLink>
          <RouterLink
            v-if="!isViewMode"
            to="/data"
            :class="navLinkClass"
            :active-class="navActiveClass"
          >
            データ管理
          </RouterLink>
          <RouterLink
            v-if="authStore.user"
            :to="isViewMode ? { path: `/users/${route.query.viewUser}`, query: route.query } : `/users/${authStore.user.id}`"
            :class="navLinkClass"
            :active-class="navActiveClass"
          >
            プロフィール
          </RouterLink>
          <RouterLink
            v-if="authStore.user"
            to="/users"
            :class="navLinkClass"
            :active-class="navActiveClass"
          >
            ユーザー一覧
          </RouterLink>
        </nav>
      </div>
      <div class="flex items-center gap-4">
        <ThemeToggle />

        <div v-if="authStore.isAuthenticated && authStore.user" class="flex items-center">
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button variant="ghost" class="relative h-8 w-8 rounded-full">
                         <div
                           class="flex h-8 w-8 items-center justify-center rounded-full"
                           :class="isViewMode ? 'bg-background text-foreground' : 'bg-muted'"
                         >
                            <User class="h-5 w-5" />
                         </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-56" align="end">
                    <DropdownMenuLabel class="font-normal">
                        <div class="flex flex-col space-y-1">
                            <p class="text-sm font-medium leading-none">{{ authStore.user.username }}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click="handleLogout" class="text-destructive focus:text-destructive">
                        <LogOut class="mr-2 h-4 w-4" />
                        <span>ログアウト</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <span class="ml-2 text-sm font-medium hidden sm:inline-block">{{ authStore.user.username }}</span>
        </div>
      </div>
    </div>
  </header>
</template>
