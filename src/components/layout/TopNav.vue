<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-vue-next'
import UserMenu from './UserMenu.vue'

const route = useRoute()

const navItems = [
  { name: 'dashboard', label: 'Dashboard' },
  { name: 'po-list', label: 'POs' },
  { name: 'client-list', label: 'Clients' },
  { name: 'product-list', label: 'Products' },
]

function isActive(name: string) {
  return route.name === name || route.name?.toString().startsWith(name.split('-')[0])
}
</script>

<template>
  <header class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
    <span class="text-lg font-semibold lg:hidden">SakuraRecords</span>

    <nav class="hidden items-center gap-1 lg:flex">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="{ name: item.name }"
        :class="[
          'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          isActive(item.name)
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        ]"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="ml-auto flex items-center gap-2">
      <Button as-child size="sm" class="hidden lg:flex">
        <RouterLink :to="{ name: 'po-create' }" class="gap-2">
          <Plus class="size-4" />
          New PO
        </RouterLink>
      </Button>
      <UserMenu />
    </div>
  </header>
</template>
