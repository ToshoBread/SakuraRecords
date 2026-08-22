<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useTheme } from '@/composables/useTheme'
import { useSettings } from '@/composables/useSettings'
import { Toaster } from "@/components/ui/sonner"
import UpdatePrompt from '@/components/UpdatePrompt.vue'

const { init, loading } = useAuth()
const { initTheme } = useTheme()
const { settings } = useSettings()

onMounted(() => {
  initTheme()
  document.documentElement.setAttribute('data-density', settings.value.density)
  init()
})
</script>

<template>
  <div v-if="loading" class="flex min-h-screen items-center justify-center">
    <div class="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
  <RouterView v-else />
  <Toaster />
  <UpdatePrompt />
</template>
