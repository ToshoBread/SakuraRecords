import { ref } from 'vue'
import { useSettings } from './useSettings'

const isDark = ref(false)

function initTheme() {
  const { settings } = useSettings()
  const theme = settings.value.theme

  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  }
}

function toggleTheme() {
  const { setTheme } = useSettings()
  document.documentElement.classList.add('theme-transition')
  isDark.value = !isDark.value
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transition')
  }, 300)
  setTheme(isDark.value ? 'dark' : 'light')
}

function applyTheme() {
  const { settings } = useSettings()
  const theme = settings.value.theme

  document.documentElement.classList.add('theme-transition')
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transition')
  }, 300)

  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  }
}

export function useTheme() {
  return { isDark, toggleTheme, initTheme, applyTheme }
}
