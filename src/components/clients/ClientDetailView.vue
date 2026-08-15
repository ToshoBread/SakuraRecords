<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClient } from '@/composables/useClient'
import { useClients } from '@/composables/useClients'
import { useAuth } from '@/composables/useAuth'
import { formatDate } from '@/lib/format'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import AddressList from '@/components/clients/AddressList.vue'
import AddressForm from '@/components/clients/AddressForm.vue'
import { Pencil, Trash2, MapPin, Plus } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { client, loading, error, fetchById } = useClient()
const { softDelete } = useClients()
const { isAdmin } = useAuth()

const showAddressForm = ref(false)
const editingAddress = ref<{ id: number; name: string; address: string } | null>(null)

const clientId = Number(route.params.id)

onMounted(() => fetchById(clientId))

function openAddAddress() {
  editingAddress.value = null
  showAddressForm.value = true
}

function openEditAddress(addr: { id: number; name: string; address: string }) {
  editingAddress.value = addr
  showAddressForm.value = true
}

function onAddressFormClose() {
  showAddressForm.value = false
  editingAddress.value = null
  fetchById(clientId)
}

async function handleDelete() {
  if (!confirm('Delete this client?')) return
  try {
    await softDelete(clientId)
    toast.success('Client deleted')
    router.push({ name: 'client-list' })
  } catch (e: any) {
    toast.error(e.message)
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div v-if="loading" class="flex flex-col gap-4">
      <Skeleton class="h-8 w-48" />
      <Skeleton class="h-64 w-full" />
    </div>

    <div v-else-if="error" class="text-destructive">{{ error }}</div>

    <template v-else-if="client">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ client.name }}</h1>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" as-child>
            <RouterLink :to="{ name: 'client-edit', params: { id: client.id } }">
              <Pencil data-icon="inline-start" />
              Edit
            </RouterLink>
          </Button>
          <Button v-if="isAdmin" variant="destructive" size="sm" @click="handleDelete">
            <Trash2 data-icon="inline-start" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-2 text-sm">
          <div class="flex justify-between">
            <span class="text-muted-foreground">Created</span>
            <span>{{ formatDate(client.created_at) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Last updated</span>
            <span>{{ formatDate(client.updated_at) }}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle class="flex items-center gap-2">
            <MapPin />
            Addresses
          </CardTitle>
          <Button size="sm" @click="openAddAddress">
            <Plus data-icon="inline-start" />
            Add Address
          </Button>
        </CardHeader>
        <CardContent>
          <AddressList
            v-if="client.addresses.length > 0"
            :addresses="client.addresses"
            @edit="openEditAddress"
            @deleted="fetchById(clientId)"
          />
          <Empty v-else>
            <EmptyHeader>
              <EmptyTitle>No addresses</EmptyTitle>
              <EmptyDescription>Add an address for this client.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" @click="openAddAddress">Add Address</Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Empty v-if="client.purchase_orders.length === 0">
            <EmptyHeader>
              <EmptyTitle>No purchase orders</EmptyTitle>
              <EmptyDescription>No purchase orders for this client yet.</EmptyDescription>
            </EmptyHeader>
          </Empty>
          <div v-else class="flex flex-col gap-2">
            <RouterLink
              v-for="po in client.purchase_orders"
              :key="po.id"
              :to="{ name: 'purchase-order-detail', params: { poNumber: po.id } }"
              class="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-accent"
            >
              <span class="font-medium">{{ po.id }}</span>
              <span class="text-muted-foreground">{{ formatDate(po.created_at) }}</span>
            </RouterLink>
          </div>
        </CardContent>
      </Card>
    </template>

    <AddressForm
      v-if="showAddressForm"
      :client-id="clientId"
      :address="editingAddress"
      @close="onAddressFormClose"
    />
  </div>
</template>
