<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDeliveries } from '@/composables/useDeliveries'
import type { DeliveryWithRelations } from '@/composables/useDeliveries'
import { useAuth } from '@/composables/useAuth'
import { formatCurrency, formatDate } from '@/lib/format'
import DeliveryForm from '@/components/deliveries/DeliveryForm.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Pencil, Trash2, Search } from '@lucide/vue'

const { deliveries, loading, error, fetchAll, fetchStandalone, fetchLinked } = useDeliveries()
const { isAdmin } = useAuth()
const emit = defineEmits<{
    delete: [delivery: DeliveryWithRelations]
}>()

const currentFilter = ref<'all' | 'linked' | 'standalone'>('all')
const searchQuery = ref('')
const showDeliveryForm = ref(false)
const editingDelivery = ref<DeliveryWithRelations | null>(null)

async function applyFilter(filter: 'all' | 'linked' | 'standalone') {
    currentFilter.value = filter
    if (filter === 'all') await fetchAll()
    else if (filter === 'linked') await fetchLinked()
    else if (filter === 'standalone') await fetchStandalone()
}

const filteredDeliveries = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return deliveries.value

    return deliveries.value.filter(d => {
        const productMatch =
            d.product?.name?.toLowerCase().includes(q) ||
            d.product?.code?.toLowerCase().includes(q)
        const poMatch = d.purchase_order?.id?.toLowerCase().includes(q) || false
        const clientMatch =
            d.purchase_order?.client?.name?.toLowerCase().includes(q) ||
            d.address?.client?.name?.toLowerCase().includes(q) ||
            false
        return productMatch || poMatch || clientMatch
    })
})

onMounted(() => {
    applyFilter('all')
})

function openCreateForm() {
    editingDelivery.value = null
    showDeliveryForm.value = true
}

function openEditForm(delivery: DeliveryWithRelations) {
    editingDelivery.value = delivery
    showDeliveryForm.value = true
}

function getClientName(delivery: DeliveryWithRelations): string {
    return delivery.purchase_order?.client?.name ?? delivery.address?.client?.name ?? '—'
}

function getPOTitle(delivery: DeliveryWithRelations): string {
    if (delivery.purchase_order?.id) {
        return `#${delivery.purchase_order.id}`
    }
    return 'Unlinked'
}

function getTotal(delivery: DeliveryWithRelations): number {
    return Number(delivery.shipped_quantity) * Number(delivery.unit_price)
}
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold">Deliveries</h1>
            <Button @click="openCreateForm">
                <Plus class="size-4" />
                New Delivery
            </Button>
        </div>

        <div class="flex items-center gap-4">
            <div class="flex gap-1 bg-muted p-1 rounded-md">
                <Button v-for="filterOption in [
                    { value: 'all', label: 'All' },
                    { value: 'linked', label: 'Linked' },
                    { value: 'standalone', label: 'Standalone' },
                ]" :key="filterOption.value" :variant="currentFilter === filterOption.value ? 'default' : 'ghost'"
                    size="sm" @click="applyFilter(filterOption.value as 'all' | 'linked' | 'standalone')">
                    {{ filterOption.label }}
                </Button>
            </div>

            <div class="relative flex-1 max-w-sm">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input v-model="searchQuery" placeholder="Search by product, PO, or client..." class="pl-10" />
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>
                    {{ currentFilter === 'all' ? 'All Deliveries' : currentFilter === 'linked' ? 'Linked Deliveries' :
                        'Standalone Deliveries' }}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div v-if="error" class="text-sm text-destructive">{{ error }}</div>

                <div v-if="loading" class="space-y-3">
                    <Skeleton v-for="i in 5" :key="i" class="h-12 w-full" />
                </div>

                <div v-else-if="filteredDeliveries.length === 0">
                    <Empty>
                        <EmptyTitle>
                            {{ currentFilter === 'standalone' ? 'No standalone deliveries' : "No deliveries found" }}
                        </EmptyTitle>
                        <EmptyDescription>
                            <template v-if="searchQuery">
                                No results for "{{ searchQuery }}".
                            </template>
                            <template v-else-if="currentFilter === 'standalone'">
                                Create a delivery without a PO to see it here.
                            </template>
                            <template v-else>
                                No deliveries have been recorded yet.
                            </template>
                        </EmptyDescription>
                    </Empty>
                </div>

                <div v-else>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>PO</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Terms</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead class="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="delivery in filteredDeliveries" :key="delivery.id">
                                <TableCell>
                                    <div>
                                        <span class="font-medium">{{ delivery.product?.name }}</span>
                                        <span class="text-muted-foreground"> ({{ delivery.product?.code }})</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span
                                        :class="delivery.purchase_order ? 'text-foreground' : 'text-muted-foreground italic'">
                                        {{ getPOTitle(delivery) }}
                                    </span>
                                </TableCell>
                                <TableCell>{{ getClientName(delivery) }}</TableCell>
                                <TableCell>{{ formatDate(delivery.delivery_date) }}</TableCell>
                                <TableCell>{{ delivery.shipped_quantity }} kg</TableCell>
                                <TableCell>{{ formatCurrency(delivery.unit_price) }}</TableCell>
                                <TableCell>{{ formatCurrency(getTotal(delivery)) }}</TableCell>
                                <TableCell>{{ delivery.payment_terms }} days</TableCell>
                                <TableCell>
                                    <Badge :variant="delivery.delivered ? 'default' : 'outline'">
                                        {{ delivery.delivered ? 'Delivered' : 'Pending' }}
                                    </Badge>
                                </TableCell>
                                <TableCell class="text-right">
                                    <div class="flex justify-end gap-1">
                                        <Button variant="ghost" size="sm" @click="openEditForm(delivery)">
                                            <Pencil class="size-4" />
                                        </Button>
                                        <Button v-if="isAdmin" variant="ghost" size="sm"
                                            @click="$emit('delete', delivery)">
                                            <Trash2 class="size-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

        <DeliveryForm v-if="showDeliveryForm" :po-id="null" :delivery="editingDelivery"
            @close="showDeliveryForm = false" @saved="applyFilter(currentFilter)" />
    </div>
</template>
