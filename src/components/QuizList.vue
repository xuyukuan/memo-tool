<template>
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-8">
      <h2 
        class="text-2xl font-bold mb-2"
        :class="themeStore.theme === 'dark' ? 'text-dark-100' : 'text-gray-800'"
      >
        {{ quizStore.quizData?.title }}
      </h2>
      <p 
        class="transition-colors"
        :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-600'"
      >
        共 {{ quizStore.quizData?.items.length }} 个默写项，已选择
        <span class="font-bold text-primary-600">{{ quizStore.selectedItems.length }}</span> 个
      </p>
    </div>
    
    <div class="mb-6 flex gap-4">
      <div class="flex-1 relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索题目..."
          class="w-full px-4 py-3 rounded-xl transition-colors focus:outline-none focus:ring-2"
          :class="[
            themeStore.theme === 'dark' 
              ? 'bg-dark-800 border-dark-700 text-dark-100 placeholder-dark-400 focus:ring-primary-500' 
              : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-primary-600'
          ]"
        >
        <span 
          class="absolute right-4 top-1/2 transform -translate-y-1/2"
          :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-400'"
        >
          🔍
        </span>
      </div>
    </div>
    
    <div class="flex justify-between items-center mb-4">
      <button
        @click="toggleSelectAll"
        class="text-primary-600 hover:text-primary-700 font-medium transition-colors"
      >
        {{ isAllSelected ? '取消全选' : '全选' }}
      </button>
      <span 
        class="text-sm transition-colors"
        :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'"
      >
        筛选: {{ filteredItems.length }} 项
      </span>
    </div>
    
    <div class="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
      <TransitionGroup name="list">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          @click="quizStore.toggleItemSelection(item.id)"
          class="p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md border"
          :class="[
            isItemSelected(item.id)
              ? themeStore.theme === 'dark'
                ? 'bg-primary-900/20 border-primary-700'
                : 'bg-primary-50 border-primary-500'
              : themeStore.theme === 'dark'
                ? 'bg-dark-800 border-dark-700 hover:border-dark-600'
                : 'bg-white border-gray-200 hover:border-gray-300'
          ]"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-6 h-6 rounded border-2 flex items-center justify-center transition-colors"
              :class="[
                isItemSelected(item.id)
                  ? 'bg-primary-500 border-primary-500'
                  : themeStore.theme === 'dark' 
                    ? 'border-dark-600' 
                    : 'border-gray-300'
              ]"
            >
              <span v-if="isItemSelected(item.id)" class="text-white text-sm">✓</span>
            </div>
            <div class="flex-1">
              <p 
                class="font-medium transition-colors"
                :class="themeStore.theme === 'dark' ? 'text-dark-100' : 'text-gray-800'"
              >
                {{ item.question }}
              </p>
              <p 
                v-if="item.example" 
                class="text-sm mt-1 transition-colors"
                :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'"
              >
                {{ item.example }}
              </p>
            </div>
            <span
              class="px-2 py-1 rounded text-xs font-medium"
              :class="quizStore.quizData?.type === 'english' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'"
            >
              {{ quizStore.quizData?.type === 'english' ? 'EN' : 'CN' }}
            </span>
          </div>
        </div>
      </TransitionGroup>
    </div>
    
    <div class="mt-8 flex justify-center gap-4">
      <button
        @click="goBack"
        class="px-6 py-3 border rounded-xl transition-colors"
        :class="themeStore.theme === 'dark' 
          ? 'border-dark-600 text-dark-200 hover:bg-dark-800' 
          : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
      >
        返回上传
      </button>
      <button
        @click="startQuiz"
        :disabled="quizStore.selectedItems.length === 0"
        class="px-8 py-3 rounded-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        :class="themeStore.theme === 'dark' 
          ? 'bg-primary-700 hover:bg-primary-600' 
          : 'bg-primary-600 hover:bg-primary-700'"
      >
        开始默写 ({{ quizStore.selectedItems.length }}个)
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import { useThemeStore } from '@/stores/themeStore'

const quizStore = useQuizStore()
const themeStore = useThemeStore()
const searchQuery = ref('')

const filteredItems = computed(() => {
  if (!searchQuery.value) return quizStore.quizData?.items || []
  
  const query = searchQuery.value.toLowerCase()
  return quizStore.quizData?.items.filter(item =>
    item.question.toLowerCase().includes(query) ||
    item.answer.toLowerCase().includes(query)
  ) || []
})

const isAllSelected = computed(() => {
  return quizStore.quizData?.items.every(item =>
    quizStore.selectedItems.some(s => s.id === item.id)
  )
})

function isItemSelected(itemId) {
  return quizStore.selectedItems.some(item => item.id === itemId)
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    quizStore.deselectAllItems()
  } else {
    quizStore.selectAllItems()
  }
}

function startQuiz() {
  quizStore.startQuiz()
}

function goBack() {
  quizStore.reset()
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
