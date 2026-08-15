<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import Sonner from "@/components/ui/sonner/Sonner.vue"

const { init, loading } = useAuth()

onMounted(() => init())
</script>

<template>
  <div v-if="loading" class="flex min-h-screen items-center justify-center">
    <div class="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
  <RouterView v-else />
  <Sonner />
</template>
