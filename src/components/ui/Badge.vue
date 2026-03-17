<template>
  <span
    class="px-2 py-1 rounded text-xs font-medium"
    :class="colorClasses"
  >
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'english', 'chinese'].includes(v)
  }
})

const colorClasses = computed(() => {
  if (props.variant === 'english') {
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  }
  if (props.variant === 'chinese') {
    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  }
  return 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
})
</script>
