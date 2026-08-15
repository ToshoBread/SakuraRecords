<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePO, type Delivery } from '@/composables/usePO'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import POProductTable from '@/components/po/POProductTable.vue'
import DeliveryTable from '@/components/po/DeliveryTable.vue'
import DeliveryForm from '@/components/po/DeliveryForm.vue'
import { Plus, Pencil } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const {
  po, loading, error, productsWithRemaining,
  fetchByPONumber, deleteDelivery, formatCurrency,
} = usePO()

const poNumber = route.params.poNumber as string

const showDeliveryForm = ref(false)
const editingDelivery = ref<Delivery | null>(null)

onMounted(() => fetchByPONumber(poNumber))

function openAddDelivery() {
  editingDelivery.value = null
  showDeliveryForm.value = true
}

function openEditDelivery(delivery: Delivery) {
  editingDelivery.value = delivery
  showDeliveryForm.value = true
}

function onDeliveryFormClose() {
  showDeliveryForm.value = false
  editingDelivery.value = null
  fetchByPONumber(poNumber)
}

async function handleDeleteDelivery(id: number) {
  if (!confirm('Delete this delivery?')) return
  try {
    await deleteDelivery(id)
    toast.success('Delivery deleted')
    fetchByPONumber(poNumber)
  } catch (e: any) {
    toast.error(e.message)
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div v-if="loading" class="flex flex-col gap-4">
      <Skeleton class="h-8 w-48" />
      <Skeleton class="h-64 w-full" />
      <Skeleton class="h-64 w-full" />
    </div>

    <div v-else-if="error" class="text-destructive">{{ error }}</div>

    <template v-else-if="po">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ po.id }}</h1>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" as-child>
            <RouterLink :to="{ name: 'po-edit', params: { poNumber: po.id } }">
              <Pencil data-icon="inline-start" />
              Edit
            </RouterLink>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-2 text-sm">
          <div class="flex justify-between">
            <span class="text-muted-foreground">Client</span>
            <RouterLink
              :to="{ name: 'client-detail', params: { id: po.client.id } }"
              class="font-medium hover:underline"
            >
              {{ po.client.name }}
            </RouterLink>
          </div>
          <div v-if="po.notes" class="flex justify-between">
            <span class="text-muted-foreground">Notes</span>
            <span class="max-w-[300px] text-right">{{ po.notes }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Created</span>
            <span>{{ formatDate(po.created_at) }}</span>
          </div>
        </CardContent>
      </Card>

      <POProductTable :products="productsWithRemaining" />

      <Separator />

      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Deliveries</h2>
        <Button size="sm" @click="openAddDelivery">
          <Plus data-icon="inline-start" />
          Add Delivery
        </Button>
      </div>

      <DeliveryTable
        :deliveries="po.deliveries"
        :format-currency="formatCurrency"
        @edit="openEditDelivery"
        @delete="handleDeleteDelivery"
      />
    </template>

    <DeliveryForm
      v-if="showDeliveryForm && po"
      :po-id="po.id"
      :client-id="po.clientId"
      :products="productsWithRemaining"
      :delivery="editingDelivery"
      @close="onDeliveryFormClose"
    />
  </div>
</template>
