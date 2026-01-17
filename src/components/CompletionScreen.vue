<template>
  <div class="max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
    <div 
      class="text-8xl mb-4"
      :class="isPerfect ? 'animate-bounce-gentle' : ''"
    >
      {{ isPerfect ? '🎉' : '✅' }}
    </div>
    
    <div>
      <h2 
        class="text-3xl font-bold mb-2"
        :class="themeStore.theme === 'dark' ? 'text-dark-100' : 'text-gray-800'"
      >
        {{ isPerfect ? '完美完成！' : '默写完成！' }}
      </h2>
      <p 
        class="transition-colors"
        :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-600'"
      >
        {{ isPerfect ? '所有题目都正确回答了！' : '你已经完成了所有默写练习。' }}
      </p>
    </div>
    
    <div 
      class="grid grid-cols-3 gap-4 p-6 rounded-xl"
      :class="themeStore.theme === 'dark' ? 'bg-dark-800' : 'bg-white border'"
    >
      <div>
        <p 
          class="text-sm"
          :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'"
        >
          总题数
        </p>
        <p 
          class="text-2xl font-bold mt-1"
          :class="themeStore.theme === 'dark' ? 'text-dark-100' : 'text-gray-800'"
        >
          {{ quizStore.stats.total }}
        </p>
      </div>
      <div>
        <p 
          class="text-sm"
          :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'"
        >
          正确
        </p>
        <p 
          class="text-2xl font-bold mt-1 text-green-600"
        >
          {{ quizStore.stats.correct }}
        </p>
      </div>
      <div>
        <p 
          class="text-sm"
          :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'"
        >
          错误
        </p>
        <p 
          class="text-2xl font-bold mt-1 text-red-600"
        >
          {{ quizStore.stats.wrong }}
        </p>
      </div>
    </div>
    
    <div>
      <p 
        class="text-sm mb-2"
        :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'"
      >
        正确率
      </p>
      <div 
        class="relative h-4 rounded-full overflow-hidden"
        :class="themeStore.theme === 'dark' ? 'bg-dark-700' : 'bg-gray-200'"
      >
        <div 
          class="absolute inset-y-0 left-0 transition-all duration-1000 rounded-full"
          :class="getAccuracyColorClass()"
          :style="{ width: `${quizStore.stats.accuracy}%` }"
        ></div>
      </div>
      <p 
        class="text-4xl font-bold mt-2"
        :class="getAccuracyColorClass()"
      >
        {{ quizStore.stats.accuracy }}%
      </p>
    </div>
    
    <div class="space-y-3">
      <button
        @click="restartQuiz"
        class="w-full px-8 py-4 rounded-xl text-white text-lg font-medium transition-all transform hover:scale-105"
        :class="themeStore.theme === 'dark' ? 'bg-primary-700 hover:bg-primary-600' : 'bg-primary-600 hover:bg-primary-700'"
      >
        🔄 重新开始
      </button>
      <button
        @click="goBack"
        class="w-full px-8 py-4 rounded-xl text-lg font-medium transition-colors border"
        :class="themeStore.theme === 'dark' 
          ? 'bg-dark-800 border-dark-700 text-dark-200 hover:bg-dark-700' 
          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'"
      >
        📁 上传新文件
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import { useThemeStore } from '@/stores/themeStore'
import { playCompleteSound } from '@/utils/soundGenerator'

const quizStore = useQuizStore()
const themeStore = useThemeStore()

const isPerfect = computed(() => {
  return quizStore.stats.accuracy === 100 && quizStore.stats.wrong === 0
})

function getAccuracyColorClass() {
  const accuracy = quizStore.stats.accuracy
  if (accuracy >= 90) return 'text-green-600'
  if (accuracy >= 70) return 'text-blue-600'
  if (accuracy >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

function restartQuiz() {
  quizStore.loadQuizData(quizStore.quizData)
}

function goBack() {
  quizStore.reset()
}

playCompleteSound()
</script>
