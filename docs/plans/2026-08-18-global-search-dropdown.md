# Global Search Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the keyword-routing search bar with a live search dropdown using shadcn-vue Command, showing grouped results across Clients, Products, and Purchase Orders as the user types.

**Architecture:** A `useSearch` composable fetches all entities on first focus and provides local filtering. A `SearchDropdown` component renders the shadcn-vue Command UI. `TopNav` integrates both and adds a Cmd+K keyboard shortcut.

**Tech Stack:** Vue 3, shadcn-vue Command component, @vueuse/core (useMagicKeys, whenever, onClickOutside), Supabase, Vue Router

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/components/ui/command/` | Create (via CLI) | shadcn-vue Command component primitives |
| `src/composables/useSearch.ts` | Create | Fetch all entities, provide local search function |
| `src/components/layout/SearchDropdown.vue` | Create | Dropdown panel with grouped search results |
| `src/components/layout/TopNav.vue` | Modify | Wire up SearchDropdown, Cmd+K shortcut |

---

### Task 1: Install shadcn-vue Command component

**Files:**

- Create: `src/components/ui/command/` (entire directory via CLI)

- [ ] **Step 1: Run the shadcn-vue CLI to add the Command component**

```bash
pnpm dlx shadcn-vue@latest add command
```

This creates `src/components/ui/command/` with: `Command.vue`, `CommandDialog.vue`, `CommandEmpty.vue`, `CommandGroup.vue`, `CommandInput.vue`, `CommandItem.vue`, `CommandList.vue`, `CommandSeparator.vue`, `CommandShortcut.vue`, and an `index.ts` barrel export.

- [ ] **Step 2: Verify the component files were created**

```bash
ls src/components/ui/command/
```

Expected: `Command.vue`, `CommandDialog.vue`, `CommandEmpty.vue`, `CommandGroup.vue`, `CommandInput.vue`, `CommandItem.vue`, `CommandList.vue`, `CommandSeparator.vue`, `CommandShortcut.vue`, `index.ts`

- [ ] **Step 3: Build to verify no errors**

```bash
npx vite build
```

Expected: Build succeeds with no errors.

---

### Task 2: Create the useSearch composable

**Files:**

- Create: `src/composables/useSearch.ts`

- [ ] **Step 1: Create the useSearch composable**

```typescript
import { ref, computed } from 'vue'
import { useClients, type Client } from '@/composables/useClients'
import { useProducts, type Product } from '@/composables/useProducts'
import { usePurchaseOrders, type PurchaseOrder } from '@/composables/usePurchaseOrders'

export interface SearchResults {
  clients: Client[]
  products: Product[]
  purchaseOrders: PurchaseOrder[]
}

const clients = ref<Client[]>([])
const products = ref<Product[]>([])
const purchaseOrders = ref<PurchaseOrder[]>([])
const loaded = ref(false)
const loading = ref(false)

