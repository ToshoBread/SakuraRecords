import { ref, computed } from 'vue'
import { useSettings, type Theme } from './useSettings'

const isDark = ref(false)
let osThemeListener: ((e: MediaQueryListEvent) => void) | null = null

function initTheme() {
  const { settings } = useSettings()
  applyThemeValue(settings.value.theme)
}

function applyThemeValue(theme: Theme) {
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  }

  if (osThemeListener) {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', osThemeListener)
    osThemeListener = null
  }

  if (theme === 'system') {
    osThemeListener = () => {
      const { settings } = useSettings()
      applyThemeValue(settings.value.theme)
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', osThemeListener)
  }
}

function cycleTheme() {
  const { settings, setTheme } = useSettings()
  const order: Theme[] = ['light', 'dark', 'system']
  const current = settings.value.theme
  const next = order[(order.indexOf(current) + 1) % order.length]

  document.documentElement.classList.add('theme-transition')
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transition')
  }, 300)

  setTheme(next)
  applyThemeValue(next)
}

function applyTheme() {
  const { settings } = useSettings()
  document.documentElement.classList.add('theme-transition')
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transition')
  }, 300)
  applyThemeValue(settings.value.theme)
}

export function useTheme() {
  const { settings } = useSettings()
  const themeIcon = computed(() => {
    switch (settings.value.theme) {
      case 'light': return 'sun'
      case 'dark': return 'moon'
      case 'system': return 'monitor'
    }
  })
  const themeLabel = computed(() => {
    switch (settings.value.theme) {
      case 'light': return 'Switch to dark mode'
      case 'dark': return 'Switch to system mode'
      case 'system': return 'Switch to light mode'
    }
  })

  return { isDark, cycleTheme, initTheme, applyTheme, themeIcon, themeLabel }
}
