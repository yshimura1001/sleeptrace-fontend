<script setup lang="ts">
import { ref } from 'vue'

const message = ref('Waiting for API...')

const checkConnection = async () => {
  try {
    // HonoのローカルサーバーURL（通常は8787ポート）
    const response = await fetch('http://localhost:8787/api/check')
    const data = await response.json()
    message.value = data.message
  } catch (error) {
    message.value = 'Connection failed: ' + error
  }
}
</script>

<template>
  <div style="text-align: center; margin-top: 50px;">
    <h1>Sleep App 疎通確認</h1>
    <p>API Status: {{ message }}</p>
    <button @click="checkConnection">Honoを呼び出す</button>
  </div>
</template>
