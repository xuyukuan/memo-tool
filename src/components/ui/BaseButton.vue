<template>
  <button
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
    :class="[
      variantClasses,
      sizeClasses,
      { 'opacity-50 cursor-not-allowed': disabled },
      !disabled && 'transform hover:scale-105 active:scale-95'
    ]"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'danger', 'ghost', 'success'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const themeStore = useThemeStore()

const variantClasses = computed(() => {
  const base = 'focus:ring-offset-transparent'
  if (props.variant === 'primary') {
    return themeStore.theme === 'dark'
      ? 'bg-primary-700 text-white hover:bg-primary-600 focus:ring-primary-500'
      : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-600'
  }
  if (props.variant === 'secondary') {
    return themeStore.theme === 'dark'
      ? 'bg-dark-700 text-dark-200 border border-dark-600 hover:bg-dark-600 focus:ring-dark-500'
      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-400'
  }
  if (props.variant === 'danger') {
    return 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500'
  }
  if (props.variant === 'success') {
    return 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500'
  }
  if (props.variant === 'ghost') {
    return themeStore.theme === 'dark'
      ? 'bg-transparent text-dark-300 hover:bg-dark-700 focus:ring-dark-500'
      : 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400'
  }
  return ''
})

const sizeClasses = computed(() => {
  if (props.size === 'sm') return 'px-3 py-1.5 text-sm'
  if (props.size === 'lg') return 'px-8 py-4 text-lg'
  return 'px-6 py-3'
})
</script>
