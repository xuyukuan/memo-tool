export function validateQuizJSON(data) {
  const errors = []
  
  if (!data.title || typeof data.title !== 'string') {
    errors.push('缺少标题或标题格式错误')
  }
  
  if (!data.type || !['english', 'chinese'].includes(data.type)) {
    errors.push('缺少类型或类型不支持（仅支持 english/chinese）')
  }
  
  if (!data.items || !Array.isArray(data.items)) {
    errors.push('缺少默写项列表')
    return { valid: false, errors }
  }
  
  if (data.items.length === 0) {
    errors.push('默写项列表为空')
  }
  
  data.items.forEach((item, index) => {
    if (!item.id) {
      errors.push(`第${index + 1}项缺少ID`)
    }
    if (!item.question || typeof item.question !== 'string') {
      errors.push(`第${index + 1}项缺少题目或题目格式错误`)
    }
    if (!item.answer || typeof item.answer !== 'string') {
      errors.push(`第${index + 1}项缺少答案或答案格式错误`)
    }
  })
  
  return {
    valid: errors.length === 0,
    errors,
    itemCount: data.items.length
  }
}
