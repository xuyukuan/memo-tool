<template>
  <div
    class="rounded-xl border p-3"
    :class="[
      themeStore.theme === 'dark' 
        ? 'bg-dark-800 border-dark-700' 
        : 'bg-white border-gray-200'
    ]"
  >
    <h4 
      class="font-medium mb-2 text-sm"
      :class="themeStore.theme === 'dark' ? 'text-dark-100' : 'text-gray-800'"
    >
      ⌨️ 快捷键
    </h4>
    <div class="space-y-1 text-xs">
      <div 
        class="flex justify-between"
        :class="themeStore.theme === 'dark' ? 'text-dark-300' : 'text-gray-600'"
      >
        <span>显示答案</span>
        <kbd 
          class="px-1.5 py-0.5 rounded"
          :class="themeStore.theme === 'dark' ? 'bg-dark-700' : 'bg-gray-100'"
        >空格</kbd>
      </div>
      <div 
        class="flex justify-between"
        :class="themeStore.theme === 'dark' ? 'text-dark-300' : 'text-gray-600'"
      >
        <span>标记错误</span>
        <kbd 
          class="px-1.5 py-0.5 rounded"
          :class="themeStore.theme === 'dark' ? 'bg-dark-700' : 'bg-gray-100'"
        >←</kbd>
      </div>
      <div 
        class="flex justify-between"
        :class="themeStore.theme === 'dark' ? 'text-dark-300' : 'text-gray-600'"
      >
        <span>标记正确</span>
        <kbd 
          class="px-1.5 py-0.5 rounded"
          :class="themeStore.theme === 'dark' ? 'bg-dark-700' : 'bg-gray-100'"
        >→</kbd>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()
</script>
