<template>
  <div 
    class="min-h-screen transition-colors duration-300" 
    :class="themeStore.theme === 'dark' ? 'bg-dark-900' : 'bg-gray-50'"
    @keydown="handleGlobalKeydown" 
    tabindex="0"
  >
    <header 
      class="shadow-sm border-b transition-colors duration-300"
      :class="themeStore.theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'"
    >
      <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h1 
            class="text-xl font-bold transition-colors"
            :class="themeStore.theme === 'dark' ? 'text-dark-100' : 'text-gray-800'"
          >
            📝 默写练习
          </h1>
          <button
            v-if="quizStore.currentPhase === 'import'"
            @click="showLibrary = !showLibrary"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
            :class="showLibrary 
              ? 'bg-primary-500 text-white' 
              : themeStore.theme === 'dark' 
                ? 'bg-dark-700 text-dark-300 hover:bg-dark-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            <span>📚</span>
            <span>{{ showLibrary ? '返回导入' : '我的默写库' }}</span>
          </button>
        </div>
        <div class="flex items-center gap-3">
          <button
            v-if="quizStore.currentPhase === 'import'"
            @click="showImportExport = true"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
            :class="themeStore.theme === 'dark' ? 'bg-dark-700 text-dark-300 hover:bg-dark-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            <span>⚙️</span>
            <span>数据管理</span>
          </button>
          <ShortcutsHelp v-if="quizStore.currentPhase === 'quiz'" />
          <ThemeToggle />
          <SoundControl />
        </div>
      </div>
    </header>
    
    <main class="max-w-4xl mx-auto px-4 py-8">
      <Transition name="fade" mode="out-in">
        <!-- 默写库管理界面 -->
        <QuizManager 
          v-if="showLibrary && quizStore.currentPhase === 'import'" 
          @openExport="showImportExport = true"
          @editQuiz="handleEditQuiz"
          @quizStarted="handleQuizStarted"
        />
        
        <!-- 原有界面 -->
        <template v-else>
          <FileUploader v-if="quizStore.currentPhase === 'import'" />
          <QuizList v-else-if="quizStore.currentPhase === 'select'" />
          <QuizCard v-else-if="quizStore.currentPhase === 'quiz'" />
          <CompletionScreen v-else-if="quizStore.currentPhase === 'complete'" />
        </template>
      </Transition>
    </main>

    <!-- 导入导出弹窗 -->
    <ImportExport 
      v-if="showImportExport" 
      @close="showImportExport = false"
      @dataChanged="handleDataChanged"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import { useThemeStore } from '@/stores/themeStore'
import FileUploader from '@/components/FileUploader.vue'
import QuizList from '@/components/QuizList.vue'
import QuizCard from '@/components/QuizCard.vue'
import CompletionScreen from '@/components/CompletionScreen.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import SoundControl from '@/components/SoundControl.vue'
import ShortcutsHelp from '@/components/ShortcutsHelp.vue'
import QuizManager from '@/components/QuizManager.vue'
import ImportExport from '@/components/ImportExport.vue'

const quizStore = useQuizStore()
const themeStore = useThemeStore()

const showLibrary = ref(false)
const showImportExport = ref(false)

onMounted(() => {
  themeStore.initTheme()
  themeStore.setupSystemThemeListener()
})

function handleGlobalKeydown(event) {
  if (event.code === 'Space' && quizStore.currentPhase === 'quiz') {
    event.preventDefault()
  }
}

function handleDataChanged() {
  quizStore.loadPersistedData()
}

function handleEditQuiz(quiz) {
  console.log('编辑默写集:', quiz)
  // TODO: 实现编辑功能
  alert('编辑功能开发中')
}

function handleQuizStarted() {
  showLibrary.value = false
  // 直接开始练习（不经过选择页面）
  quizStore.startQuiz()
}
</script>
