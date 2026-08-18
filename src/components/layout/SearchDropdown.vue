<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Users, Package, FileText } from '@lucide/vue'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import type { SearchResults } from '@/composables/useSearch'

defineProps<{
  results: SearchResults
  loading: boolean
}>()

const emit = defineEmits<{
  select: []
}>()

const router = useRouter()

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
