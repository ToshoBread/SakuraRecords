<script setup lang="ts">
import { ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { Menu } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import Sidebar from './Sidebar.vue'
import TopNav from './TopNav.vue'
import UserMenu from './UserMenu.vue'

const isDesktop = useMediaQuery('(min-width: 1024px)')
const sidebarOpen = ref(false)
</script>

<template>
  <div class="flex min-h-screen bg-background">
    <!-- Sidebar: always visible on desktop, toggle on phone -->
    <Sidebar :open="isDesktop || sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex flex-1 flex-col">
      <!-- Top nav: only on desktop -->
      <TopNav v-if="isDesktop" />

      <!-- Mobile header -->
      <header v-else class="sticky top-0 z-30 flex h-14 items-center border-b bg-background px-4">
        <Button variant="ghost" size="icon" @click="sidebarOpen = true">
          <Menu class="size-5" />
        </Button>
        <span class="ml-3 text-lg font-semibold">SakuraRecords</span>
        <div class="ml-auto">
          <UserMenu />
        </div>
      </header>

      <main class="flex-1 p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
