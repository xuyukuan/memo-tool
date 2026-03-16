# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Memo Tool is a Vue 3 web application for quiz-based memorization practice (默写练习). It uses IndexedDB for persistent storage and supports quiz import, practice with multiple rounds, progress tracking, and dark mode.

## Commands

```bash
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build locally
```

## Architecture

### State Management
- **Pinia** stores in `src/stores/`
- `useQuizStore` - Main store for quiz state, phases, and persistence
- `useThemeStore` - Dark/light theme management

### Application Phases
The app flows through these phases (stored in `quizStore.currentPhase`):
- `import` - File upload or library view
- `select` - Quiz item selection
- `quiz` - Active quiz practice
- `complete` - Results screen

### Database Layer
- **Dexie.js** wrapper for IndexedDB in `src/db/memoDatabase.js`
- Tables: `quizzes`, `items`, `categories`, `tags`, `learningRecords`, `importHistory`
- Operations pattern: `quizOperations`, `categoryOperations`, `learningRecordOperations`, etc.

### Component Structure
- Root: `src/App.vue` - Phase routing and global UI
- Components in `src/components/`:
  - `FileUploader.vue` - JSON import
  - `QuizList.vue` - Saved quiz list
  - `QuizCard.vue` - Quiz practice UI
  - `QuizManager.vue` - Library management
  - `CompletionScreen.vue` - Results summary

## Key Patterns

### Pinia Store Pattern (Composition API)
```javascript
export const useQuizStore = defineStore('quiz', () => {
  const state1 = ref(initialValue)
  const computedValue = computed(() => { /* ... */ })
  function actionName(params) { /* ... */ }
  return { state1, computedValue, actionName }
})
```

### Dark Mode
- Store in `themeStore.theme` ('light' | 'dark')
- Apply with conditional classes: `themeStore.theme === 'dark' ? 'bg-dark-800' : 'bg-white'`
- Tailwind dark mode colors defined in `tailwind.config.js`

### Import Alias
Use `@/` for absolute imports (configured in vite.config.js):
```javascript
import { useQuizStore } from '@/stores/quizStore'
```

### JSON Validator
Quiz JSON validation in `src/utils/enhancedJsonValidator.js`:
```javascript
const validation = validateQuizJSON(data)
if (!validation.valid) {
  errorMessage.value = validation.errors.join(';')
}
```

## File Organization

```
src/
├── components/     # Vue components
├── stores/         # Pinia stores (quizStore, themeStore)
├── utils/          # Utilities (validators, sound, import/export)
├── db/             # Dexie database operations
├── App.vue         # Root component
└── main.js         # App entry point
```