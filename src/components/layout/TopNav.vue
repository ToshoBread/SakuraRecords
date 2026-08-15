<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import UserMenu from './UserMenu.vue'
import { Menu, Search, Sun, Moon } from 'lucide-vue-next'

defineProps<{
  sidebarToggle: boolean
}>()

const emit = defineEmits<{
  toggleSidebar: []
}>()

const router = useRouter()
const { isDark, toggleTheme } = useTheme()
const searchQuery = ref('')

function handleSearch() {
  const q = searchQuery.value.trim()
  if (!q) return
  const lower = q.toLowerCase()
  if (lower.startsWith('po') || lower.includes('purchase')) {
    router.push({ name: 'purchase-order-list', query: { q } })
  } else if (lower.includes('client')) {
    router.push({ name: 'client-list', query: { q } })
  } else if (lower.includes('product')) {
    router.push({ name: 'product-list', query: { q } })
  } else {
    router.push({ name: 'dashboard' })
  }
  searchQuery.value = ''
}
</script>

<template>
  <header class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
    <Button v-if="sidebarToggle" variant="ghost" size="icon" @click="emit('toggleSidebar')">
      <Menu class="size-5" />
    </Button>

    <form @submit.prevent="handleSearch" class="flex flex-1 max-w-md items-center gap-2">
      <div class="relative flex-1">
        <Search class="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Search..."
          class="pl-8 h-9"
        />
      </div>
    </form>

    <div class="ml-auto flex items-center gap-1">
      <Button variant="ghost" size="icon" @click="toggleTheme" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
        <Sun v-if="isDark" class="size-5" />
        <Moon v-else class="size-5" />
      </Button>
      <UserMenu />
    </div>
  </header>
</template>
