/**
 * MemoTool 数据库层
 * 使用 Dexie.js 实现 IndexedDB 存储
 */

import Dexie from 'dexie'
import { v4 as uuidv4 } from 'uuid'

class MemoDatabase extends Dexie {
  constructor() {
    super('MemoToolDB')

    // 定义数据库版本和表结构
    this.version(1).stores({
      // 默写集表 - 主数据表
      quizzes: '++id, &name, type, categoryId, *tags, *itemIds, createdAt, lastUsed, usageCount, isFavorite',
      
      // 分类表 - 支持层级分类
      categories: '++id, &name, parentId, createdAt',
      
      // 默写项表 - 存储具体的默写内容
      items: '++id, quizId, createdAt',
      
      // 学习记录表 - 追踪学习进度
      learningRecords: '++id, quizId, itemId, timestamp, isCorrect, roundNumber',
      
      // 导入历史表
      importHistory: '++id, quizId, importedAt, filename',
      
      // 标签表
      tags: '++id, &name, usageCount'
    })

    // 初始化默认数据
    this.on('populate', () => this.populateDefaults())
  }

  async populateDefaults() {
    // 添加默认分类
    await this.categories.bulkAdd([
      { name: '英语', parentId: null, createdAt: new Date() },
      { name: '语文', parentId: null, createdAt: new Date() },
      { name: '其他', parentId: null, createdAt: new Date() }
    ])
  }
}

// 创建数据库实例
export const db = new MemoDatabase()

// ==================== 默写集操作 ====================

export const quizOperations = {
  // 创建新的默写集
  async createQuiz(data, options = {}) {
    const {
      categoryId = null,
      tags = [],
      isFavorite = false
    } = options

    const now = new Date()
    const itemIds = data.items?.map(item => item.id) || []
    
    const quizId = await db.quizzes.add({
      name: data.title,
      originalName: data.title,
      type: data.type,
      description: data.description || '',
      categoryId,
      tags,
      itemIds,
      itemCount: data.items?.length || 0,
      createdAt: now,
      updatedAt: now,
      lastUsed: now,
      usageCount: 0,
      isFavorite
    })

    // 批量添加默写项
    if (data.items && data.items.length > 0) {
      const items = data.items.map(item => ({
        ...item,
        quizId
      }))
      await db.items.bulkAdd(items)
    }

    // 更新标签使用频率
    for (const tag of tags) {
      await this.upsertTag(tag)
    }

    return quizId
  },

  // 获取所有默写集
  async getAllQuizzes() {
    return await db.quizzes.orderBy('createdAt').reverse().toArray()
  },

  // 获取单个默写集（包含所有项）
  async getQuizById(id) {
    const quiz = await db.quizzes.get(id)
    if (!quiz) return null

    const items = await db.items.where('quizId').equals(id).toArray()
    return {
      ...quiz,
      items
    }
  },

  // 更新默写集
  async updateQuiz(id, updates) {
    await db.quizzes.update(id, {
      ...updates,
      updatedAt: new Date()
    })
  },

  // 删除默写集
  async deleteQuiz(id) {
    // 删除关联的项
    await db.items.where('quizId').equals(id).delete()
    // 删除学习记录
    await db.learningRecords.where('quizId').equals(id).delete()
    // 删除默写集
    await db.quizzes.delete(id)
  },

  // 批量删除
  async deleteQuizzes(ids) {
    for (const id of ids) {
      await this.deleteQuiz(id)
    }
  },

  // 更新使用统计
  async incrementUsage(id) {
    const quiz = await db.quizzes.get(id)
    await db.quizzes.update(id, {
      usageCount: (quiz?.usageCount || 0) + 1,
      lastUsed: new Date()
    })
  },

  // 切换收藏状态
  async toggleFavorite(id) {
    const quiz = await db.quizzes.get(id)
    if (quiz) {
      await db.quizzes.update(id, { isFavorite: !quiz.isFavorite })
      return !quiz.isFavorite
    }
    return false
  }
}

// ==================== 分类操作 ====================

export const categoryOperations = {
  // 获取所有分类
  async getAllCategories() {
    return await db.categories.toArray()
  },

  // 获取分类（带子分类）
  async getCategoriesWithChildren() {
    const categories = await this.getAllCategories()
    const parentCategories = categories.filter(c => c.parentId === null)
    
    return Promise.all(parentCategories.map(async parent => ({
      ...parent,
      children: categories.filter(c => c.parentId === parent.id)
    })))
  },

  // 创建分类
  async createCategory(name, parentId = null) {
    return await db.categories.add({
      name,
      parentId,
      createdAt: new Date()
    })
  },

  // 更新分类
  async updateCategory(id, updates) {
    await db.categories.update(id, updates)
  },

  // 删除分类
  async deleteCategory(id) {
    // 将该分类下的默写集移到"未分类"
    await db.quizzes.where('categoryId').equals(id).modify({ categoryId: null })
    // 删除子分类
    await db.categories.where('parentId').equals(id).delete()
    // 删除分类
    await db.categories.delete(id)
  }
}

// ==================== 标签操作 ====================

