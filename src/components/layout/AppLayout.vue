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
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:m-2 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
      Skip to content
    </a>

    <!-- Sidebar: visible on desktop, toggle on mobile -->
    <Sidebar :open="isDesktop || sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex min-w-0 flex-1 flex-col">
      <TopNav :sidebar-toggle="!isDesktop" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main id="main-content" class="min-w-0 flex-1 p-4 lg:p-6" tabindex="-1">
        <RouterView />
      </main>
    </div>
  </div>
</template>
