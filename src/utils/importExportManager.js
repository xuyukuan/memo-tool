/**
 * 导入导出管理器
 * 支持数据备份、恢复和跨浏览器同步
 */

import { quizOperations, categoryOperations, searchOperations } from '@/db/memoDatabase'
import { normalizeQuizData, validateQuizJSON } from './enhancedJsonValidator'

/**
 * 导出所有数据
 * @param {Object} options - 导出选项
 * @returns {Promise<Object>} 导出的数据
 */
export async function exportAllData(options = {}) {
  const {
    includeLearningRecords = false,
    includeSettings = true
  } = options

  const quizzes = await quizOperations.getAllQuizzes()
  const categories = await categoryOperations.getAllCategories()
  const stats = await searchOperations.getStats()

  // 获取每个默写集的完整数据（包括项）
  const fullQuizzes = await Promise.all(
    quizzes.map(async (quiz) => {
      const fullData = await quizOperations.getQuizById(quiz.id)
      return fullData
    })
  )

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    appName: 'memo-tool',
    stats,
    data: {
      categories: categories,
      quizzes: fullQuizzes
    }
  }

  return exportData
}

/**
 * 导出单个默写集
 * @param {number} quizId - 默写集ID
 * @returns {Promise<Object>} 导出的默写集数据
 */
export async function exportQuiz(quizId) {
  const fullQuiz = await quizOperations.getQuizById(quizId)
  
  if (!fullQuiz) {
    throw new Error('默写集不存在')
  }

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    appName: 'memo-tool',
    data: {
      title: fullQuiz.name,
      type: fullQuiz.type,
      description: fullQuiz.description,
      tags: fullQuiz.tags,
      categoryId: fullQuiz.categoryId,
      items: fullQuiz.items.map(item => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
        pronunciation: item.pronunciation,
        example: item.example,
        explanation: item.explanation
      }))
    }
  }
}

/**
 * 导出为JSON文件
 * @param {Object} data - 要导出的数据
 * @param {string} filename - 文件名
 */
export function downloadAsJSON(data, filename = 'memo-tool-backup.json') {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 批量导出多个默写集为单独的文件
 * @param {Array} quizzes - 默写集数组（包含完整数据）
 */
export async function exportQuizzesAsFiles(quizzes) {
  for (let i = 0; i < quizzes.length; i++) {
    const quiz = quizzes[i]
    
    // 构建单个默写集数据（不含ID，导入时自动生成）
    const quizData = {
      title: quiz.name,
      type: quiz.type,
      description: quiz.description || '',
      items: quiz.items.map(item => ({
        question: item.question,
        answer: item.answer,
        pronunciation: item.pronunciation,
        example: item.example,
        explanation: item.explanation
      }))
    }
    
    // 生成文件名（处理特殊字符）
    const safeName = quiz.name.replace(/[\/\\:*?"<>|]/g, '_')
    const filename = `${safeName}.json`
    
    downloadAsJSON(quizData, filename)
    
    // 每500ms触发一个下载，避免浏览器阻止多个下载
    if (i < quizzes.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
}

/**
 * 批量导入多个文件
 * @param {Array} files - File数组
 * @param {Object} options - 导入选项
 * @returns {Promise<Object>} 导入结果
 */
export async function importMultipleFiles(files, options = {}) {
  const {
    skipDuplicates = true,
    categoryId = null
  } = options

  const result = {
    success: true,
    quizzes: [],
    errors: [],
    warnings: []
  }

  for (const file of files) {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const validation = validateQuizJSON(data)

      if (!validation.valid) {
        result.errors.push(`${file.name}: ${validation.errors.join('; ')}`)
        result.success = false
        continue
      }

      // 验证是否重复
      if (skipDuplicates) {
        const existingQuizzes = await quizOperations.getAllQuizzes()
        const isDuplicate = existingQuizzes.some(q => q.name === data.title)
        if (isDuplicate) {
          result.warnings.push(`${file.name}: 已存在相同名称的默写集，跳过`)
          continue
        }
      }

      // 设置分类
      validation.data.categoryId = categoryId

      // 导入
      const quizId = await quizOperations.createQuiz(validation.data, {
        categoryId: categoryId,
        tags: data.tags || [],
        isFavorite: false
      })

      result.quizzes.push({
        id: quizId,
        name: data.title,
        itemCount: validation.itemCount
      })
    } catch (error) {
      result.errors.push(`${file.name}: ${error.message}`)
      result.success = false
    }
  }

  return result
}

/**
 * 导出所有数据为文件
 */
export async function exportAllToFile() {
  const data = await exportAllData()
  const filename = `memo-tool-backup-${formatDate(new Date())}.json`
  downloadAsJSON(data, filename)
}

/**
 * 导入数据
 * @param {Object} data - 要导入的数据
 * @param {Object} options - 导入选项
 * @returns {Promise<Object>} 导入结果
 */
export async function importData(data, options = {}) {
  const {
    skipDuplicates = true,
    mergeCategories = true
  } = options

  const result = {
    success: true,
    quizzes: [],
    categories: [],
    errors: [],
    warnings: []
  }

  // 验证数据格式
  if (!data.data || !data.data.quizzes) {
    result.success = false
    result.errors.push('数据格式无效')
    return result
  }

  // 导入分类
  if (data.data.categories && data.data.categories.length > 0) {
    const categoryResult = await importCategories(data.data.categories, { merge: mergeCategories })
    result.categories = categoryResult.imported
    result.warnings.push(...categoryResult.warnings)
  }

  // 导入默写集
  for (const quizData of data.data.quizzes) {
    try {
      // 检查是否重复
      const existingQuizzes = await quizOperations.getAllQuizzes()
      const isDuplicate = existingQuizzes.some(q => q.name === quizData.name)

      if (isDuplicate && skipDuplicates) {
        result.warnings.push(`跳过重复的默写集: ${quizData.name}`)
        continue
      }

      // 创建默写集
      const quizId = await quizOperations.createQuiz(quizData, {
        categoryId: quizData.categoryId,
        tags: quizData.tags || [],
        isFavorite: quizData.isFavorite || false
      })

      result.quizzes.push({
        id: quizId,
        name: quizData.name,
        itemCount: quizData.items?.length || 0
      })
    } catch (error) {
      result.errors.push(`导入 "${quizData.name}" 失败: ${error.message}`)
    }
  }

  result.success = result.errors.length === 0
  return result
}

/**
 * 导入分类
 */
async function importCategories(categories, options = {}) {
  const { merge = true } = options
  const result = {
    imported: [],
    skipped: [],
    warnings: []
  }

  const existingCategories = await categoryOperations.getAllCategories()
  const existingNames = new Set(existingCategories.map(c => c.name))

  for (const category of categories) {
    if (existingNames.has(category.name)) {
      if (merge) {
        result.skipped.push(category.name)
      } else {
        // 添加后缀以避免重复
        const newName = `${category.name} (导入)`
        await categoryOperations.createCategory(newName, category.parentId)
        result.imported.push(newName)
      }
    } else {
      await categoryOperations.createCategory(category.name, category.parentId)
      result.imported.push(category.name)
    }
  }

  return result
}

/**
 * 从文件导入
 * @param {File} file - JSON文件
 * @param {Object} options - 导入选项
 * @returns {Promise<Object>} 导入结果
 */
export async function importFromFile(file, options = {}) {
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    return await importData(data, options)
  } catch (error) {
    return {
      success: false,
      errors: [`文件解析失败: ${error.message}`],
      quizzes: [],
      categories: [],
      warnings: []
    }
  }
}

/**
 * 导入单个默写集文件
 * @param {File} file - JSON文件
 * @param {Object} options - 导入选项
 * @returns {Promise<Object>} 导入结果
 */
export async function importQuizFile(file, options = {}) {
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    
    // 标准化数据
    const normalizedData = normalizeQuizData(data)
    
    // 验证数据
    const validation = validateQuizData(normalizedData)
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
        data: null
      }
    }

    // 检查重复
    const existingQuizzes = await quizOperations.getAllQuizzes()
    const isDuplicate = existingQuizzes.some(q => q.name === normalizedData.title)

    if (isDuplicate && options.skipDuplicates !== false) {
      return {
        success: false,
        errors: ['已存在相同名称的默写集'],
        data: null
      }
    }

    // 创建默写集
    const quizId = await quizOperations.createQuiz(normalizedData, options)

    return {
      success: true,
      quizId,
      data: normalizedData
    }
  } catch (error) {
    return {
      success: false,
      errors: [`文件解析失败: ${error.message}`],
      data: null
    }
  }
}

