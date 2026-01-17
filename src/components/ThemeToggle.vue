<template>
  <button
    @click="themeStore.toggleTheme()"
    class="p-2 rounded-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500"
    :class="[
      themeStore.theme === 'dark' 
        ? 'bg-dark-700 text-yellow-400 hover:bg-dark-600' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    ]"
    :title="themeStore.theme === 'light' ? '切换到深色模式' : '切换到浅色模式'"
  >
    <svg
      v-if="themeStore.theme === 'light'"
      class="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
    
    <svg
      v-else
      class="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  </button>
</template>

<script setup>
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()
</script>
