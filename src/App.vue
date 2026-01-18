<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import { Toaster } from '@/components/ui/toast'
</script>

<template>
  <div class="min-h-screen bg-background">
    <AppHeader />
    <RouterView />
    <Toaster />
  </div>
</template>
