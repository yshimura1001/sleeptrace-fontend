<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <AppHeader />
    <RouterView />
  </div>
</template>
