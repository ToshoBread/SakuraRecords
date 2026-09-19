<script setup lang="ts">
import { ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import type { Delivery } from '@/composables/usePurchaseOrder'
import { useAuth } from '@/composables/useAuth'
import { formatCurrency, formatDate } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, ChevronDown } from '@lucide/vue'

defineProps<{
    deliveries: Delivery[]
}>()

const emit = defineEmits<{
    edit: [delivery: Delivery]
    delete: [id: number]
}>()

const { isAdmin } = useAuth()
const isMobile = useMediaQuery('(max-width: 639px)')
const expanded = ref(new Set<number>())

function toggle(id: number) {
    if (expanded.value.has(id)) {
        expanded.value.delete(id)
    } else {
        expanded.value.add(id)
    }
}
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle>Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
            <Empty v-if="deliveries.length === 0">
                <EmptyHeader>
                    <EmptyTitle>No deliveries yet</EmptyTitle>
                    <EmptyDescription>Add a delivery to record shipment details.</EmptyDescription>
                </EmptyHeader>
            </Empty>

            <!-- Desktop table -->
            <div v-else-if="!isMobile" class="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead class="text-right">Quantity (kg)</TableHead>
                            <TableHead class="text-right">Total</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead class="text-right">Terms (days)</TableHead>
                            <TableHead>Delivered</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Document</TableHead>
                            <TableHead>Requirement</TableHead>
                            <TableHead class="w-20" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="d in deliveries" :key="d.id">
                            <TableCell class="font-medium">{{ d.product.name }}</TableCell>
                            <TableCell class="text-right">{{ d.shipped_quantity }} kg</TableCell>
                            <TableCell class="text-right">{{ formatCurrency(d.shipped_quantity * d.unit_price) }}</TableCell>
                            <TableCell>{{ formatDate(d.delivery_date) }}</TableCell>
                            <TableCell class="text-right">{{ d.payment_terms }}</TableCell>
                            <TableCell>
                                <Badge :variant="d.delivered ? 'secondary' : 'destructive'">
                                    {{ d.delivered ? 'Yes' : 'No' }}
                                </Badge>
                            </TableCell>
                            <TableCell>{{ d.address.name }}</TableCell>
                            <TableCell>{{ d.transaction_document.document }}</TableCell>
                            <TableCell>{{ d.delivery_requirement.requirement }}</TableCell>
                            <TableCell>
                                <div class="flex gap-1">
                                    <Button variant="ghost" size="sm" aria-label="Edit delivery" @click="emit('edit', d)">
                                        <Pencil class="size-4" />
                                    </Button>
                                    <Button v-if="isAdmin" variant="ghost" size="sm" aria-label="Delete delivery" @click="emit('delete', d.id)">
                                        <Trash2 class="size-4 text-destructive" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <!-- Mobile accordion -->
            <div v-else class="divide-y">
                <div v-for="d in deliveries" :key="d.id">
                    <button class="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50" :aria-expanded="expanded.has(d.id)" @click="toggle(d.id)">
                        <div class="min-w-0 flex-1">
                            <p class="font-medium truncate">{{ d.product.name }}</p>
                            <div class="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{{ formatDate(d.delivery_date) }}</span>
                                <Badge :variant="d.delivered ? 'secondary' : 'destructive'" class="text-xs">
                                    {{ d.delivered ? 'Delivered' : 'Pending' }}
                                </Badge>
                            </div>
                        </div>
                        <div class="ml-4 flex items-center gap-2">
                            <div class="flex gap-1">
                                <Button variant="ghost" size="sm" aria-label="Edit delivery" @click.stop="emit('edit', d)">
                                    <Pencil class="size-4" />
                                </Button>
                                <Button v-if="isAdmin" variant="ghost" size="sm" aria-label="Delete delivery" @click.stop="emit('delete', d.id)">
                                    <Trash2 class="size-4 text-destructive" />
                                </Button>
                            </div>
                            <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform duration-200"
                                :class="{ 'rotate-180': expanded.has(d.id) }" />
                        </div>
                    </button>
                    <Transition enter-active-class="transition-[max-height,opacity] duration-200 ease-out"
                        enter-from-class="max-h-0 opacity-0" enter-to-class="max-h-96 opacity-100"
                        leave-active-class="transition-[max-height,opacity] duration-150 ease-in"
                        leave-from-class="max-h-96 opacity-100" leave-to-class="max-h-0 opacity-0">
                        <div v-show="expanded.has(d.id)" class="overflow-hidden">
                            <div class="grid grid-cols-2 gap-x-6 gap-y-3 border-t px-4 py-3 text-sm">
                                <div>
                                    <span class="text-muted-foreground">Quantity</span>
                                    <p class="font-medium">{{ d.shipped_quantity }} kg</p>
                                </div>
                                <div>
                                    <span class="text-muted-foreground">Total</span>
                                    <p class="font-medium">{{ formatCurrency(d.shipped_quantity * d.unit_price) }}</p>
                                </div>
                                <div>
                                    <span class="text-muted-foreground">Payment Terms</span>
                                    <p class="font-medium">{{ d.payment_terms }} days</p>
                                </div>
                                <div>
                                    <span class="text-muted-foreground">Address</span>
                                    <p class="font-medium">{{ d.address.name }}</p>
                                </div>
                                <div>
                                    <span class="text-muted-foreground">Document</span>
                                    <p class="font-medium">{{ d.transaction_document.document }}</p>
                                </div>
                                <div>
                                    <span class="text-muted-foreground">Requirement</span>
                                    <p class="font-medium">{{ d.delivery_requirement.requirement }}</p>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </div>
            </div>
        </CardContent>
    </Card>
</template>