/**
 * 验证导入的数据格式
 */
function validateQuizData(data) {
  const errors = []

  if (!data.title) errors.push('缺少标题')
  if (!data.type) errors.push('缺少类型')
  if (!data.items || !Array.isArray(data.items)) {
    errors.push('缺少默写项')
    return { valid: false, errors }
  }
  if (data.items.length === 0) errors.push('默写项列表为空')

  data.items.forEach((item, index) => {
    if (!item.id) errors.push(`第${index + 1}项缺少ID`)
    if (!item.question) errors.push(`第${index + 1}项缺少题目`)
    if (!item.answer) errors.push(`第${index + 1}项缺少答案`)
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 生成带日期的文件名
 */
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

/**
 * 选择性导出（按分类或标签）
 */
export async function exportByFilter(filter, options = {}) {
  const quizzes = await searchOperations.searchQuizzes('', filter)
  
  const fullQuizzes = await Promise.all(
    quizzes.map(async (quiz) => {
      const fullData = await quizOperations.getQuizById(quiz.id)
      return fullData
    })
  )

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    appName: 'memo-tool',
    filter,
    data: {
      categories: [],
      quizzes: fullQuizzes
    }
  }
}

/**
 * 合并两个默写集
 */
export async function mergeQuizzes(quizIds, newName) {
  const quizzes = await Promise.all(
    quizIds.map(id => quizOperations.getQuizById(id))
  )

  // 合并所有项
  const allItems = []
  const existingAnswers = new Set()

  for (const quiz of quizzes) {
    if (!quiz?.items) continue
    
    for (const item of quiz.items) {
      // 避免重复的答案
      if (!existingAnswers.has(item.answer)) {
        existingAnswers.add(item.answer)
        allItems.push(item)
      }
    }
  }

  const mergedQuiz = {
    title: newName || `${quizzes.map(q => q.name).join(' + ')}`,
    type: quizzes[0]?.type || 'english',
    description: `合并自 ${quizzes.length} 个默写集`,
    items: allItems
  }

  const quizId = await quizOperations.createQuiz(mergedQuiz, {
    tags: ['merged']
  })

  return quizId
}

export default {
  exportAllData,
  exportQuiz,
  exportAllToFile,
  downloadAsJSON,
  importData,
  importFromFile,
  importQuizFile,
  exportByFilter,
  mergeQuizzes
}
