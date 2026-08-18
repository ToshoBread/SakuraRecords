<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePurchaseOrders } from '@/composables/usePurchaseOrders'
import { useClients } from '@/composables/useClients'
import { useProducts } from '@/composables/useProducts'
import { useFormValidation } from '@/composables/useFormValidation'
import { purchaseOrderSchema } from '@/lib/schemas'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Plus, Trash2 } from '@lucide/vue'

const router = useRouter()
const { createPurchaseOrder, checkPurchaseOrderNumberUnique } = usePurchaseOrders()
const { clients, fetchAll: fetchClients } = useClients()
const { products, fetchAll: fetchProducts } = useProducts()

const selectedProducts = ref<{ productId: number; name: string; code: string; ordered_quantity: number; price_per_kg: number }[]>([])
const showProductSheet = ref(false)
const productSearch = ref('')
const purchaseOrderNumberError = ref('')

const { errors, isSubmitting, serverError, defineField, handleServerSubmit } = useFormValidation(
  purchaseOrderSchema,
  { purchaseOrderNumber: '', clientId: '', notes: '', products: [] },
)

const [purchaseOrderNumber, purchaseOrderNumberAttrs] = defineField('purchaseOrderNumber')
const [clientId] = defineField('clientId')
const [notes, notesAttrs] = defineField('notes')

onMounted(async () => {
  await Promise.all([fetchClients(), fetchProducts()])
})

async function handlePurchaseOrderNumberBlur() {
  if (!purchaseOrderNumber.value.trim()) return
  const unique = await checkPurchaseOrderNumberUnique(purchaseOrderNumber.value.trim())
  purchaseOrderNumberError.value = unique ? '' : 'Purchase order number already exists'
}

function addProduct(product: { id: number; name: string; code: string }) {
  if (selectedProducts.value.some(p => p.productId === product.id)) return
  selectedProducts.value.push({
    productId: product.id,
    name: product.name,
    code: product.code,
    ordered_quantity: 1,
    price_per_kg: 0,
  })
  showProductSheet.value = false
  productSearch.value = ''
}

function removeProduct(productId: number) {
  selectedProducts.value = selectedProducts.value.filter(p => p.productId !== productId)
}

function updateQuantity(productId: number, qty: number) {
  const item = selectedProducts.value.find(p => p.productId === productId)
  if (item) item.ordered_quantity = Math.max(1, qty)
}

function updatePricePerKg(productId: number, price: number) {
  const item = selectedProducts.value.find(p => p.productId === productId)
  if (item) item.price_per_kg = Math.max(0, price)
}

const filteredProducts = computed(() => {
  if (!productSearch.value) return products.value
  const q = productSearch.value.toLowerCase()
  return products.value.filter(p =>
    p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
  )
})

const canSubmit = computed(() => {
  return !isSubmitting.value
    && !purchaseOrderNumberError.value
})

const onSubmit = handleServerSubmit(async (values) => {
  await createPurchaseOrder(
    values.purchaseOrderNumber,
    Number(values.clientId),
    values.notes || null,
    selectedProducts.value.map(p => ({
      productId: p.productId,
      ordered_quantity: p.ordered_quantity,
      price_per_kg: p.price_per_kg,
    })),
  )
  toast.success('Purchase order created')
  router.push({ name: 'purchase-order-detail', params: { purchaseOrderNumber: values.purchaseOrderNumber } })
})
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <Card>
      <CardHeader>
        <CardTitle>New Purchase Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="onSubmit" class="flex flex-col gap-6">
          <FieldGroup>
            <Field :data-invalid="!!errors.purchaseOrderNumber || !!purchaseOrderNumberError">
              <FieldLabel for="purchaseOrderNumber">Purchase Order Number</FieldLabel>
              <Input
                id="purchaseOrderNumber"
                v-model="purchaseOrderNumber"
                v-bind="purchaseOrderNumberAttrs"
                required
                :disabled="isSubmitting"
                placeholder="e.g. PO-2026-001"
                @blur="handlePurchaseOrderNumberBlur"
                :aria-invalid="!!errors.purchaseOrderNumber || !!purchaseOrderNumberError"
              />
              <p v-if="errors.purchaseOrderNumber" class="text-sm text-destructive">{{ errors.purchaseOrderNumber }}</p>
              <p v-else-if="purchaseOrderNumberError" class="text-sm text-destructive">{{ purchaseOrderNumberError }}</p>
            </Field>

            <Field :data-invalid="!!errors.clientId">
              <FieldLabel>Client</FieldLabel>
              <Select v-model="clientId" :disabled="isSubmitting">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="client in clients"
                    :key="client.id"
                    :value="String(client.id)"
                  >
                    {{ client.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.clientId" class="text-sm text-destructive">{{ errors.clientId }}</p>
            </Field>

            <Field>
              <FieldLabel for="notes">Notes</FieldLabel>
              <Textarea
                id="notes"
                v-model="notes"
                v-bind="notesAttrs"
                :disabled="isSubmitting"
                placeholder="Optional notes"
              />
            </Field>
          </FieldGroup>

          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium">Products</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="showProductSheet = true"
                :disabled="isSubmitting"
              >
                <Plus class="w-4 h-4 mr-1" />
                Add Product
              </Button>
            </div>

            <div v-if="selectedProducts.length === 0 && errors.products" class="text-sm text-destructive py-4 text-center border rounded-md">
              {{ errors.products }}
            </div>
            <div v-else-if="selectedProducts.length === 0" class="text-sm text-muted-foreground py-4 text-center border rounded-md">
              No products added yet
            </div>

            <Table v-else>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead class="w-32">Quantity (kg)</TableHead>
                  <TableHead class="w-32">Price/kg</TableHead>
                  <TableHead class="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="item in selectedProducts" :key="item.productId">
                  <TableCell>{{ item.name }}</TableCell>
                  <TableCell>{{ item.code }}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      :model-value="item.ordered_quantity"
                      @update:model-value="updateQuantity(item.productId, Number($event))"
                      min="1"
                      class="h-9"
                      :disabled="isSubmitting"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      :model-value="item.price_per_kg"
                      @update:model-value="updatePricePerKg(item.productId, Number($event))"
                      min="0"
                      step="0.01"
                      class="h-9"
                      :disabled="isSubmitting"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      @click="removeProduct(item.productId)"
                      :disabled="isSubmitting"
                    >
                      <Trash2 class="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div v-if="serverError" class="text-sm text-destructive">{{ serverError }}</div>

          <div class="flex gap-2">
            <Button type="submit" :disabled="!canSubmit">
              {{ isSubmitting ? 'Creating...' : 'Create Purchase Order' }}
            </Button>
            <Button variant="outline" type="button" @click="router.back()">Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <Sheet v-model:open="showProductSheet">
      <SheetContent side="right" class="w-full sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Add Product</SheetTitle>
          <SheetDescription>Select a product to add to this purchase order</SheetDescription>
        </SheetHeader>
        <div class="mt-4 flex flex-col gap-4">
          <Input
            v-model="productSearch"
            placeholder="Search by name or code..."
          />
          <div class="flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
            <button
              v-for="product in filteredProducts"
              :key="product.id"
              type="button"
              class="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-left"
              :class="{ 'opacity-50 pointer-events-none': selectedProducts.some(p => p.productId === product.id) }"
              @click="addProduct(product)"
            >
              <span class="font-medium">{{ product.name }}</span>
              <span class="text-muted-foreground">{{ product.code }}</span>
            </button>
            <p v-if="filteredProducts.length === 0" class="text-sm text-muted-foreground text-center py-4">
              No products found
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>