export function useSearch() {
  const { fetchAll: fetchClients } = useClients()
  const { fetchAll: fetchProducts } = useProducts()
  const { fetchRecent } = usePurchaseOrders()

  async function loadAll() {
    if (loaded.value) return
    loading.value = true
    try {
      await Promise.all([
        fetchClients().then(() => { clients.value = useClients().clients.value }),
        fetchProducts().then(() => { products.value = useProducts().products.value }),
        fetchRecent(50).then(() => { purchaseOrders.value = usePurchaseOrders().purchaseOrderList.value }),
      ])
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  function search(query: string): SearchResults {
    const q = query.toLowerCase().trim()
    if (!q) return { clients: [], products: [], purchaseOrders: [] }

    const matchedClients = clients.value.filter(c =>
      c.name.toLowerCase().includes(q)
    ).slice(0, 5)

    const matchedProducts = products.value.filter(p =>
      p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    ).slice(0, 5)

    const matchedPOs = purchaseOrders.value.filter(po =>
      po.id.toLowerCase().includes(q) ||
      po.client?.name?.toLowerCase().includes(q)
    ).slice(0, 5)

    return {
      clients: matchedClients,
      products: matchedProducts,
      purchaseOrders: matchedPOs,
    }
  }

  function invalidate() {
    loaded.value = false
  }

  return { loadAll, search, loading, invalidate }
}
```

- [ ] **Step 2: Build to verify no errors**

```bash
npx vite build
```

Expected: Build succeeds.

---

### Task 3: Create the SearchDropdown component

**Files:**

- Create: `src/components/layout/SearchDropdown.vue`

- [ ] **Step 1: Create the SearchDropdown component**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Users, Package, FileText } from '@lucide/vue'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import type { SearchResults } from '@/composables/useSearch'

const props = defineProps<{
  results: SearchResults
  loading: boolean
}>()

const emit = defineEmits<{
  select: []
}>()

const router = useRouter()

const hasResults = computed(() =>
  props.results.clients.length > 0 ||
  props.results.products.length > 0 ||
  props.results.purchaseOrders.length > 0
)

function navigateToClient(id: number) {
  router.push({ name: 'client-detail', params: { id } })
  emit('select')
}

function navigateToProduct(id: number) {
  router.push({ name: 'product-detail', params: { id } })
  emit('select')
}

function navigateToPO(id: string) {
  router.push({ name: 'purchase-order-detail', params: { purchaseOrderNumber: id } })
  emit('select')
}

function viewAllClients() {
  router.push({ name: 'client-list' })
  emit('select')
}

function viewAllProducts() {
  router.push({ name: 'product-list' })
  emit('select')
}

function viewAllPOs() {
  router.push({ name: 'purchase-order-list' })
  emit('select')
}
</script>

<template>
  <Command
    class="rounded-lg border shadow-md"
    :should-filter="false"
  >
    <CommandList>
      <CommandEmpty>
        <template v-if="loading">Searching...</template>
        <template v-else>No results found.</template>
      </CommandEmpty>

      <CommandGroup v-if="results.clients.length > 0" heading="Clients">
        <CommandItem
          v-for="client in results.clients"
          :key="`client-${client.id}`"
          :value="`client-${client.id}`"
          class="cursor-pointer"
          @select="navigateToClient(client.id)"
        >
          <Users class="mr-2 size-4 shrink-0 text-muted-foreground" />
          <span>{{ client.name }}</span>
        </CommandItem>
        <CommandItem
          value="view-all-clients"
          class="cursor-pointer text-muted-foreground"
          @select="viewAllClients"
        >
          View all clients...
        </CommandItem>
      </CommandGroup>

      <CommandSeparator v-if="results.clients.length > 0 && (results.products.length > 0 || results.purchaseOrders.length > 0)" />

      <CommandGroup v-if="results.products.length > 0" heading="Products">
        <CommandItem
          v-for="product in results.products"
          :key="`product-${product.id}`"
          :value="`product-${product.id}`"
          class="cursor-pointer"
          @select="navigateToProduct(product.id)"
        >
          <Package class="mr-2 size-4 shrink-0 text-muted-foreground" />
          <span>{{ product.name }}</span>
          <span class="ml-1 text-muted-foreground">({{ product.code }})</span>
        </CommandItem>
        <CommandItem
          value="view-all-products"
          class="cursor-pointer text-muted-foreground"
          @select="viewAllProducts"
        >
          View all products...
        </CommandItem>
      </CommandGroup>

      <CommandSeparator v-if="results.products.length > 0 && results.purchaseOrders.length > 0" />

      <CommandGroup v-if="results.purchaseOrders.length > 0" heading="Purchase Orders">
        <CommandItem
          v-for="po in results.purchaseOrders"
          :key="`po-${po.id}`"
          :value="`po-${po.id}`"
          class="cursor-pointer"
          @select="navigateToPO(po.id)"
        >
          <FileText class="mr-2 size-4 shrink-0 text-muted-foreground" />
          <span>{{ po.id }}</span>
          <span v-if="po.client" class="ml-1 text-muted-foreground">— {{ po.client.name }}</span>
        </CommandItem>
        <CommandItem
          value="view-all-pos"
          class="cursor-pointer text-muted-foreground"
          @select="viewAllPOs"
        >
          View all purchase orders...
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
</template>
```

- [ ] **Step 2: Build to verify no errors**

```bash
npx vite build
```

Expected: Build succeeds.

---

### Task 4: Modify TopNav to integrate SearchDropdown and Cmd+K shortcut

**Files:**

- Modify: `src/components/layout/TopNav.vue`

- [ ] **Step 1: Replace the TopNav script and template**

Replace the entire contents of `src/components/layout/TopNav.vue` with:

```vue
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
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
const searchInputRef = ref<HTMLInputElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

const results = ref<SearchResults>({ clients: [], products: [], purchaseOrders: [] })

const hasQuery = ref(false)

watch(searchQuery, (q) => {
  const trimmed = q.trim()
  hasQuery.value = trimmed.length >= 2
  if (hasQuery.value) {
    results.value = search(trimmed)
    isOpen.value = true
  } else {
    results.value = { clients: [], products: [], purchaseOrders: [] }
    isOpen.value = false
  }
})

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
  searchInputRef.value?.focus()
})

onMounted(() => {
  searchInputRef.value = document.querySelector('[aria-label="Search"]') as HTMLInputElement
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
          ref="searchInputRef"
          v-model="searchQuery"
          placeholder="Search..."
          aria-label="Search"
          class="h-9 pl-8 pr-12"
          @focus="handleFocus"
          @keydown.escape="handleClose"
        />
        <kbd class="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
          <span class="text-xs">⌘</span>K
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
```

- [ ] **Step 2: Build to verify no errors**

```bash
npx vite build
```

Expected: Build succeeds.

- [ ] **Step 3: Fix any type or import errors if present**

If the build fails, read the error output and fix the issues. Common problems:
- Missing imports: check that `@/components/ui/command` exports exist
- Type mismatches: verify `SearchResults` interface matches what the composable returns

- [ ] **Step 4: Run build again to confirm clean**

```bash
npx vite build
```

Expected: Build succeeds with no errors.

---

### Task 5: Verify the full build and fix any issues

**Files:**

- None (verification only)

- [ ] **Step 1: Run the full production build**

```bash
npx vite build
```

Expected: Build succeeds.

- [ ] **Step 2: Run the dev server and manually test**

```bash
npx vite dev
```

Manual verification checklist:
- [ ] Click the search input — dropdown should appear when 2+ characters are typed
- [ ] Type a client name — client results appear in "Clients" group
- [ ] Type a product name or code — product results appear in "Products" group
- [ ] Type a PO number — PO results appear in "Purchase Orders" group
- [ ] Type nonsense — "No results found." appears
- [ ] Click a result — navigates to the correct detail page, search clears
- [ ] Press Escape — dropdown closes
- [ ] Click outside the search — dropdown closes
- [ ] Press Cmd+K (Mac) or Ctrl+K (Windows/Linux) — search input focuses
- [ ] "⌘K" hint visible inside search input on desktop
- [ ] Dropdown scrolls if results overflow

- [ ] **Step 3: Run build one final time**

```bash
npx vite build
```

Expected: Clean build, no errors.

---

## Summary

| Task | Files Changed | Description |
|---|---|---|
| 1 | `src/components/ui/command/*` | Install shadcn-vue Command via CLI |
| 2 | `src/composables/useSearch.ts` | Create search composable (fetch + filter) |
| 3 | `src/components/layout/SearchDropdown.vue` | Create dropdown panel component |
| 4 | `src/components/layout/TopNav.vue` | Wire up search, Cmd+K shortcut |
| 5 | — | Verify build and manual testing |
