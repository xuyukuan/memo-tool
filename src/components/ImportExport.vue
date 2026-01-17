<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div 
      class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
      :class="themeStore.theme === 'dark' ? 'bg-dark-900' : 'bg-white'"
    >
      <!-- 头部 -->
      <div class="sticky top-0 p-6 border-b flex items-center justify-between" :class="themeStore.theme === 'dark' ? 'border-dark-700' : 'border-gray-200'">
        <h2 class="text-xl font-bold" :class="themeStore.theme === 'dark' ? 'text-dark-100' : 'text-gray-800'">
          数据管理
        </h2>
        <button
          @click="$emit('close')"
          class="p-2 rounded-lg transition-colors"
          :class="themeStore.theme === 'dark' ? 'hover:bg-dark-800' : 'hover:bg-gray-100'"
        >
          ✕
        </button>
      </div>

      <!-- 内容 -->
      <div class="p-6 space-y-8">
        <!-- 统计信息 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 rounded-xl" :class="themeStore.theme === 'dark' ? 'bg-dark-800' : 'bg-gray-50'">
            <div class="text-3xl font-bold" :class="themeStore.theme === 'dark' ? 'text-primary-400' : 'text-primary-600'">
              {{ stats?.quizCount || 0 }}
            </div>
            <div class="text-sm mt-1" :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'">
              默写集
            </div>
          </div>
          <div class="text-center p-4 rounded-xl" :class="themeStore.theme === 'dark' ? 'bg-dark-800' : 'bg-gray-50'">
            <div class="text-3xl font-bold" :class="themeStore.theme === 'dark' ? 'text-primary-400' : 'text-primary-600'">
              {{ stats?.totalItems || 0 }}
            </div>
            <div class="text-sm mt-1" :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'">
              默写项
            </div>
          </div>
          <div class="text-center p-4 rounded-xl" :class="themeStore.theme === 'dark' ? 'bg-dark-800' : 'bg-gray-50'">
            <div class="text-3xl font-bold" :class="themeStore.theme === 'dark' ? 'text-primary-400' : 'text-primary-600'">
              {{ stats?.categoryCount || 0 }}
            </div>
            <div class="text-sm mt-1" :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'">
              分类
            </div>
          </div>
          <div class="text-center p-4 rounded-xl" :class="themeStore.theme === 'dark' ? 'bg-dark-800' : 'bg-gray-50'">
            <div class="text-3xl font-bold" :class="themeStore.theme === 'dark' ? 'text-primary-400' : 'text-primary-600'">
              {{ stats?.totalUsage || 0 }}
            </div>
            <div class="text-sm mt-1" :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'">
              使用次数
            </div>
          </div>
        </div>

        <!-- 导出部分 -->
        <div class="space-y-4">
          <h3 class="font-semibold text-lg" :class="themeStore.theme === 'dark' ? 'text-dark-100' : 'text-gray-800'">
            📤 导出数据
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              @click="exportAll"
              class="flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-lg text-left"
              :class="themeStore.theme === 'dark' ? 'border-dark-700 bg-dark-800/50 hover:bg-dark-800' : 'border-gray-200 bg-white hover:bg-gray-50'"
            >
              <div class="text-3xl">💾</div>
              <div>
                <div class="font-medium" :class="themeStore.theme === 'dark' ? 'text-dark-100' : 'text-gray-800'">
                  完整备份
                </div>
                <div class="text-sm mt-1" :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'">
                  导出所有默写集、分类和标签
                </div>
              </div>
            </button>

            <button
              @click="exportQuizzesOnly"
              class="flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-lg text-left"
              :class="themeStore.theme === 'dark' ? 'border-dark-700 bg-dark-800/50 hover:bg-dark-800' : 'border-gray-200 bg-white hover:bg-gray-50'"
            >
              <div class="text-3xl">📚</div>
              <div>
                <div class="font-medium" :class="themeStore.theme === 'dark' ? 'text-dark-100' : 'text-gray-800'">
                  仅默写集
                </div>
                <div class="text-sm mt-1" :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'">
                  导出所有默写集（不含分类）
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- 导入部分 -->
        <div class="space-y-4">
          <h3 class="font-semibold text-lg" :class="themeStore.theme === 'dark' ? 'text-dark-100' : 'text-gray-800'">
            📥 导入数据
          </h3>

          <!-- 导入选项选择 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 导入完整备份 -->
            <div 
              class="p-4 rounded-xl border transition-all cursor-pointer"
              :class="[
                importMode === 'full'
                  ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20' 
                  : themeStore.theme === 'dark' 
                    ? 'border-dark-700 bg-dark-800/50 hover:bg-dark-800' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
              ]"
              @click="importMode = 'full'"
            >
              <div class="flex items-center gap-3 mb-2">
                <div class="text-2xl">💾</div>
                <div class="font-medium" :class="themeStore.theme === 'dark' ? 'text-dark-100' : 'text-gray-800'">
                  导入完整备份
                </div>
                <div 
                  class="ml-auto w-4 h-4 rounded-full border-2"
                  :class="importMode === 'full' ? 'border-primary-500 bg-primary-500' : 'border-gray-300'"
                ></div>
              </div>
              <p class="text-sm" :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'">
                导入包含分类和标签的备份文件（单个文件）
              </p>
            </div>

            <!-- 批量导入默写集 -->
            <div 
              class="p-4 rounded-xl border transition-all cursor-pointer"
              :class="[
                importMode === 'batch'
                  ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20' 
                  : themeStore.theme === 'dark' 
                    ? 'border-dark-700 bg-dark-800/50 hover:bg-dark-800' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
              ]"
              @click="importMode = 'batch'"
            >
              <div class="flex items-center gap-3 mb-2">
                <div class="text-2xl">📚</div>
                <div class="font-medium" :class="themeStore.theme === 'dark' ? 'text-dark-100' : 'text-gray-800'">
                  批量导入默写集
                </div>
                <div 
                  class="ml-auto w-4 h-4 rounded-full border-2"
                  :class="importMode === 'batch' ? 'border-primary-500 bg-primary-500' : 'border-gray-300'"
                ></div>
              </div>
              <p class="text-sm" :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'">
                一次导入多个默写集JSON文件（支持拖拽多个文件）
              </p>
            </div>
          </div>

          <!-- 完整备份导入（单文件） -->
          <div v-if="importMode === 'full'" class="space-y-4">
            <div 
              class="border-2 border-dashed rounded-xl p-8 text-center transition-all"
              :class="[
                isDragging 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : themeStore.theme === 'dark' 
                    ? 'border-dark-700' 
                    : 'border-gray-300'
              ]"
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
              @drop.prevent="handleDropSingle"
              @click="triggerFileSelect"
            >
              <div class="text-4xl mb-3">📁</div>
              <p :class="themeStore.theme === 'dark' ? 'text-dark-300' : 'text-gray-600'">
                拖拽备份JSON文件到此处，或<span 
                  class="text-primary-500 cursor-pointer hover:underline"
                  @click.stop="triggerFileSelect"
                >点击选择文件</span>
              </p>
              <p class="text-sm mt-2" :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-400'">
                导入完整备份（包含分类和标签）
              </p>
            </div>

            <!-- 导入选项 -->
            <div class="flex flex-wrap items-center gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="importOptions.skipDuplicates"
                  class="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                >
                <span class="text-sm" :class="themeStore.theme === 'dark' ? 'text-dark-300' : 'text-gray-700'">
                  跳过重复项
                </span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="importOptions.mergeCategories"
                  class="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                >
                <span class="text-sm" :class="themeStore.theme === 'dark' ? 'text-dark-300' : 'text-gray-700'">
                  合并分类
                </span>
              </label>
            </div>
          </div>

          <!-- 批量导入（多文件） -->
          <div v-if="importMode === 'batch'" class="space-y-4">
            <!-- 分类选择 -->
            <div class="flex items-center gap-4">
              <label class="text-sm" :class="themeStore.theme === 'dark' ? 'text-dark-300' : 'text-gray-700'">
                导入到分类：
              </label>
              <select
                v-model="batchImportCategoryId"
                class="px-3 py-2 rounded-lg border transition-colors"
                :class="themeStore.theme === 'dark' ? 'bg-dark-800 border-dark-700 text-dark-300' : 'bg-white border-gray-200 text-gray-700'"
              >
                <option :value="null">不分类</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div 
              class="border-2 border-dashed rounded-xl p-8 text-center transition-all"
              :class="[
                isDragging 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : themeStore.theme === 'dark' 
                    ? 'border-dark-700' 
                    : 'border-gray-300'
              ]"
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
              @drop.prevent="handleDropMultiple"
              @click="triggerFileSelectMulti"
            >
              <div class="text-4xl mb-3">📚</div>
              <p :class="themeStore.theme === 'dark' ? 'text-dark-300' : 'text-gray-600'">
                拖拽多个JSON文件到此处，或<span 
                  class="text-primary-500 cursor-pointer hover:underline"
                  @click.stop="triggerFileSelectMulti"
                >点击选择文件</span>
              </p>
              <p class="text-sm mt-2" :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-400'">
                支持一次选择多个文件
              </p>
            </div>

            <!-- 导入选项 -->
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="importOptions.skipDuplicates"
                class="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              >
              <span class="text-sm" :class="themeStore.theme === 'dark' ? 'text-dark-300' : 'text-gray-700'">
                跳过重复项
              </span>
            </label>

            <!-- 待导入文件列表 -->
            <div v-if="pendingFiles.length > 0" class="space-y-2">
              <p class="text-sm font-medium" :class="themeStore.theme === 'dark' ? 'text-dark-300' : 'text-gray-700'">
                待导入文件 ({{ pendingFiles.length }})：
              </p>
              <div 
                class="max-h-40 overflow-y-auto space-y-1"
                :class="themeStore.theme === 'dark' ? 'bg-dark-800 rounded-lg p-2' : 'bg-gray-50 rounded-lg p-2'"
              >
                <div 
                  v-for="(file, index) in pendingFiles" 
                  :key="index"
                  class="flex items-center justify-between text-sm p-2 rounded"
                  :class="themeStore.theme === 'dark' ? 'bg-dark-700' : 'bg-white'"
                >
                  <span :class="themeStore.theme === 'dark' ? 'text-dark-300' : 'text-gray-700'">
                    {{ file.name }}
                  </span>
                  <button
                    @click="removePendingFile(index)"
                    class="text-red-500 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <button
                @click="importPendingFiles"
                :disabled="pendingFiles.length === 0"
                class="w-full px-4 py-3 rounded-xl text-white font-medium transition-colors"
                :class="pendingFiles.length > 0 ? 'bg-primary-500 hover:bg-primary-600' : 'bg-gray-300 cursor-not-allowed'"
              >
                开始导入 ({{ pendingFiles.length }} 个文件)
              </button>
            </div>

            <input
              type="file"
              ref="fileInput"
              accept=".json"
              class="hidden"
              @change="handleFileSelect"
            >
            <input
              type="file"
              ref="fileInputMulti"
              accept=".json"
              multiple
              class="hidden"
              @change="handleFileSelectMulti"
            >
          </div>
        </div>

        <!-- 危险操作 -->
        <div class="space-y-4 pt-4 border-t" :class="themeStore.theme === 'dark' ? 'border-dark-700' : 'border-gray-200'">
          <h3 class="font-semibold text-lg text-red-500">
            ⚠️ 危险操作
          </h3>

          <div class="flex gap-4">
            <button
              @click="clearAllData"
              class="flex-1 px-4 py-3 rounded-xl text-white bg-red-500 hover:bg-red-600 transition-colors"
            >
              清空所有数据
            </button>
            <button
              @click="rebuildDatabase"
              class="flex-1 px-4 py-3 rounded-xl text-white bg-orange-500 hover:bg-orange-600 transition-colors"
            >
              重建数据库
            </button>
          </div>

          <p class="text-sm" :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'">
            ⚠️ 清空数据将删除所有默写集和分类，且无法恢复。请确保已导出备份。
          </p>
        </div>
      </div>

      <!-- 导入结果提示 -->
      <div 
        v-if="importResult"
        class="p-4 border-t"
        :class="[
          importResult.success 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        ]"
      >
        <div v-if="importResult.success" class="space-y-2">
          <p class="font-medium" :class="themeStore.theme === 'dark' ? 'text-green-400' : 'text-green-800'">
            导入成功！
          </p>
          <p class="text-sm" :class="themeStore.theme === 'dark' ? 'text-green-400/80' : 'text-green-600'">
            成功导入 {{ importResult.quizzes.length }} 个默写集{{ importResult.categories.length > 0 ? `，${importResult.categories.length} 个分类` : '' }}
          </p>
          <div v-if="importResult.warnings.length" class="text-sm" :class="themeStore.theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'">
            <p>警告：</p>
            <ul class="list-disc list-inside">
              <li v-for="(warning, i) in importResult.warnings" :key="i">{{ warning }}</li>
            </ul>
          </div>
        </div>
        <div v-else class="space-y-2">
          <p class="font-medium" :class="themeStore.theme === 'dark' ? 'text-red-400' : 'text-red-800'">
            导入失败
          </p>
          <ul class="text-sm" :class="themeStore.theme === 'dark' ? 'text-red-400/80' : 'text-red-600'">
            <li v-for="(error, i) in importResult.errors" :key="i">{{ error }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import { useThemeStore } from '@/stores/themeStore'
import { db, searchOperations } from '@/db/memoDatabase'
import { 
  exportAllToFile, 
  exportQuiz, 
  importFromFile,
  importQuizFile,
  importMultipleFiles,
  exportQuizzesAsFiles,
  downloadAsJSON 
} from '@/utils/importExportManager'
import { validateQuizJSON } from '@/utils/enhancedJsonValidator'

const emit = defineEmits(['close', 'dataChanged'])

const quizStore = useQuizStore()
const themeStore = useThemeStore()

const fileInput = ref(null)
const fileInputMulti = ref(null)
const isDragging = ref(false)
const importMode = ref('full') // 'full' | 'batch'
const importResult = ref(null)
const stats = ref(null)
const pendingFiles = ref([])
const batchImportCategoryId = ref(null)

const importOptions = ref({
  skipDuplicates: true,
  mergeCategories: true
})

const categories = computed(() => quizStore.categories)

onMounted(async () => {
  stats.value = await searchOperations.getStats()
})

function triggerFileSelect() {
  fileInput.value?.click()
}

function triggerFileSelectMulti() {
  fileInputMulti.value?.click()
}

async function handleFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return

  await processImportFile(file)
  event.target.value = ''
}

