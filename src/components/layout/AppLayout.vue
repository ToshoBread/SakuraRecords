<script setup lang="ts">
import { ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { RouterView } from 'vue-router'
import Sidebar from './Sidebar.vue'
import TopNav from './TopNav.vue'

const isDesktop = useMediaQuery('(min-width: 1024px)')
const sidebarOpen = ref(false)
</script>

<template>
  <div class="flex min-h-screen bg-background">
    <!-- Sidebar: visible on desktop, toggle on mobile -->
    <Sidebar :open="isDesktop || sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex flex-1 flex-col">
      <TopNav :sidebar-toggle="!isDesktop" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="flex-1 p-4 lg:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
