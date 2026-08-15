<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Plus,
  Shield,
  X,
} from 'lucide-vue-next'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const route = useRoute()
const { isAdmin } = useAuth()

const navItems = [
  { name: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { name: 'purchase-order-list', label: 'Purchase Orders', icon: FileText },
  { name: 'client-list', label: 'Clients', icon: Users },
  { name: 'product-list', label: 'Products', icon: Package },
]

const adminItems = [
  { name: 'admin', label: 'Admin', icon: Shield },
]

function isActive(name: string) {
  return route.name === name || route.name?.toString().startsWith(name.split('-')[0])
}
</script>

<template>
  <!-- Overlay -->
  <div
    v-if="open"
    class="fixed inset-0 z-40 bg-black/50 lg:hidden"
    @click="emit('close')"
  />

  <!-- Sidebar -->
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-background border-r transition-transform lg:static lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <div class="flex items-center justify-between p-4">
      <span class="text-lg font-semibold">SakuraRecords</span>
      <Button variant="ghost" size="icon" class="lg:hidden" @click="emit('close')">
        <X class="size-4" />
      </Button>
    </div>

    <Separator />

    <nav class="flex-1 p-2">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="{ name: item.name }"
        :class="[
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive(item.name)
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        ]"
        @click="emit('close')"
      >
        <component :is="item.icon" class="size-4" />
        {{ item.label }}
      </RouterLink>

      <template v-if="isAdmin">
        <Separator class="my-2" />
        <RouterLink
          v-for="item in adminItems"
          :key="item.name"
          :to="{ name: item.name }"
          :class="[
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            isActive(item.name)
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          ]"
          @click="emit('close')"
        >
          <component :is="item.icon" class="size-4" />
          {{ item.label }}
        </RouterLink>
      </template>
    </nav>

    <div class="p-2">
      <Button as-child variant="outline" class="w-full justify-start gap-2">
        <RouterLink :to="{ name: 'purchase-order-create' }">
          <Plus class="size-4" />
          New Purchase Order
        </RouterLink>
      </Button>
    </div>
  </aside>
</template>
