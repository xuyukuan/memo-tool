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

    <BaseCard>
      <div class="grid grid-cols-3 gap-4 p-6">
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
          <p class="text-2xl font-bold mt-1 text-green-600">
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
          <p class="text-2xl font-bold mt-1 text-red-600">
            {{ quizStore.stats.wrong }}
          </p>
        </div>
      </div>
    </BaseCard>

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
      <BaseButton class="w-full" @click="restartQuiz">
        🔄 重新开始
      </BaseButton>
      <BaseButton variant="secondary" class="w-full" @click="goBack">
        📁 上传新文件
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import { useThemeStore } from '@/stores/themeStore'
import { playCompleteSound } from '@/utils/soundGenerator'
import { BaseButton, BaseCard } from '@/components/ui'

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
