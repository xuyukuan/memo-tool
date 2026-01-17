<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="p-2 rounded-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500"
      :class="[
        themeStore.theme === 'dark' 
          ? 'bg-dark-700 text-dark-200 hover:bg-dark-600' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      ]"
      title="音效设置"
    >
      <span v-if="!isMuted">🔊</span>
      <span v-else>🔇</span>
    </button>
    
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-48 rounded-xl shadow-lg border p-4 z-50"
        :class="[
          themeStore.theme === 'dark' 
            ? 'bg-dark-800 border-dark-600' 
            : 'bg-white border-gray-200'
        ]"
      >
        <h3 
          class="font-medium mb-3"
          :class="themeStore.theme === 'dark' ? 'text-dark-100' : 'text-gray-800'"
        >
          音效设置
        </h3>
        
        <div class="mb-3">
          <label 
            class="text-sm mb-1 block"
            :class="themeStore.theme === 'dark' ? 'text-dark-300' : 'text-gray-600'"
          >
            音量: {{ Math.round(volume * 100) }}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            v-model="volume"
            class="w-full h-2 rounded-lg appearance-none cursor-pointer"
            :class="[
              themeStore.theme === 'dark' 
                ? 'bg-dark-600 accent-primary-500' 
                : 'bg-gray-200 accent-primary-600'
            ]"
          >
        </div>
        
        <button
          @click="isMuted = !isMuted"
          class="w-full py-2 px-3 rounded-lg text-sm transition-colors"
          :class="[
            isMuted
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              : themeStore.theme === 'dark' 
                ? 'bg-dark-700 text-dark-200 hover:bg-dark-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          {{ isMuted ? '🔇 取消静音' : '🔊 取消静音' }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()
const isOpen = ref(false)
const volume = ref(0.7)
const isMuted = ref(false)
</script>
