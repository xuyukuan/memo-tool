/**
 * 扩展的JSON验证器
 * 支持更多字段和更详细的验证
 */

/**
 * 验证默写JSON数据
 * @param {Object} data - 要验证的数据
 * @param {Object} options - 验证选项
 * @returns {Object} 验证结果 { valid, errors, warnings, data }
 */
export function validateQuizJSON(data, options = {}) {
  const { strict = false } = options
  const errors = []
  const warnings = []

  // 必填字段验证
  if (!data.title || typeof data.title !== 'string') {
    errors.push('缺少标题或标题格式错误')
  } else if (data.title.length > 200) {
    errors.push('标题长度不能超过200个字符')
  }

  if (!data.type || !['english', 'chinese'].includes(data.type)) {
    errors.push('缺少类型或类型不支持（仅支持 english/chinese）')
  }

  if (!data.items || !Array.isArray(data.items)) {
    errors.push('缺少默写项列表')
    return { valid: false, errors, warnings, data: null }
  }

  if (data.items.length === 0) {
    errors.push('默写项列表为空')
  }

  if (data.items.length > 10000) {
    errors.push('默写项数量超过限制（最大10000个）')
  }

  // 验证每个项
  const validatedItems = []
  data.items.forEach((item, index) => {
    const itemErrors = []
    const itemWarnings = []

    // 必填字段 - ID改为可选，导入时自动生成
    if (!item.question || typeof item.question !== 'string') {
      itemErrors.push(`第${index + 1}项缺少题目或题目格式错误`)
    }
    if (!item.answer || typeof item.answer !== 'string') {
      itemErrors.push(`第${index + 1}项缺少答案或答案格式错误`)
    }

    // 可选字段验证
    if (item.pronunciation && typeof item.pronunciation !== 'string') {
      itemWarnings.push(`第${index + 1}项音标格式不正确`)
    }
    if (item.example && typeof item.example !== 'string') {
      itemWarnings.push(`第${index + 1}项例句格式不正确`)
    }
    if (item.explanation && typeof item.explanation !== 'string') {
      itemWarnings.push(`第${index + 1}项解释格式不正确`)
    }

    // 如果没有错误，添加到验证列表（ID在normalizeQuizData中生成）
    if (!itemErrors.length) {
      validatedItems.push({
        ...item,
        id: undefined  // 标记为需要重新生成ID
      })
    }

    // 收集错误和警告
    errors.push(...itemErrors)
    warnings.push(...itemWarnings)
  })

  // 生成唯一ID（如果没有提供）
  if (!data.id) {
    data.id = generateQuizId()
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    itemCount: validatedItems.length,
    data: {
      ...data,
      items: validatedItems
    }
  }
}

/**
 * 验证导入数据是否与现有数据重复
 * @param {Object} newData - 新导入的数据
 * @param {Array} existingQuizzes - 现有的默写集列表
 * @returns {Object} 重复检测结果 { isDuplicate, similarQuizzes }
 */
export function checkForDuplicates(newData, existingQuizzes) {
  const similarQuizzes = []

  for (const quiz of existingQuizzes) {
    // 检查名称是否相同
    if (quiz.name === newData.title) {
      similarQuizzes.push({
        id: quiz.id,
        name: quiz.name,
        reason: '名称完全相同'
      })
      continue
    }

    // 检查项数量和类型是否相同
    if (quiz.type === newData.type && quiz.itemCount === newData.items.length) {
      similarQuizzes.push({
        id: quiz.id,
        name: quiz.name,
        reason: `类型相同且都有 ${newData.items.length} 个默写项`
      })
    }
  }

  return {
    isDuplicate: similarQuizzes.length > 0,
    similarQuizzes
  }
}

/**
 * 生成默写项ID
 */
function generateItemId(type, answer, index) {
  const prefix = type === 'english' ? 'en' : 'cn'
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 6)
  return `${prefix}-${timestamp}-${random}-${index}`
}

/**
 * 生成默写集ID
 */
function generateQuizId() {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `quiz-${timestamp}-${random}`
}

/**
 * 清理和标准化数据
 */
export function normalizeQuizData(data) {
  return {
    ...data,
    id: data.id || generateQuizId(),
    description: data.description || '',
    items: data.items.map((item, index) => ({
      id: item.id || generateItemId(data.type, item.answer, index),
      question: item.question.trim(),
      answer: item.answer.trim(),
      pronunciation: item.pronunciation?.trim() || null,
      example: item.example?.trim() || null,
      explanation: item.explanation?.trim() || null
    }))
  }
}

export function normalizeQuizDataWithNewIds(data) {
  return {
    ...data,
    id: data.id || generateQuizId(),
    description: data.description || '',
    items: data.items.map((item, index) => ({
      ...item,
      id: generateItemId(data.type, item.answer, index),
      question: item.question.trim(),
      answer: item.answer.trim(),
      pronunciation: item.pronunciation?.trim() || null,
      example: item.example?.trim() || null,
      explanation: item.explanation?.trim() || null
    }))
  }
}

/**
 * 验证数据完整性
 */
export function verifyDataIntegrity(quiz) {
  const issues = []

  // 检查项数量是否一致
  if (quiz.itemIds?.length !== quiz.itemCount) {
    issues.push('默写项ID列表与计数量不匹配')
  }

  // 检查是否有孤立项（在项表中不存在）
  // 这个检查需要在数据库层面进行

  return {
    isIntact: issues.length === 0,
    issues
  }
}

export default {
  validateQuizJSON,
  checkForDuplicates,
  normalizeQuizData,
  normalizeQuizDataWithNewIds,
  verifyDataIntegrity
}
