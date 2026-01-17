<template>
  <div class="mb-6">
    <div 
      class="w-full h-2 rounded-full overflow-hidden transition-colors"
      :class="themeStore.theme === 'dark' ? 'bg-dark-700' : 'bg-gray-200'"
    >
      <div 
        class="h-full rounded-full transition-all duration-500 ease-out"
        :class="themeStore.theme === 'dark' ? 'bg-primary-500' : 'bg-primary-600'"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
    <div class="flex justify-between mt-2">
      <span 
        class="text-sm"
        :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'"
      >
        进度
      </span>
      <span 
        class="text-sm font-medium"
        :class="themeStore.theme === 'dark' ? 'text-dark-300' : 'text-gray-600'"
      >
        {{ Math.round(progress) }}%
      </span>
    </div>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/themeStore'

defineProps({
  progress: {
    type: Number,
    required: true
  }
})

const themeStore = useThemeStore()
</script>
