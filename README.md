# 📝 默写练习工具 (Memo Tool)

一个现代化的默写练习应用，支持英语和语文两种类型的默写练习。

## ✨ 功能特性

- 🎯 **多轮学习** - 错误题目自动进入下一轮，直到全部正确
- 🔊 **音效反馈** - 显示答案、回答正确/错误、完成练习时都有音效提示
- 🌙 **深色模式** - 支持深色/浅色主题切换，自动检测系统偏好
- ⌨️ **键盘操作** - 全键盘支持，无需鼠标操作
- 📊 **学习统计** - 实时显示进度、正确率、统计数据
- 🎨 **极简UI** - 简洁现代的界面设计，流畅的动画效果

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📁 JSON 文件格式

### 英语默写格式

```json
{
  "title": "英语四六级核心词汇默写",
  "type": "english",
  "description": "常用英语词汇中译英练习",
  "items": [
    {
      "id": "1",
      "question": "n. 生活方式",
      "answer": "lifestyle",
      "pronunciation": "/ˈlaɪfstaɪl/",
      "example": "a healthy lifestyle"
    }
  ]
}
```

### 语文拼音默写格式

```json
{
  "title": "成语拼音默写练习",
  "type": "chinese",
  "description": "常用成语拼音练习",
  "items": [
    {
      "id": "1",
      "question": "zhēn zhī zhuó jiàn",
      "answer": "真知灼见",
      "explanation": "真正知道，确实了解。形容见解透彻。",
      "example": "他对经济形势有真知灼见。"
    }
  ]
}
```

## ⌨️ 键盘快捷键

| 按键 | 功能 |
|------|------|
| `空格` | 显示/隐藏答案 |
| `←` | 标记为错误 |
| `→` | 标记为正确 |

## 🎨 技术栈

- **Vue 3** - 渐进式JavaScript框架
- **Vite** - 下一代前端构建工具
- **Pinia** - Vue状态管理库
- **TailwindCSS** - 实用优先的CSS框架
- **Web Audio API** - 音效生成（无需外部音频文件）

## 📂 项目结构

```
memo-tool/
├── public/
│   ├── sample-english.json      # 英语默写示例
│   └── sample-chinese.json      # 语文默写示例
├── src/
│   ├── components/
│   │   ├── FileUploader.vue     # 文件上传组件
│   │   ├── QuizList.vue         # 默写项列表
│   │   ├── QuizCard.vue         # 核心默写卡片
│   │   ├── ProgressBar.vue      # 进度条
│   │   ├── CompletionScreen.vue # 完成页面
│   │   ├── ThemeToggle.vue     # 主题切换
│   │   ├── SoundControl.vue     # 音效控制
│   │   └── ShortcutsHelp.vue   # 快捷键帮助
│   ├── stores/
│   │   ├── quizStore.js        # 默写状态管理
│   │   └── themeStore.js       # 主题状态管理
│   ├── utils/
│   │   ├── jsonValidator.js     # JSON格式验证
│   │   ├── soundGenerator.js   # 音效生成器
│   │   └── constants.js        # 常量定义
│   ├── App.vue                 # 根组件
│   ├── main.js                 # 应用入口
│   └── style.css               # 全局样式
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🎯 使用流程

1. **导入文件** - 上传或拖拽JSON格式的默写文件
2. **选择题目** - 从列表中选择要练习的默写项
3. **开始默写** - 按空格键显示答案，自行判断正误
4. **多轮练习** - 错误题目自动进入下一轮，直到全部正确
5. **查看统计** - 完成后查看学习统计数据

## 💡 提示

- 支持拖拽上传JSON文件
- 可以按"全选"快速选择所有默写项
- 使用搜索功能快速查找特定题目
- 主题设置会自动保存到本地存储
- 音效可以单独控制音量和静音

## 📄 License

MIT
