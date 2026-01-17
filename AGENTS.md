# AGENTS.md - Memo Tool Development Guide

## Build, Lint, and Test Commands

### Development
```bash
npm run dev          # Start development server on http://localhost:3000
```

### Build
```bash
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build locally
```

### No Test Suite
This project currently has no automated tests. If adding tests:
- Use Vitest for unit tests
- Place tests in `__tests__` directory or alongside source files with `.test.js` suffix
- Run specific test: `npx vitest run filename.test.js`

## Code Style Guidelines

### Imports
- Group imports: Vue imports → Third-party libraries → Internal modules
- Sort imports alphabetically within groups
- Use absolute imports with `@/` alias (configured in vite.config.js)
- Example:
```javascript
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { defineStore } from 'pinia'
import { useQuizStore } from '@/stores/quizStore'
import { validateQuizJSON } from '@/utils/jsonValidator'
```

### Vue Components
- Use `<script setup>` syntax for all components
- Organize props with defineProps() and emits with defineEmits()
- Use Composition API hooks: ref, computed, watch, onMounted, onUnmounted
- Component file naming: PascalCase (e.g., `QuizCard.vue`, `FileUploader.vue`)
- Template structure: one root element with clear semantic sections

### State Management (Pinia)
- Use composition API pattern with defineStore (not options API)
- Store naming: `use[Name]Store` pattern (e.g., `useQuizStore`, `useThemeStore`)
- State refs should be returned from the store function
- Computed properties for derived state
- Example pattern (see `src/stores/quizStore.js`):
```javascript
export const useQuizStore = defineStore('quiz', () => {
  const state1 = ref(initialValue)
  const state2 = ref(initialValue)
  
  const computedValue = computed(() => { /* ... */ })
  
  function actionName(params) { /* ... */ }
  
  return { state1, state2, computedValue, actionName }
})
```

### Type Safety
- Avoid `any`, `@ts-ignore`, or type suppression
- Define prop types explicitly in components
- Use TypeScript interfaces for complex data structures
- Validate JSON input with validators (see `src/utils/jsonValidator.js`)

### Naming Conventions
- Variables/functions: camelCase (e.g., `currentPhase`, `handleFileSelect`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `QUIZ_PHASES`, `ITEM_STATUS`)
- Component props: camelCase (passed as kebab-case in templates)
- CSS classes: kebab-case (e.g., `quiz-card`, `progress-bar`)
- File names: PascalCase for components, camelCase for utilities

### CSS and Styling
- Use TailwindCSS utility classes primarily
- Custom colors defined in `tailwind.config.js` under `theme.extend.colors`
- Dark mode support: use `dark:` prefix and `themeStore.theme` for dynamic classes
- Custom animations defined in `theme.extend.animation` and `keyframes`
- Example dark mode class pattern:
```vue
<div :class="themeStore.theme === 'dark' ? 'bg-dark-800' : 'bg-white'">
```
- Component-scoped styles in `<style>` tag if needed

### Error Handling
- Wrap async operations in try/catch blocks
- Display user-friendly error messages in UI
- Log errors to console for debugging
- Validate JSON files before processing (see `jsonValidator.js`)
- Example:
```javascript
try {
  const data = JSON.parse(text)
  const validation = validateQuizJSON(data)
  if (!validation.valid) {
    errorMessage.value = validation.errors.join(';')
    return
  }
} catch (error) {
  errorMessage.value = '文件解析失败：' + error.message
}
```

### Component Structure
1. `<template>` - UI markup with Vue directives
2. `<script setup>` - Composition API logic
3. `<style>` - Scoped CSS (rarely needed with Tailwind)

### Props and Events
- Props should be typed and validated
- Emit events using defineEmits() for parent communication
- Use v-model for two-way binding when appropriate

### Performance
- Use Vue's `<Transition>` and `<TransitionGroup>` for animations
- Clean up event listeners in onUnmounted
- Use computed properties instead of methods for derived data
- Use lodash-es for complex utility functions (`import { debounce, throttle } from 'lodash-es'`)

### File Organization
```
src/
├── components/     # Vue components
├── stores/         # Pinia stores
├── utils/          # Utility functions
├── db/             # Dexie database operations
├── composables/    # Shared composition logic (if any)
├── assets/         # Static assets
├── App.vue         # Root component
├── main.js         # App entry point
└── style.css       # Global styles
public/             # Static files served as-is
```

### Database (Dexie.js)
- Database operations in `src/db/memoDatabase.js`
- Use table operations pattern: `quizOperations`, `categoryOperations`, etc.
- Wrap async operations in try/catch
- Example pattern:
```javascript
export const quizOperations = {
  async getAllQuizzes() { /* ... */ },
  async createQuiz(data, options) { /* ... */ },
  async getQuizById(id) { /* ... */ }
}
```

### Dark Mode Implementation
- Store theme state in `themeStore` (Pinia)
- Persist to localStorage key: `memo-tool-theme`
- Apply `dark` class to `<html>` element
- Use `themeStore.theme === 'dark'` for conditional classes
- CSS pattern:
```css
.dark body { @apply bg-dark-900 text-dark-100; }
.dark .bg-white { @apply bg-dark-800; }
```

### Accessibility
- Use semantic HTML elements
- Add aria labels for icon-only buttons
- Support keyboard navigation
- Maintain good contrast ratios

### General Patterns
- Chinese comments and UI text throughout
- 2-space indentation in templates, consistent elsewhere
- Max-width containers: `max-w-4xl mx-auto` for main content
- Consistent spacing using Tailwind's spacing scale
- Use `ref` for reactive state, `computed` for derived state
