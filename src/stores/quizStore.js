import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { quizOperations, learningRecordOperations, importHistoryOperations } from '@/db/memoDatabase'

export const useQuizStore = defineStore('quiz', () => {
  // 状态
  const currentPhase = ref('import')
  const quizData = ref(null)
  const selectedItems = ref([])
  const quizQueue = ref([])
  const currentIndex = ref(0)
  const currentItem = ref(null)
  const showAnswer = ref(false)
  const roundNumber = ref(1)
  const wrongItems = ref([])
  const stats = ref({
    total: 0,
    correct: 0,
    wrong: 0,
    accuracy: 0
  })
  
  // 持久化相关状态
  const savedQuizzes = ref([])
  const categories = ref([])
  const recentQuizzes = ref([])
  const searchQuery = ref('')
  const activeFilters = ref({
    type: null,
    categoryId: null,
    tags: [],
    favoriteOnly: false
  })
  // 标记练习是否已开始（用于决定是否增加使用次数）
  const isQuizStarted = ref(false)
  
  // 辅助信息显示控制（英语模式：音标，语文模式：解释）
  const showHelper = ref(false)

  // 计算属性
  const progress = computed(() => {
    if (quizQueue.value.length === 0) return 0
    return ((currentIndex.value) / quizQueue.value.length) * 100
  })
  
  const isQuizComplete = computed(() => {
    return currentPhase.value === 'complete'
  })
  
  const canProceedToNextRound = computed(() => {
    return wrongItems.value.length > 0 && roundNumber.value < 10
  })

  const filteredQuizzes = computed(() => {
    let results = savedQuizzes.value

    // 应用筛选条件
    if (activeFilters.value.type) {
      results = results.filter(q => q.type === activeFilters.value.type)
    }
    if (activeFilters.value.categoryId === 'uncategorized') {
      results = results.filter(q => !q.categoryId)
    } else if (activeFilters.value.categoryId) {
      results = results.filter(q => q.categoryId === activeFilters.value.categoryId)
    }
    if (activeFilters.value.tags.length > 0) {
      results = results.filter(q => 
        activeFilters.value.tags.some(tag => q.tags?.includes(tag))
      )
    }
    if (activeFilters.value.favoriteOnly) {
      results = results.filter(q => q.isFavorite)
    }

    // 应用搜索
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      results = results.filter(q => 
        q.name.toLowerCase().includes(query) ||
        q.description?.toLowerCase().includes(query)
      )
    }

    return results
  })

  // 加载持久化数据
  async function loadPersistedData() {
    try {
      const { categoryOperations } = await import('@/db/memoDatabase')
      
      const [quizzes, cats, recent] = await Promise.all([
        quizOperations.getAllQuizzes(),
        categoryOperations.getAllCategories(),
        importHistoryOperations.getRecentQuizzes(10)
      ])
      
      // 如果没有分类，创建默认分类
      if (cats.length === 0) {
        await categoryOperations.createCategory('英语')
        await categoryOperations.createCategory('语文')
        await categoryOperations.createCategory('其他')
        const newCats = await categoryOperations.getAllCategories()
        categories.value = newCats
      } else {
        categories.value = cats
      }
      
      savedQuizzes.value = quizzes
      recentQuizzes.value = recent
    } catch (error) {
      console.error('加载持久化数据失败:', error)
    }
  }

  // 导入和保存默写集
  async function importAndSave(data) {
    const { normalizeQuizDataWithNewIds } = await import('@/utils/enhancedJsonValidator')
    
    // 为所有item生成新的唯一ID
    const normalizedData = normalizeQuizDataWithNewIds(data)
    
    const quizId = await quizOperations.createQuiz(normalizedData, {
      categoryId: data.categoryId || null,
      tags: data.tags || [],
      isFavorite: false
    })

    // 记录到导入历史
    await importHistoryOperations.recordImport(quizId, data.title)

    // 刷新列表
    await loadPersistedData()

    return quizId
  }

  // 从持久化加载默写集并直接开始练习
  async function loadAndStartQuiz(quizId) {
    const fullQuiz = await quizOperations.getQuizById(quizId)
    if (fullQuiz) {
      // 不在这里增加使用次数，完成练习时才增加
      quizData.value = {
        id: fullQuiz.id,
        title: fullQuiz.name,
        type: fullQuiz.type,
        description: fullQuiz.description,
        items: fullQuiz.items
      }
      selectedItems.value = [...fullQuiz.items]
      isQuizStarted.value = true
      
      // 直接开始练习
      startQuiz()
    }
    return fullQuiz
  }

  // 原有方法（保持兼容性）
  function loadQuizData(data) {
    quizData.value = data
    selectedItems.value = [...data.items]
    currentPhase.value = 'select'
  }
  
  // 从已保存的默写集进入选择阶段
  async function selectQuiz(quizId) {
    const fullQuiz = await quizOperations.getQuizById(quizId)
    if (fullQuiz) {
      quizData.value = {
        id: fullQuiz.id,
        title: fullQuiz.name,
        type: fullQuiz.type,
        description: fullQuiz.description,
        items: fullQuiz.items
      }
      selectedItems.value = [...fullQuiz.items]
      currentPhase.value = 'select'
    }
    return fullQuiz
  }
  
  function startQuiz() {
    if (selectedItems.value.length === 0) return
    
    quizQueue.value = [...selectedItems.value].map(item => ({
      ...item,
      status: 'pending'
    }))
    
    currentIndex.value = 0
    currentItem.value = quizQueue.value[0]
    showAnswer.value = false
    roundNumber.value = 1
    wrongItems.value = []
    
    stats.value = {
      total: selectedItems.value.length,
      correct: 0,
      wrong: 0,
      accuracy: 0
    }
    
    currentPhase.value = 'quiz'
  }
  
  async function markAnswer(isCorrect) {
    const currentItemIndex = currentIndex.value
    quizQueue.value[currentItemIndex].status = isCorrect ? 'correct' : 'wrong'
    
    if (isCorrect) {
      stats.value.correct++
    } else {
      wrongItems.value.push(quizQueue.value[currentItemIndex])
      stats.value.wrong++
    }
    
    const processed = stats.value.correct + stats.value.wrong
    stats.value.accuracy = Math.round((stats.value.correct / processed) * 100)
    
    // 记录学习
    if (quizData.value?.id && currentItem.value) {
      await learningRecordOperations.recordAttempt(
        quizData.value.id,
        currentItem.value.id,
        isCorrect,
        roundNumber.value
      )
    }
    
    moveToNextItem()
  }
  
  function moveToNextItem() {
    if (currentIndex.value < quizQueue.value.length - 1) {
      currentIndex.value++
      currentItem.value = quizQueue.value[currentIndex.value]
      showAnswer.value = false
    } else {
      finishCurrentRound()
    }
  }
  
  function finishCurrentRound() {
    if (wrongItems.value.length > 0 && canProceedToNextRound.value) {
      roundNumber.value++
      quizQueue.value = [...wrongItems.value].map(item => ({
        ...item,
        status: 'pending'
      }))
      currentIndex.value = 0
      currentItem.value = quizQueue.value[0]
      showAnswer.value = false
      wrongItems.value = []
    } else {
      // 完成时增加使用次数
      if (quizData.value?.id && isQuizStarted.value) {
        quizOperations.incrementUsage(quizData.value.id)
        isQuizStarted.value = false
      }
      currentPhase.value = 'complete'
    }
  }
  
  // 中途退出练习（不增加使用次数）
  function exitQuizWithoutComplete() {
    isQuizStarted.value = false
    reset()
  }
  
  function reset() {
    currentPhase.value = 'import'
    quizData.value = null
    selectedItems.value = []
    quizQueue.value = []
    currentIndex.value = 0
    currentItem.value = null
    showAnswer.value = false
    roundNumber.value = 1
    wrongItems.value = []
    stats.value = {
      total: 0,
      correct: 0,
      wrong: 0,
      accuracy: 0
    }
  }
  
  function toggleItemSelection(itemId) {
    const index = selectedItems.value.findIndex(item => item.id === itemId)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    } else {
      const item = quizData.value.items.find(i => i.id === itemId)
      if (item) selectedItems.value.push(item)
    }
  }
  
  function selectAllItems() {
    selectedItems.value = [...quizData.value.items]
  }
  
  function deselectAllItems() {
    selectedItems.value = []
  }

  // 搜索和筛选
  function setSearchQuery(query) {
    searchQuery.value = query
  }

  function setFilters(filters) {
    activeFilters.value = { ...activeFilters.value, ...filters }
  }

  function clearFilters() {
    searchQuery.value = ''
    activeFilters.value = {
      type: null,
      categoryId: null,
      tags: [],
      favoriteOnly: false
    }
  }

  // 收藏管理
  async function toggleFavorite(quizId) {
    const newState = await quizOperations.toggleFavorite(quizId)
    const quiz = savedQuizzes.value.find(q => q.id === quizId)
    if (quiz) {
      quiz.isFavorite = newState
    }
    return newState
  }

  // 删除默写集
  async function deleteQuiz(quizId) {
    await quizOperations.deleteQuiz(quizId)
    await loadPersistedData()
  }

  // 批量删除
  async function deleteQuizzes(quizIds) {
    await quizOperations.deleteQuizzes(quizIds)
    await loadPersistedData()
  }

  // 获取学习统计
  async function getQuizStats(quizId) {
    return await learningRecordOperations.getQuizStats(quizId)
  }

  return {
    // 原有状态
    currentPhase,
    quizData,
    selectedItems,
    quizQueue,
    currentIndex,
    currentItem,
    showAnswer,
    roundNumber,
    wrongItems,
    stats,
    progress,
    isQuizComplete,
    canProceedToNextRound,
    isQuizStarted,
    showHelper,
     
    // 持久化状态
    savedQuizzes,
    categories,
    recentQuizzes,
    searchQuery,
    activeFilters,
    filteredQuizzes,
    
    // 方法
    loadPersistedData,
    importAndSave,
    loadAndStartQuiz,
    loadQuizData,
    selectQuiz,
    startQuiz,
    markAnswer,
    reset,
    exitQuizWithoutComplete,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    setSearchQuery,
    setFilters,
    clearFilters,
    toggleFavorite,
    deleteQuiz,
    deleteQuizzes,
    getQuizStats
  }
})
