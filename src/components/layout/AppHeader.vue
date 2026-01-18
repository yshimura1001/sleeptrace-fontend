<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="border-b bg-background">
    <div class="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-8">
        <h1 class="text-xl font-bold text-foreground">SleepTrace</h1>
        <nav class="hidden md:flex gap-6">
          <RouterLink
            to="/"
            class="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
            active-class="!text-foreground"
          >
            ダッシュボード
          </RouterLink>
          <RouterLink
            to="/input"
            class="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
            active-class="!text-foreground"
          >
            データ入力
          </RouterLink>
          <RouterLink
            to="/logs"
            class="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
            active-class="!text-foreground"
          >
            睡眠ログ一覧
          </RouterLink>
        </nav>
      </div>
      <!-- User Menu or Actions could go here -->
    </div>
  </header>
</template>
