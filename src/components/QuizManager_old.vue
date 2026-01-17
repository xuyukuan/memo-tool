<template>
  <div class="space-y-6">
    <SearchFilter />
    
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold" :class="themeStore.theme === 'dark' ? 'text-dark-100' : 'text-gray-800'">
          我的默写集
        </h3>
        <div class="flex gap-2">
          <button
            @click="handleImport"
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            :class="themeStore.theme === 'dark' ? 'bg-dark-800 hover:bg-dark-700' : 'bg-gray-100 hover:bg-gray-200'"
          >
            <span>📥</span>
            <span>导入</span>
          </button>
          <button
            @click="$emit('openExport')"
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            :class="themeStore.theme === 'dark' ? 'bg-dark-800 hover:bg-dark-700' : 'bg-gray-100 hover:bg-gray-200'"
          >
            <span>📤</span>
            <span>导出</span>
          </button>
        </div>
      </div>

      <div
        class="space-y-3 max-h-[70vh] overflow-y-auto"
        :class="themeStore.theme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'"
      >
        <div
          v-for="quiz in filteredQuizzes"
          :key="quiz.id"
          class="border rounded-xl p-4 transition-all hover:shadow-md cursor-pointer"
          :class="[
            selectedQuizzes.includes(quiz.id) 
              ? 'border-primary-500 bg-primary-50' 
              : themeStore.theme === 'dark' 
                ? 'border-dark-700 bg-dark-800/50 hover:bg-dark-800' 
                : 'border-gray-200 bg-white hover:bg-gray-50'
          ]"
          @click="toggleSelect(quiz.id)"
        >
          <div class="flex items-center gap-4">
            <input
              type="checkbox"
              :checked="selectedQuizzes.includes(quiz.id)"
              @click.stop="toggleSelect(quiz.id)"
              class="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500 flex-shrink-0"
            />
              
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-3xl">{{ quiz.type === 'english' ? '🇺🇸' : '🇨🇳' }}</span>
                <h4 class="font-semibold truncate" :class="themeStore.theme === 'dark' ? 'text-dark-100' : 'text-gray-800'">
                  {{ quiz.name }}
                </h4>
              </div>
              
              <div class="flex items-center gap-4 mt-2">
                <button
                  @click.stop="toggleFavorite(quiz.id)"
                  class="transition-transform hover:scale-110"
                  :class="quiz.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-400'"
                >
                  {{ quiz.isFavorite ? '⭐' : '☆' }}
                </button>
                <button
                  @click.stop="startQuiz(quiz.id)"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors"
                >
                  开始练习
                </button>
                <button
                  @click.stop="exportQuiz(quiz.id)"
                  class="p-1.5 rounded-lg transition-colors"
                  :class="themeStore.theme === 'dark' ? 'hover:bg-dark-700' : 'hover:bg-gray-100'"
                  title="导出"
                >
                  📤
                </button>
                <button
                  @click.stop="confirmDelete(quiz)"
                  class="p-1.5 rounded-lg transition-colors"
                  :class="themeStore.theme === 'dark' ? 'hover:bg-dark-700' : 'hover:bg-gray-100'"
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
import { importQuizFile, exportQuiz as exportQuizFile, downloadAsJSON } from '@/utils/importExportManager'
import { validateQuizJSON } from '@/utils/enhancedJsonValidator'

const emit = defineEmits(['openExport', 'editQuiz', 'quizStarted'])

const quizStore = useQuizStore()
const themeStore = useThemeStore()

const fileInput = ref(null)
const selectedQuizzes = ref([])

const filteredQuizzes = computed(() => quizStore.filteredQuizzes)

onMounted(() => {
  quizStore.loadPersistedData()
})

async function toggleSelect(quizId) {
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
    
    await quizStore.importAndSave(validation.data)
    alert(`导入成功！共 ${validation.itemCount} 个默写项`)
  } catch (error) {
    alert('导入失败：' + error.message)
    console.log('导入失败：' + error.message)
  }
  
  event.target.value = ''
}

async function exportQuiz(quizId) {
  const quiz = quizStore.savedQuizzes.find(q => q.id === quizId)
  if (!quiz) return
  
  const data = await exportQuizFile(quizId)
  downloadAsJSON(data, `${quiz.name}.json`)
}
</script>
