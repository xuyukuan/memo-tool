<template>
  <div class="relative">
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :type="type"
      :placeholder="placeholder"
      class="w-full px-4 py-3 rounded-xl transition-colors focus:outline-none focus:ring-2"
      :class="[
        themeStore.theme === 'dark'
          ? 'bg-dark-800 border-dark-700 text-dark-100 placeholder-dark-400 focus:ring-primary-500'
          : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-primary-600'
      ]"
    >
    <span
      v-if="icon"
      class="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
      :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-400'"
    >
      {{ icon }}
    </span>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/themeStore'

defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])

const themeStore = useThemeStore()
</script>
