<template>
  <div class="space-y-4">
    <!-- 搜索框 -->
    <div class="relative">
      <input
        v-model="searchText"
        type="text"
        placeholder="搜索默写集名称..."
        class="w-full px-4 py-3 pl-12 rounded-xl border transition-all"
        :class="[
          themeStore.theme === 'dark' 
            ? 'bg-dark-800 border-dark-700 text-dark-100 placeholder-dark-400 focus:border-primary-500' 
            : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-primary-500'
        ]"
        @input="handleSearch"
      >
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
      <button
        v-if="searchText"
        @click="clearSearch"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        ✕
      </button>
    </div>

    <!-- 筛选栏 -->
    <div class="flex flex-wrap gap-3">
      <!-- 类型筛选 -->
      <div class="flex gap-1 p-1 rounded-lg" :class="themeStore.theme === 'dark' ? 'bg-dark-800' : 'bg-gray-100'">
        <button
          v-for="option in typeOptions"
          :key="option.value"
          @click="setTypeFilter(option.value)"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
          :class="[
            activeFilters.type === option.value
              ? 'bg-white dark:bg-dark-600 shadow-sm text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-dark-400 hover:text-gray-900 dark:hover:text-dark-200'
          ]"
        >
          <span>{{ option.icon }}</span>
          <span>{{ option.label }}</span>
        </button>
      </div>

      <!-- 分类筛选 -->
      <select
        v-model="selectedCategoryId"
        @change="setCategoryFilter"
        class="px-3 py-1.5 rounded-lg text-sm border bg-transparent transition-colors cursor-pointer"
        :class="themeStore.theme === 'dark' ? 'border-dark-700 text-dark-300' : 'border-gray-200 text-gray-700'"
      >
        <option :value="null">📁 全部分类</option>
        <option value="uncategorized">📋 未分类</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>

      <!-- 收藏筛选 -->
      <button
        @click="toggleFavoriteOnly"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
        :class="[
          activeFilters.favoriteOnly
            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
            : themeStore.theme === 'dark' 
              ? 'bg-dark-800 text-dark-300' 
              : 'bg-gray-100 text-gray-700'
        ]"
      >
        <span>{{ activeFilters.favoriteOnly ? '⭐' : '☆' }}</span>
        <span>仅收藏</span>
      </button>

      <!-- 排序 -->
      <select
        v-model="sortBy"
        class="px-3 py-1.5 rounded-lg text-sm border bg-transparent transition-colors cursor-pointer"
        :class="themeStore.theme === 'dark' ? 'border-dark-700 text-dark-300' : 'border-gray-200 text-gray-700'"
      >
        <option v-for="option in sortOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <!-- 清除筛选 -->
      <button
        v-if="hasActiveFilters"
        @click="clearFilters"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        :class="themeStore.theme === 'dark' ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-600 hover:bg-red-100'"
      >
        <span>✕</span>
        <span>清除筛选</span>
      </button>
    </div>

    <!-- 活跃筛选状态提示 -->
    <div 
      v-if="hasActiveFilters"
      class="flex items-center gap-2 text-sm"
      :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'"
    >
      <span>当前筛选:</span>
      <div class="flex flex-wrap gap-2">
        <span 
          v-if="activeFilters.type"
          class="px-2 py-0.5 rounded-full text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
        >
          {{ getTypeLabel(activeFilters.type) }}
        </span>
        <span 
          v-if="activeFilters.categoryId"
          class="px-2 py-0.5 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
        >
          {{ getCategoryLabel(activeFilters.categoryId) }}
        </span>
        <span 
          v-if="activeFilters.favoriteOnly"
          class="px-2 py-0.5 rounded-full text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
        >
          ⭐ 已收藏
        </span>
        <span 
          v-if="searchText"
          class="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
        >
          "{{ searchText }}"
        </span>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="flex items-center gap-4 text-sm" :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-400'">
      <span>共 {{ totalQuizzes }} 个默写集</span>
      <span v-if="filteredCount !== totalQuizzes" class="text-primary-500">
        筛选后: {{ filteredCount }} 个
      </span>
      <span v-if="favoriteCount > 0" class="text-yellow-500">
        ⭐ {{ favoriteCount }} 个收藏
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import { useThemeStore } from '@/stores/themeStore'
import { debounce } from 'lodash-es'

const quizStore = useQuizStore()
const themeStore = useThemeStore()

const searchText = ref('')
const sortBy = ref('createdAt-desc')
const selectedCategoryId = ref(null)

const typeOptions = [
  { value: null, label: '全部', icon: '📚' },
  { value: 'english', label: '英语', icon: '🇺🇸' },
  { value: 'chinese', label: '语文', icon: '🇨🇳' }
]

const sortOptions = [
  { value: 'createdAt-desc', label: '🕐 最新创建' },
  { value: 'createdAt-asc', label: '🕐 最早创建' },
  { value: 'lastUsed-desc', label: '📖 最近使用' },
  { value: 'lastUsed-asc', label: '📖 最早使用' },
  { value: 'usageCount-desc', label: '🔥 最多使用' },
  { value: 'itemCount-desc', label: '📝 项数最多' },
  { value: 'name-asc', label: '🔤 名称 A-Z' },
  { value: 'name-desc', label: '🔤 名称 Z-A' }
]

const activeFilters = computed(() => quizStore.activeFilters)
const categories = computed(() => quizStore.categories)
const savedQuizzes = computed(() => quizStore.savedQuizzes)

const totalQuizzes = computed(() => savedQuizzes.value.length)
const filteredCount = computed(() => quizStore.filteredQuizzes.length)
const favoriteCount = computed(() => savedQuizzes.value.filter(q => q.isFavorite).length)

const hasActiveFilters = computed(() => {
  return searchText.value || 
    activeFilters.value.type || 
    activeFilters.value.categoryId ||
    activeFilters.value.favoriteOnly
})

// 搜索防抖
const debouncedSearch = debounce((value) => {
  quizStore.setSearchQuery(value)
}, 300)

function handleSearch() {
  debouncedSearch(searchText.value)
}

function setTypeFilter(type) {
  quizStore.setFilters({ type })
}

function setCategoryFilter() {
  quizStore.setFilters({ categoryId: selectedCategoryId.value })
}

function toggleFavoriteOnly() {
  quizStore.setFilters({ favoriteOnly: !activeFilters.value.favoriteOnly })
}

function clearSearch() {
  searchText.value = ''
  quizStore.setSearchQuery('')
}

function clearFilters() {
  searchText.value = ''
  selectedCategoryId.value = null
  quizStore.clearFilters()
}

function getTypeLabel(type) {
  const option = typeOptions.find(o => o.value === type)
  return option ? `${option.icon} ${option.label}` : type
}

function getCategoryLabel(categoryId) {
  if (categoryId === 'uncategorized') return '📋 未分类'
  const cat = categories.value.find(c => c.id === categoryId)
  return cat ? cat.name : categoryId
}

// 监听排序变化
watch(sortBy, (value) => {
  const [field, order] = value.split('-')
  quizStore.setFilters({ sortBy: field, sortOrder: order })
})

// 初始化
onMounted(() => {
  selectedCategoryId.value = activeFilters.value.categoryId
})
</script>
