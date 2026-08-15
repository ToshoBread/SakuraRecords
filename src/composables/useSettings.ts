import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'system'
export type Density = 'regular' | 'comfy' | 'compact'
export type LandingPage = 'dashboard' | 'purchase-order-list' | 'client-list' | 'product-list'

interface Settings {
  theme: Theme
  density: Density
  landingPage: LandingPage
}

const defaults: Settings = {
  theme: 'system',
  density: 'regular',
  landingPage: 'dashboard',
}

const STORAGE_KEY = 'settings'

function load(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...defaults, ...JSON.parse(stored) }
  } catch {}
  return { ...defaults }
}

function save(settings: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

const settings = ref<Settings>(load())

export function useSettings() {
  function setTheme(theme: Theme) {
    settings.value = { ...settings.value, theme }
  }

  function setDensity(density: Density) {
    settings.value = { ...settings.value, density }
  }

  function setLandingPage(landingPage: LandingPage) {
    settings.value = { ...settings.value, landingPage }
  }

  watch(settings, (s) => save(s), { deep: true })

  return {
    settings,
    setTheme,
    setDensity,
    setLandingPage,
  }
}
