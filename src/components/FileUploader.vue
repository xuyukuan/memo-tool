<template>
  <div class="space-y-6">
    <div class="text-center space-y-2">
      <h2 
        class="text-2xl font-bold"
        :class="themeStore.theme === 'dark' ? 'text-dark-100' : 'text-gray-800'"
      >
        导入默写文件
      </h2>
      <p 
        class="transition-colors"
        :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-600'"
      >
        上传JSON格式的默写文件开始练习
      </p>
    </div>
    
    <div
      ref="dropZone"
      class="border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300"
      :class="[
        isDragging 
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
          : themeStore.theme === 'dark' 
            ? 'border-dark-600' 
            : 'border-gray-300',
        errorMessage ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''
      ]"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <div class="space-y-4">
        <div class="text-6xl">📁</div>
        <div 
          class="text-lg transition-colors"
          :class="themeStore.theme === 'dark' ? 'text-dark-300' : 'text-gray-600'"
        >
          <button 
            @click="triggerFileSelect"
            class="text-primary-600 font-medium hover:text-primary-700 underline decoration-2 underline-offset-2"
          >
            点击选择文件
          </button>
          或拖拽文件到此处
        </div>
        <p 
          class="text-sm"
          :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-400'"
        >
          支持 .json 格式文件
        </p>
      </div>
      
      <input
        type="file"
        ref="fileInput"
        accept=".json"
        class="hidden"
        @change="handleFileSelect"
      >
    </div>
    
    <div 
      v-if="errorMessage" 
      class="border rounded-lg p-4"
      :class="themeStore.theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'"
    >
      <p class="text-red-600 dark:text-red-400">{{ errorMessage }}</p>
    </div>
    
    <div 
      v-if="successData" 
      class="border rounded-lg p-4"
      :class="themeStore.theme === 'dark' ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'"
    >
      <div class="flex items-center justify-between">
        <div>
          <p 
            class="font-medium"
            :class="themeStore.theme === 'dark' ? 'text-green-400' : 'text-green-800'"
          >
            {{ successData.title }}
          </p>
          <p 
            class="text-sm"
            :class="themeStore.theme === 'dark' ? 'text-green-400/80' : 'text-green-600'"
          >
            共 {{ successData.itemCount }} 个默写项
          </p>
        </div>
        <button
          @click="confirmLoad"
          class="px-4 py-2 rounded-lg text-white transition-colors"
          :class="themeStore.theme === 'dark' ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'"
        >
          开始选择
        </button>
      </div>
    </div>
    
    <div class="border-t pt-6" :class="themeStore.theme === 'dark' ? 'border-dark-700' : 'border-gray-200'">
      <p 
        class="text-sm mb-3"
        :class="themeStore.theme === 'dark' ? 'text-dark-400' : 'text-gray-500'"
      >
        或下载示例文件体验：
      </p>
      <div class="flex gap-4 justify-center">
        <a
          href="/sample-english.json"
          download
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
          :class="themeStore.theme === 'dark' ? 'bg-dark-800 hover:bg-dark-700' : 'bg-gray-100 hover:bg-gray-200'"
        >
          <span>🇺🇸</span> 英语默写示例
        </a>
        <a
          href="/sample-chinese.json"
          download
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
          :class="themeStore.theme === 'dark' ? 'bg-dark-800 hover:bg-dark-700' : 'bg-gray-100 hover:bg-gray-200'"
        >
          <span>🇨🇳</span> 语文默写示例
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import { useThemeStore } from '@/stores/themeStore'
import { validateQuizJSON } from '@/utils/enhancedJsonValidator'
import { BaseButton } from '@/components/ui'

const quizStore = useQuizStore()
const themeStore = useThemeStore()

const fileInput = ref(null)
const dropZone = ref(null)
const isDragging = ref(false)
const errorMessage = ref('')
const successData = ref(null)
const pendingData = ref(null)

onMounted(() => {
  if (dropZone.value) {
    dropZone.value.addEventListener('click', triggerFileSelect)
  }
})

onUnmounted(() => {
  if (dropZone.value) {
    dropZone.value.removeEventListener('click', triggerFileSelect)
  }
})

function handleDragOver() {
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

async function handleDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  processFile(file)
}

function triggerFileSelect() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

async function handleFileSelect(event) {
  const file = event.target.files[0]
  processFile(file)
  event.target.value = ''
}

async function processFile(file) {
  if (!file) return
  
  errorMessage.value = ''
  successData.value = null
  
  if (!file.name.endsWith('.json')) {
    errorMessage.value = '仅支持JSON格式文件'
    return
  }
  
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    const validation = validateQuizJSON(data)
    
    if (!validation.valid) {
      errorMessage.value = validation.errors.join('；')
      return
    }
    
    pendingData.value = data
    successData.value = {
      title: data.title,
      itemCount: validation.itemCount
    }
  } catch (error) {
    errorMessage.value = '文件解析失败：' + error.message
  }
}

function confirmLoad() {
  if (pendingData.value) {
    quizStore.loadQuizData(pendingData.value)
    successData.value = null
    pendingData.value = null
  }
}
</script>
