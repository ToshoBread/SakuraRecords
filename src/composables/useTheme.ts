import { ref, watch } from 'vue'

const isDark = ref(false)

function initTheme() {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  }
}

function toggleTheme() {
  document.documentElement.classList.add('theme-transition')
  isDark.value = !isDark.value
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transition')
  }, 300)
}

watch(isDark, (dark) => {
  if (dark) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
})

export function useTheme() {
  return { isDark, toggleTheme, initTheme }
}