export const tagOperations = {
  // 获取所有标签（按使用频率排序）
  async getAllTags() {
    return await db.tags.orderBy('usageCount').reverse().toArray()
  },

  // 添加或更新标签
  async upsertTag(name) {
    const existing = await db.tags.where('name').equals(name).first()
    if (existing) {
      await db.tags.update(existing.id, { usageCount: existing.usageCount + 1 })
    } else {
      await db.tags.add({ name, usageCount: 1 })
    }
  },

  // 删除标签
  async deleteTag(name) {
    const tag = await db.tags.where('name').equals(name).first()
    if (tag) {
      await db.tags.delete(tag.id)
    }
  },

  // 搜索标签
  async searchTags(query) {
    return await db.tags
      .where('name')
      .startsWithIgnoreCase(query)
      .limit(10)
      .toArray()
  }
}

// ==================== 默写项操作 ====================

export const itemOperations = {
  // 获取默写集中的所有项
  async getItemsByQuizId(quizId) {
    return await db.items.where('quizId').equals(quizId).toArray()
  },

  // 更新默写项
  async updateItem(id, updates) {
    await db.items.update(id, updates)
  },

  // 批量更新项
  async updateItems(quizId, updates) {
    const items = await this.getItemsByQuizId(quizId)
    for (const item of items) {
      await db.items.update(item.id, updates)
    }
  },

  // 删除项
  async deleteItem(id) {
    await db.items.delete(id)
  }
}

// ==================== 学习记录操作 ====================

export const learningRecordOperations = {
  // 记录一次学习
  async recordAttempt(quizId, itemId, isCorrect, roundNumber = 1) {
    return await db.learningRecords.add({
      quizId,
      itemId,
      timestamp: new Date(),
      isCorrect,
      roundNumber
    })
  },

  // 获取默写集的学习统计
  async getQuizStats(quizId) {
    const records = await db.learningRecords
      .where('quizId')
      .equals(quizId)
      .toArray()

    const total = records.length
    const correct = records.filter(r => r.isCorrect).length
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

    // 按日期分组
    const byDate = records.reduce((acc, record) => {
      const date = record.timestamp.toISOString().split('T')[0]
      if (!acc[date]) acc[date] = { total: 0, correct: 0 }
      acc[date].total++
      if (record.isCorrect) acc[date].correct++
      return acc
    }, {})

    return { total, correct, accuracy, byDate }
  },

  // 获取最近的学习记录
  async getRecentRecords(limit = 10) {
    return await db.learningRecords
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray()
  }
}

// ==================== 导入历史操作 ====================

export const importHistoryOperations = {
  // 记录导入
  async recordImport(quizId, filename) {
    return await db.importHistory.add({
      quizId,
      filename,
      importedAt: new Date()
    })
  },

  // 获取导入历史
  async getImportHistory(limit = 20) {
    return await db.importHistory
      .orderBy('importedAt')
      .reverse()
      .limit(limit)
      .toArray()
  },

  // 获取最近使用的默写集
  async getRecentQuizzes(limit = 10) {
    const history = await this.getImportHistory(limit * 2)
    const quizIds = [...new Set(history.map(h => h.quizId))].slice(0, limit)
    
    return Promise.all(
      quizIds.map(id => db.quizzes.get(id))
    )
  }
}

// ==================== 搜索和筛选 ====================

export const searchOperations = {
  // 搜索默写集
  async searchQuizzes(query, options = {}) {
    const {
      type = null,
      categoryId = null,
      tags = [],
      favoriteOnly = false,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options

    let collection = db.quizzes.toCollection()

    // 如果有查询词，先模糊搜索
    if (query) {
      const allQuizzes = await db.quizzes.toArray()
      const filtered = allQuizzes.filter(quiz => 
        quiz.name.toLowerCase().includes(query.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(query.toLowerCase())
      )
      collection = db.quizzes.where('id').anyOf(filtered.map(q => q.id))
    }

    let results = await collection.toArray()

    // 应用筛选条件
    if (type) {
      results = results.filter(q => q.type === type)
    }
    if (categoryId) {
      results = results.filter(q => q.categoryId === categoryId)
    }
    if (tags.length > 0) {
      results = results.filter(q => 
        tags.some(tag => q.tags?.includes(tag))
      )
    }
    if (favoriteOnly) {
      results = results.filter(q => q.isFavorite)
    }

    // 排序
    results.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]
      
      if (sortBy === 'lastUsed' || sortBy === 'createdAt') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      if (sortOrder === 'desc') {
        return bVal - aVal
      }
      return aVal - bVal
    })

    return results
  },

  // 获取统计信息
  async getStats() {
    const quizzes = await db.quizzes.toArray()
    const categories = await db.categories.toArray()
    const tags = await db.tags.toArray()

    const totalItems = quizzes.reduce((sum, q) => sum + (q.itemCount || 0), 0)
    const totalUsage = quizzes.reduce((sum, q) => sum + (q.usageCount || 0), 0)

    return {
      quizCount: quizzes.length,
      categoryCount: categories.length,
      tagCount: tags.length,
      totalItems,
      totalUsage,
      favoritesCount: quizzes.filter(q => q.isFavorite).length
    }
  }
}

export default {
  db,
  quizOperations,
  categoryOperations,
  tagOperations,
  itemOperations,
  learningRecordOperations,
  importHistoryOperations,
  searchOperations
}
