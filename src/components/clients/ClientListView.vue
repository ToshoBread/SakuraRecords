<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useClients } from '@/composables/useClients'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-vue-next'

const { clients, loading, fetchAll } = useClients()

onMounted(() => fetchAll())

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Clients</h1>
      <Button as-child size="sm">
        <RouterLink :to="{ name: 'client-create' }">
          <Plus data-icon="inline-start" />
          New Client
        </RouterLink>
      </Button>
    </div>

    <Card>
      <CardContent class="p-0">
        <div v-if="loading" class="p-4">
          <Skeleton v-for="i in 5" :key="i" class="h-12 w-full mb-2" />
        </div>

        <Empty v-else-if="clients.length === 0">
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
            <TableRow v-for="client in clients" :key="client.id">
              <TableCell>
                <RouterLink
                  :to="{ name: 'client-detail', params: { id: client.id } }"
                  class="font-medium hover:underline"
                >
                  {{ client.name }}
                </RouterLink>
              </TableCell>
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
