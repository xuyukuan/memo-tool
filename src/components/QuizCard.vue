<template>
  <div class="max-w-2xl mx-auto">
    <ProgressBar :progress="quizStore.progress" />

    <div class="text-center mb-6">
      <span
        class="inline-block px-3 py-1 rounded-full text-sm font-medium transition-colors"
        :class="[
          themeStore.theme === 'dark'
            ? 'bg-primary-900/50 text-primary-300'
            : 'bg-primary-100 text-primary-700'
        ]"
      >
        第 {{ quizStore.roundNumber }} 轮
      </span>
      <span
        class="ml-2 text-sm transition-colors"
        :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'"
      >
        ({{ quizStore.currentIndex + 1 }}/{{ quizStore.quizQueue.length }})
      </span>
    </div>

    <BaseCard>
      <div
        class="p-12 text-center min-h-[300px] flex flex-col justify-center items-center transition-opacity duration-300"
        :class="{ 'opacity-50': quizStore.showAnswer }"
      >
        <!-- Helper Toggle (音标/解释) -->
        <div class="self-end mb-4" v-if="(isEnglish && quizStore.currentItem?.pronunciation) || (!isEnglish && quizStore.currentItem?.explanation)">
          <BaseButton
            size="sm"
            :variant="quizStore.showHelper ? 'primary' : 'ghost'"
            @click="quizStore.showHelper = !quizStore.showHelper"
            :title="quizStore.showHelper ? (isEnglish ? '隐藏音标' : '隐藏解释') : (isEnglish ? '显示音标' : '显示解释')"
          >
            <span>{{ isEnglish ? '📖' : '💡' }}</span>
            <span>{{ isEnglish ? '音标' : '解释' }}</span>
          </BaseButton>
        </div>

        <p
          class="text-sm mb-4"
          :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'"
        >
          {{ isE2C ? '请翻译以下内容' : (quizStore.quizData?.type === 'english' ? '请翻译以下内容' : '请写出对应的文字') }}
        </p>
        <h2
          class="text-3xl font-bold mb-4 transition-all duration-300"
          :class="themeStore.theme === 'dark' ? 'text-dark-100' : 'text-gray-800'"
        >
          {{ isE2C ? quizStore.currentItem?.answer : quizStore.currentItem?.question }}
        </h2>
        <p
          v-if="quizStore.showHelper && quizStore.currentItem?.pronunciation && isEnglish"
          class="text-lg transition-colors"
          :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-400'"
        >
          {{ quizStore.currentItem.pronunciation }}
        </p>
        <p
          v-if="quizStore.showHelper && quizStore.currentItem?.explanation && !isEnglish"
          class="text-sm mt-2 transition-colors px-3 py-1 rounded"
          :class="themeStore.theme === 'dark' ? 'bg-dark-700 text-dark-300' : 'bg-gray-100 text-gray-600'"
        >
          💡 {{ quizStore.currentItem.explanation }}
        </p>
        <p
          v-if="isE2C && quizStore.currentItem?.example"
          class="italic mt-4 transition-colors"
          :class="themeStore.theme === 'dark' ? 'text-dark-300' : 'text-gray-600'"
        >
          "{{ quizStore.currentItem.example }}"
        </p>
      </div>

      <Transition name="flip">
        <div
          v-if="quizStore.showAnswer"
          class="p-12 text-center min-h-[300px] flex flex-col justify-center items-center transition-all duration-300"
          :class="[
            themeStore.theme === 'dark'
              ? 'bg-gradient-to-br from-dark-700 to-primary-900/30'
              : 'bg-gradient-to-br from-primary-50 to-blue-50'
          ]"
        >
          <p
            class="text-sm mb-4"
            :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'"
          >
            答案
          </p>
          <h2
            class="text-4xl font-bold mb-4 transition-all duration-300"
            :class="themeStore.theme === 'dark' ? 'text-primary-400' : 'text-primary-700'"
          >
            {{ isE2C ? quizStore.currentItem?.question : quizStore.currentItem?.answer }}
          </h2>
          <p
            v-if="!isE2C && quizStore.currentItem?.example"
            class="italic mt-4 transition-colors"
            :class="themeStore.theme === 'dark' ? 'text-dark-300' : 'text-gray-600'"
          >
            "{{ quizStore.currentItem.example }}"
          </p>
        </div>
      </Transition>
    </BaseCard>

    <div class="mt-8 text-center">
      <Transition name="slide-up" mode="out-in">
        <div v-if="!quizStore.showAnswer" key="show-hint">
          <p
            class="transition-colors"
            :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'"
          >
            按 <kbd
              class="px-2 py-1 rounded transition-colors"
              :class="themeStore.theme === 'dark' ? 'bg-dark-700' : 'bg-gray-100'"
            >空格</kbd> 显示答案
          </p>
        </div>
        <div v-else key="judge-hint" class="space-y-4">
          <p
            class="transition-colors"
            :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'"
          >
            你的答案是否正确？
          </p>
          <div class="flex gap-4 justify-center">
            <BaseButton variant="danger" @click="handleWrong">
              <span>❌</span> 错误
            </BaseButton>
            <BaseButton variant="success" @click="handleCorrect">
              <span>✅</span> 正确
            </BaseButton>
          </div>
          <p
            class="text-sm transition-colors"
            :class="themeStore.theme === 'dark' ? 'text-dark-500' : 'text-gray-400'"
          >
            也可以按 ← → 键快速判断
          </p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import { useThemeStore } from '@/stores/themeStore'
import { playRevealSound, playCorrectSound, playWrongSound } from '@/utils/soundGenerator'
import { BaseButton, BaseCard } from '@/components/ui'
import ProgressBar from './ProgressBar.vue'

const quizStore = useQuizStore()
const themeStore = useThemeStore()

const isEnglish = computed(() => quizStore.quizData?.type === 'english')
const isE2C = computed(() => isEnglish.value && quizStore.quizDirection === 'e2c')

function handleKeydown(event) {
  if (quizStore.currentPhase !== 'quiz') return

  switch (event.code) {
    case 'Space':
      event.preventDefault()
      if (!quizStore.showAnswer) {
        quizStore.showAnswer = true
        playRevealSound()
      }
      break
    case 'ArrowLeft':
      event.preventDefault()
      if (quizStore.showAnswer) {
        handleWrong()
      }
      break
    case 'ArrowRight':
      event.preventDefault()
      if (quizStore.showAnswer) {
        handleCorrect()
      }
      break
    case 'Escape':
      event.preventDefault()
      if (confirm('确定要退出练习吗？')) {
        quizStore.exitQuizWithoutComplete()
      }
      break
  }
}

function handleWrong() {
  quizStore.markAnswer(false)
  playWrongSound()
}

function handleCorrect() {
  quizStore.markAnswer(true)
  playCorrectSound()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.flip-enter-active {
  transition: all 0.5s ease;
}

.flip-leave-active {
  transition: all 0.3s ease;
}

.flip-enter-from {
  opacity: 0;
  transform: rotateX(90deg);
}

.flip-leave-to {
  opacity: 0;
  transform: rotateX(-90deg);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
