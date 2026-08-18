<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePurchaseOrder, type Delivery } from '@/composables/usePurchaseOrder'
import { formatDate } from '@/lib/format'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import POProductTable from '@/components/po/POProductTable.vue'
import DeliveryTable from '@/components/po/DeliveryTable.vue'
import DeliveryForm from '@/components/po/DeliveryForm.vue'
import { Plus, Pencil } from '@lucide/vue'

const route = useRoute()
const {
  purchaseOrder, loading, error, productsWithRemaining,
  fetchByPurchaseOrderNumber, deleteDelivery,
} = usePurchaseOrder()

const poNumber = route.params.purchaseOrderNumber as string

const showDeliveryForm = ref(false)
const editingDelivery = ref<Delivery | null>(null)

onMounted(() => fetchByPurchaseOrderNumber(poNumber))

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
}

function onDeliverySaved() {
  fetchByPurchaseOrderNumber(poNumber)
}

const activeDeliveries = computed(() =>
  purchaseOrder.value?.deliveries.filter(d => !d.deleted_at) ?? []
)

async function handleDeleteDelivery(id: number) {
  if (!confirm('Delete this delivery?')) return
  try {
    await deleteDelivery(id)
    toast.success('Delivery deleted')
  fetchByPurchaseOrderNumber(poNumber)
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
      <Skeleton class="h-64 w-full" />
    </div>

    <div v-else-if="error" class="text-destructive">{{ error }}</div>

    <template v-else-if="purchaseOrder">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ purchaseOrder.id }}</h1>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" as-child>
            <RouterLink :to="{ name: 'purchase-order-edit', params: { purchaseOrderNumber: purchaseOrder.id } }">
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
              :to="{ name: 'client-detail', params: { id: purchaseOrder.client.id } }"
              class="font-medium hover:underline"
            >
              {{ purchaseOrder.client.name }}
            </RouterLink>
          </div>
          <div v-if="purchaseOrder.notes" class="flex justify-between">
            <span class="text-muted-foreground">Notes</span>
            <span class="max-w-[300px] text-right">{{ purchaseOrder.notes }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Created</span>
            <span>{{ formatDate(purchaseOrder.created_at) }}</span>
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
        :deliveries="activeDeliveries"
        @edit="openEditDelivery"
        @delete="handleDeleteDelivery"
      />
    </template>

    <DeliveryForm
      v-if="showDeliveryForm && purchaseOrder"
      :po-id="purchaseOrder.id"
      :client-id="purchaseOrder.clientid"
      :products="productsWithRemaining"
      :delivery="editingDelivery"
      @close="onDeliveryFormClose"
      @saved="onDeliverySaved"
    />
  </div>
</template>
