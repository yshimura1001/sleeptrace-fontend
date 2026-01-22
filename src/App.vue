<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import { Toaster } from '@/components/ui/toast'
import { Github } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col">
    <AppHeader />
    <main class="flex-1">
      <RouterView />
    </main>
    <footer class="py-6 text-center text-sm text-muted-foreground border-t space-y-2">
      <p>© Yasuaki Shimura 2026</p>
      <div class="flex items-center justify-center gap-2">
        <span>ソースコードはこちら→</span>
        <a target="_blank" href="https://github.com/yshimura1001/sleeptrace" class="hover:text-foreground transition-colors">
          <Github class="w-5 h-5" />
          <span class="sr-only">GitHub</span>
        </a>
        <span>で確認できます。</span>
      </div>
    </footer>
    <Toaster />
  </div>
</template>
