<template>
  <div class="space-y-6">
    <!-- 搜索和筛选 -->
    <SearchFilter />

    <!-- 默写集列表 -->
    <div class="space-y-4">
      <!-- 头部操作栏 -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <!-- 分类选择器 -->
          <select
            v-model="selectedCategoryId"
            class="px-3 py-2 rounded-lg border transition-colors"
            :class="themeStore.theme === 'dark' ? 'bg-dark-800 border-dark-700 text-dark-300' : 'bg-white border-gray-200 text-gray-700'"
          >
            <option :value="null">选择分类</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>

          <!-- 操作按钮 -->
          <button
            @click="handleImport"
            class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
            :class="themeStore.theme === 'dark' ? 'bg-primary-600 hover:bg-primary-500 text-white' : 'bg-primary-500 hover:bg-primary-600 text-white'"
          >
            <span>📥</span>
            <span>导入</span>
          </button>
          
          <button
            @click="$emit('openExport')"
            class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
            :class="themeStore.theme === 'dark' ? 'bg-dark-700 hover:bg-dark-600 text-dark-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
          >
            <span>📤</span>
            <span>导出</span>
          </button>

          <button
            v-if="selectedQuizzes.length > 0"
            @click="batchDelete"
            class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 text-red-500"
            :class="themeStore.theme === 'dark' ? 'bg-red-900/30 hover:bg-red-900/50' : 'bg-red-50 hover:bg-red-100'"
          >
            <span>🗑️</span>
            <span>删除 ({{ selectedQuizzes.length }})</span>
          </button>
        </div>

        <!-- 统计信息 -->
        <div class="flex items-center gap-4 text-sm" :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-400'">
          <span>{{ filteredQuizzes.length }} 个默写集</span>
          <span v-if="favoriteCount > 0" class="text-yellow-500">⭐ {{ favoriteCount }}</span>
        </div>
      </div>

      <!-- 列表 -->
      <div 
        class="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto"
        :class="themeStore.theme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'"
      >
        <TransitionGroup name="quiz-list">
          <div
            v-for="quiz in filteredQuizzes"
            :key="quiz.id"
            class="group border rounded-xl p-4 transition-all hover:shadow-lg"
            :class="[
              selectedQuizzes.includes(quiz.id) 
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10' 
                : themeStore.theme === 'dark' 
                  ? 'border-dark-700 bg-dark-800/50 hover:bg-dark-800' 
                  : 'border-gray-200 bg-white hover:bg-gray-50'
            ]"
          >
            <div class="flex items-start gap-4">
              <!-- 选择框 -->
              <div class="flex-shrink-0 mt-1">
                <input
                  type="checkbox"
                  :checked="selectedQuizzes.includes(quiz.id)"
                  @change="toggleSelect(quiz.id)"
                  class="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
                />
              </div>

              <!-- 内容 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3">
                  <!-- 类型图标 -->
                  <span class="text-2xl flex-shrink-0">{{ quiz.type === 'english' ? '🇺🇸' : '🇨🇳' }}</span>
                  
                  <!-- 标题和收藏 -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <h4 class="font-semibold truncate" :class="themeStore.theme === 'dark' ? 'text-dark-100' : 'text-gray-800'">
                        {{ quiz.name }}
                      </h4>
                      <button
                        @click.stop="toggleFavorite(quiz.id)"
                        class="flex-shrink-0 transition-transform hover:scale-110"
                        :class="quiz.isFavorite ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'"
                      >
                        {{ quiz.isFavorite ? '⭐' : '☆' }}
                      </button>
                    </div>
                    <p 
                      v-if="quiz.description"
                      class="text-sm mt-0.5 line-clamp-1"
                      :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'"
                    >
                      {{ quiz.description }}
                    </p>
                  </div>
                </div>

                <!-- 元信息 -->
                <div class="flex flex-wrap items-center gap-4 mt-3 text-sm" :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-400'">
                  <span class="flex items-center gap-1">
                    📝 {{ quiz.itemCount }} 项
                  </span>
                  <span class="flex items-center gap-1">
                    📖 {{ quiz.usageCount }} 次使用
                  </span>
                  <span class="flex items-center gap-1">
                    🕐 {{ formatDate(quiz.lastUsed) }}
                  </span>
                  <span 
                    v-if="quiz.categoryId"
                    class="flex items-center gap-1"
                    :class="themeStore.theme === 'dark' ? 'text-green-400' : 'text-green-600'"
                  >
                    📁 {{ getCategoryName(quiz.categoryId) }}
                  </span>
                  <span 
                    v-else
                    class="flex items-center gap-1"
                  >
                    📋 未分类
                  </span>
                </div>

                <!-- 标签 -->
                <div v-if="quiz.tags?.length" class="flex gap-1.5 mt-2 flex-wrap">
                  <span
                    v-for="tag in quiz.tags.slice(0, 4)"
                    :key="tag"
                    class="px-2 py-0.5 text-xs rounded-full"
                    :class="themeStore.theme === 'dark' ? 'bg-dark-700 text-dark-300' : 'bg-gray-100 text-gray-600'"
                  >
                    {{ tag }}
                  </span>
                  <span 
                    v-if="quiz.tags.length > 4"
                    class="px-2 py-0.5 text-xs rounded-full"
                    :class="themeStore.theme === 'dark' ? 'bg-dark-700 text-dark-400' : 'bg-gray-100 text-gray-500'"
                  >
                    +{{ quiz.tags.length - 4 }}
                  </span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex flex-col sm:flex-row items-center gap-2">
                <button
                  @click="startQuiz(quiz.id)"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors"
                >
                  <span>▶️</span>
                  <span>开始练习</span>
                </button>
                
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click.stop="$emit('editQuiz', quiz)"
                    class="p-2 rounded-lg transition-colors"
                    :class="themeStore.theme === 'dark' ? 'hover:bg-dark-700' : 'hover:bg-gray-100'"
                    title="编辑"
                  >
                    ✏️
                  </button>
                  <button
                    @click.stop="exportQuiz(quiz.id)"
                    class="p-2 rounded-lg transition-colors"
                    :class="themeStore.theme === 'dark' ? 'hover:bg-dark-700' : 'hover:bg-gray-100'"
                    title="导出"
                  >
                    📤
                  </button>
                  <button
                    @click.stop="confirmDelete(quiz)"
                    class="p-2 rounded-lg transition-colors"
                    :class="themeStore.theme === 'dark' ? 'hover:bg-dark-700' : 'hover:bg-gray-100'"
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <!-- 空状态 -->
        <div 
          v-if="filteredQuizzes.length === 0"
          class="text-center py-16"
          :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-400'"
        >
          <div class="text-7xl mb-4">📚</div>
          <p class="text-xl font-medium mb-2">
            {{ savedQuizzes.length === 0 ? '还没有默写集' : '没有找到匹配的默写集' }}
          </p>
          <p class="text-sm mb-6">
            {{ savedQuizzes.length === 0 ? '导入一个JSON文件开始吧' : '试试调整筛选条件' }}
          </p>
          <div class="flex justify-center gap-4" v-if="savedQuizzes.length === 0">
            <button
              @click="handleImport"
              class="px-6 py-3 rounded-xl text-white font-medium bg-primary-500 hover:bg-primary-600 transition-colors"
            >
              📥 导入默写集
            </button>
            <a
              href="/sample-english.json"
              download
              class="px-6 py-3 rounded-xl font-medium transition-colors"
              :class="themeStore.theme === 'dark' ? 'bg-dark-800 hover:bg-dark-700 text-dark-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
            >
              📄 下载示例
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      type="file"
      ref="fileInput"
      accept=".json"
      class="hidden"
      @change="handleFileSelect"
    >
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import { useThemeStore } from '@/stores/themeStore'
import { exportQuiz as exportQuizFile, downloadAsJSON } from '@/utils/importExportManager'
import { validateQuizJSON } from '@/utils/enhancedJsonValidator'
import SearchFilter from './SearchFilter.vue'