async function handleFileSelectMulti(event) {
  const files = Array.from(event.target.files)
  if (files.length === 0) return

  pendingFiles.value = [...pendingFiles.value, ...files]
  event.target.value = ''
}

function removePendingFile(index) {
  pendingFiles.value.splice(index, 1)
}

async function handleDropSingle(event) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (!file) return

  await processImportFile(file)
}

async function handleDropMultiple(event) {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files).filter(f => f.name.endsWith('.json'))
  if (files.length === 0) return

  pendingFiles.value = [...pendingFiles.value, ...files]
}

async function processImportFile(file) {
  importResult.value = null

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    if (importMode.value === 'full') {
      // 导入完整备份
      importResult.value = await importFromFile(file, importOptions.value)
    } else {
      // 导入单个默写集
      const result = await importQuizFile(file, importOptions.value)
      if (result.success) {
        importResult.value = {
          success: true,
          quizzes: [{ id: result.quizId, name: data.title }],
          categories: [],
          errors: [],
          warnings: []
        }
      } else {
        importResult.value = {
          success: false,
          errors: result.errors,
          quizzes: [],
          categories: [],
          warnings: []
        }
      }
    }

    if (importResult.value.success) {
      await quizStore.loadPersistedData()
      stats.value = await searchOperations.getStats()
      emit('dataChanged')
    }
  } catch (error) {
    importResult.value = {
      success: false,
      errors: [`处理文件失败: ${error.message}`],
      quizzes: [],
      categories: [],
      warnings: []
    }
  }
}

