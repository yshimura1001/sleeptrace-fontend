<script setup lang="ts">
import { useColorMode } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Moon, Sun, Monitor } from 'lucide-vue-next'

const mode = useColorMode({
  selector: 'body',
  attribute: 'class',
  modes: {
    light: '', // light mode has no class
    dark: 'dark',
  },
})
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon">
        <Sun v-if="mode === 'light'" class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon v-else-if="mode === 'dark'" class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <Monitor v-else class="h-[1.2rem] w-[1.2rem]" />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="mode = 'light'">
        <Sun class="mr-2 h-4 w-4" />
        <span>ライト</span>
      </DropdownMenuItem>
      <DropdownMenuItem @click="mode = 'dark'">
        <Moon class="mr-2 h-4 w-4" />
        <span>ダーク</span>
      </DropdownMenuItem>
      <DropdownMenuItem @click="mode = 'auto'">
        <Monitor class="mr-2 h-4 w-4" />
        <span>OS/ブラウザに連動</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
