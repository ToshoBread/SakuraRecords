<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useSearch, type SearchResults } from '@/composables/useSearch'
import { useMagicKeys, whenever, onClickOutside } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SearchDropdown from './SearchDropdown.vue'
import UserMenu from './UserMenu.vue'
import { Menu, Search, Sun, Moon, Monitor } from '@lucide/vue'

defineProps<{
  sidebarToggle: boolean
}>()

const emit = defineEmits<{
  toggleSidebar: []
}>()

const { cycleTheme, themeIcon, themeLabel } = useTheme()
const { loadAll, search, loading } = useSearch()

const searchQuery = ref('')
const isOpen = ref(false)
const inputRef = ref<InstanceType<typeof Input> | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

const results = ref<SearchResults>({ clients: [], products: [], purchaseOrders: [] })

const hasQuery = computed(() => searchQuery.value.trim().length >= 2)

watch(searchQuery, (q) => {
  const trimmed = q.trim()
  if (trimmed.length >= 2) {
    results.value = search(trimmed)
    isOpen.value = true
  } else {
    results.value = { clients: [], products: [], purchaseOrders: [] }
    isOpen.value = false
  }
})

function focusInput() {
  const el = inputRef.value?.$el as HTMLInputElement | undefined
  el?.focus()
}

function handleSelect() {
  searchQuery.value = ''
  isOpen.value = false
  results.value = { clients: [], products: [], purchaseOrders: [] }
}

function handleFocus() {
  loadAll()
  if (hasQuery.value) {
    isOpen.value = true
  }
}

function handleClose() {
  isOpen.value = false
}

onClickOutside(containerRef, () => {
  isOpen.value = false
})

const { meta_k, control_k } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k' && e.type === 'keydown') {
      e.preventDefault()
    }
  },
})

whenever(() => meta_k.value || control_k.value, () => {
  focusInput()
})
</script>

<template>
  <header class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
    <Button v-if="sidebarToggle" variant="ghost" size="icon" class="shrink-0" aria-label="Toggle sidebar" @click="emit('toggleSidebar')">
      <Menu class="size-5" />
    </Button>

    <div ref="containerRef" class="relative min-w-0 flex-1">
      <div class="relative min-w-0 flex-1">
        <Search class="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref="inputRef"
          v-model="searchQuery"
          placeholder="Search..."
          aria-label="Search"
          class="h-9 pl-8 pr-12"
          @focus="handleFocus"
          @keydown.escape="handleClose"
        />
        <kbd class="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
          Ctrl+K
        </kbd>
      </div>

      <div
        v-if="isOpen && (hasQuery || loading)"
        class="absolute top-full left-0 z-50 mt-1 w-full min-w-[300px] overflow-hidden rounded-md border bg-popover p-0 text-popover-foreground shadow-md"
      >
        <SearchDropdown
          :results="results"
          :loading="loading"
          @select="handleSelect"
        />
      </div>
    </div>

    <div class="ml-auto flex shrink-0 items-center gap-1">
      <Button variant="ghost" size="icon" :aria-label="`Theme: ${themeLabel}`" @click="cycleTheme" :title="themeLabel">
        <Sun v-if="themeIcon === 'sun'" class="size-5" />
        <Moon v-else-if="themeIcon === 'moon'" class="size-5" />
        <Monitor v-else class="size-5" />
      </Button>
      <UserMenu />
    </div>
  </header>
</template>
