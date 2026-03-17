<template>
  <div
    class="rounded-2xl shadow-lg overflow-hidden transition-all duration-300"
    :class="[
      themeStore.theme === 'dark'
        ? 'bg-dark-800 shadow-dark-950/50'
        : 'bg-white shadow-lg'
    ]"
  >
    <slot />
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()
</script>
