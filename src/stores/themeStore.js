import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref('light')
  
  function initTheme() {
    const savedTheme = localStorage.getItem('memo-tool-theme')
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      theme.value = savedTheme
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'light'
    }
    
    applyTheme()
  }
  
  function applyTheme() {
    const html = document.documentElement
    if (theme.value === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }
  
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    saveTheme()
    applyTheme()
  }
  
  function setTheme(newTheme) {
    if (['light', 'dark'].includes(newTheme)) {
      theme.value = newTheme
      saveTheme()
      applyTheme()
    }
  }
  
  function saveTheme() {
    localStorage.setItem('memo-tool-theme', theme.value)
  }
  
  function setupSystemThemeListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      const userHasSetTheme = localStorage.getItem('memo-tool-theme')
      if (!userHasSetTheme) {
        theme.value = e.matches ? 'dark' : 'light'
        applyTheme()
      }
    })
  }
  
  return {
    theme,
    initTheme,
    toggleTheme,
    setTheme,
    setupSystemThemeListener
  }
})
