<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClients } from '@/composables/useClients'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const { clients, loading, fetchAll } = useClients()

const searchQuery = ref((route.query.q as string) || '')

const filteredClients = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return clients.value
  return clients.value.filter(c => c.name.toLowerCase().includes(q))
})

function goToDetail(id: number) {
  router.push({ name: 'client-detail', params: { id } })
}

onMounted(() => fetchAll())
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Clients</h1>
      <Button as-child size="sm">
        <RouterLink :to="{ name: 'client-create' }">
          <Plus />
          New Client
        </RouterLink>
      </Button>
    </div>

    <Card>
      <CardContent class="p-0">
        <div v-if="loading" class="flex flex-col gap-2 p-4">
          <Skeleton v-for="i in 5" :key="i" class="h-12 w-full" />
        </div>

        <Empty v-else-if="filteredClients.length === 0 && searchQuery">
          <EmptyHeader>
            <EmptyTitle>No matching clients</EmptyTitle>
            <EmptyDescription>No clients match "{{ searchQuery }}".</EmptyDescription>
          </EmptyHeader>
        </Empty>

        <Empty v-else-if="filteredClients.length === 0">
          <EmptyHeader>
            <EmptyTitle>No clients yet</EmptyTitle>
            <EmptyDescription>Add your first client to get started.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <RouterLink :to="{ name: 'client-create' }">
              <Button>Add Client</Button>
            </RouterLink>
          </EmptyContent>
        </Empty>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead class="text-right">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="client in filteredClients"
              :key="client.id"
              class="cursor-pointer"
              role="link"
              tabindex="0"
              @click="goToDetail(client.id)"
              @keydown.enter="goToDetail(client.id)"
            >
              <TableCell class="font-medium">{{ client.name }}</TableCell>
              <TableCell class="text-right text-muted-foreground">
                {{ formatDate(client.created_at) }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