const emit = defineEmits(['openExport', 'editQuiz', 'quizStarted'])

const quizStore = useQuizStore()
const themeStore = useThemeStore()

const fileInput = ref(null)
const selectedQuizzes = ref([])
const selectedCategoryId = ref(null)

const filteredQuizzes = computed(() => quizStore.filteredQuizzes)
const categories = computed(() => quizStore.categories)
const savedQuizzes = computed(() => quizStore.savedQuizzes)
const favoriteCount = computed(() => savedQuizzes.value.filter(q => q.isFavorite).length)

onMounted(() => {
  quizStore.loadPersistedData()
})

function toggleSelect(quizId) {
  const index = selectedQuizzes.value.indexOf(quizId)
  if (index > -1) {
    selectedQuizzes.value.splice(index, 1)
  } else {
    selectedQuizzes.value.push(quizId)
  }
}

async function toggleFavorite(quizId) {
  await quizStore.toggleFavorite(quizId)
}

async function startQuiz(quizId) {
  // Request fullscreen immediately on user click (required by browser security)
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {})
  }
  await quizStore.loadAndStartQuiz(quizId)
  emit('quizStarted')
}

function handleImport() {
  fileInput.value?.click()
}

async function handleFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    const validation = validateQuizJSON(data)
    
    if (!validation.valid) {
      alert('文件格式验证失败：\n' + validation.errors.join('\n'))
      return
    }
    
    // 使用选中的分类
    validation.data.categoryId = selectedCategoryId.value
    await quizStore.importAndSave(validation.data)
    alert(`导入成功！共 ${validation.itemCount} 个默写项`)
  } catch (error) {
    alert('导入失败：' + error.message)
    console.error('导入失败：', error)
  }
  
  event.target.value = ''
}

async function exportQuiz(quizId) {
  const quiz = quizStore.savedQuizzes.find(q => q.id === quizId)
  if (!quiz) return

  const data = await exportQuizFile(quizId)
  downloadAsJSON(data, `${quiz.name}.json`)
}

async function batchDelete() {
  if (!confirm(`确定要删除选中的 ${selectedQuizzes.value.length} 个默写集吗？`)) return

  try {
    await quizStore.deleteQuizzes(selectedQuizzes.value)
    selectedQuizzes.value = []
    alert('删除成功')
  } catch (error) {
    alert('删除失败：' + error.message)
  }
}

function confirmDelete(quiz) {
  if (!confirm(`确定要删除 "${quiz.name}" 吗？此操作不可恢复。`)) return
  quizStore.deleteQuiz(quiz.id)
}

function getCategoryName(categoryId) {
  if (categoryId === 'uncategorized') return '未分类'
  const cat = categories.value.find(c => c.id === categoryId)
  return cat?.name || categoryId
}

function formatDate(date) {
  if (!date) return '从未使用'
  const d = new Date(date)
  const now = new Date()
  const diff = now - d

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`

  return d.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
/* 列表动画 */
.quiz-list-enter-active,
.quiz-list-leave-active {
  transition: all 0.3s ease;
}

.quiz-list-enter-from,
.quiz-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.quiz-list-move {
  transition: transform 0.3s ease;
}
</style>