async function importPendingFiles() {
  if (pendingFiles.value.length === 0) return

  importResult.value = {
    success: true,
    quizzes: [],
    errors: [],
    warnings: []
  }

  try {
    const result = await importMultipleFiles(pendingFiles.value, {
      skipDuplicates: importOptions.value.skipDuplicates,
      categoryId: batchImportCategoryId.value
    })

    importResult.value = result

    if (result.success) {
      pendingFiles.value = []
      await quizStore.loadPersistedData()
      stats.value = await searchOperations.getStats()
      emit('dataChanged')
    }
  } catch (error) {
    importResult.value = {
      success: false,
      errors: [`批量导入失败: ${error.message}`],
      quizzes: [],
      categories: [],
      warnings: []
    }
  }
}

async function exportAll() {
  await exportAllToFile()
}

async function exportQuizzesOnly() {
  // 批量导出每个默写集为单独文件
  const quizzes = await quizStore.savedQuizzes
  const fullQuizzes = await Promise.all(
    quizzes.map(async (quiz) => {
      const fullData = await import('@/db/memoDatabase').then(m => m.quizOperations.getQuizById(quiz.id))
      return fullData
    })
  )

  // 批量下载
  await exportQuizzesAsFiles(fullQuizzes)
}

async function clearAllData() {
  if (!confirm('确定要清空所有数据吗？此操作不可恢复！')) return
  if (!confirm('再次确认：所有默写集和分类将被删除。')) return

  try {
    await db.delete()
    window.location.reload()
  } catch (error) {
    alert('清空失败：' + error.message)
  }
}

async function rebuildDatabase() {
  if (!confirm('确定要重建数据库吗？这将清除所有数据，但会在本地存储中重新初始化。')) return

  try {
    await db.delete()
    await import('@/db/memoDatabase').then(m => new m.default())
    window.location.reload()
  } catch (error) {
    alert('重建失败：' + error.message)
  }
}
</script>
