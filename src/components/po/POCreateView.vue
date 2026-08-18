<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePurchaseOrders } from '@/composables/usePurchaseOrders'
import { useClients } from '@/composables/useClients'
import { useProducts } from '@/composables/useProducts'
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

const purchaseOrderNumber = ref('')
const clientId = ref<string>('')
const notes = ref('')
const selectedProducts = ref<{ productId: number; name: string; code: string; ordered_quantity: number; price_per_kg: number }[]>([])
const showProductSheet = ref(false)
const productSearch = ref('')
const submitting = ref(false)
const fieldErrors = ref<Record<string, string>>({})
const serverError = ref('')
const purchaseOrderNumberError = ref('')

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

const filteredProducts = () => {
  if (!productSearch.value) return products.value
  const q = productSearch.value.toLowerCase()
  return products.value.filter(p =>
    p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
  )
}

const canSubmit = () => {
  return !submitting.value
    && !purchaseOrderNumberError.value
}

async function handleSubmit() {
  const result = purchaseOrderSchema.safeParse({
    purchaseOrderNumber: purchaseOrderNumber.value.trim(),
    clientId: clientId.value,
    notes: notes.value || undefined,
    products: selectedProducts.value,
  })
  if (!result.success) {
    fieldErrors.value = Object.fromEntries(
      result.error.issues.map(i => [i.path[0] as string, i.message])
    )
    return
  }
  if (purchaseOrderNumberError.value) return
  fieldErrors.value = {}
  submitting.value = true
  serverError.value = ''
  try {
    await createPurchaseOrder(
      result.data.purchaseOrderNumber,
      Number(result.data.clientId),
      result.data.notes ?? null,
      result.data.products.map(p => ({
        productId: p.productId,
        ordered_quantity: p.ordered_quantity,
        price_per_kg: p.price_per_kg,
      }))
    )
    toast.success('Purchase order created')
    router.push({ name: 'purchase-order-detail', params: { purchaseOrderNumber: result.data.purchaseOrderNumber } })
  } catch (e: any) {
    toast.error(e.message)
    serverError.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <Card>
      <CardHeader>
        <CardTitle>New Purchase Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">
          <FieldGroup>
            <Field :data-invalid="!!fieldErrors.purchaseOrderNumber || !!purchaseOrderNumberError">
              <FieldLabel for="purchaseOrderNumber">Purchase Order Number</FieldLabel>
              <Input
                id="purchaseOrderNumber"
                v-model="purchaseOrderNumber"
                required
                :disabled="submitting"
                placeholder="e.g. PO-2026-001"
                @blur="handlePurchaseOrderNumberBlur"
                aria-invalid="true"
              />
              <p v-if="fieldErrors.purchaseOrderNumber" class="text-sm text-destructive">{{ fieldErrors.purchaseOrderNumber }}</p>
              <p v-else-if="purchaseOrderNumberError" class="text-sm text-destructive">{{ purchaseOrderNumberError }}</p>
            </Field>

            <Field :data-invalid="!!fieldErrors.clientId">
              <FieldLabel>Client</FieldLabel>
              <Select v-model="clientId" :disabled="submitting">
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
              <p v-if="fieldErrors.clientId" class="text-sm text-destructive">{{ fieldErrors.clientId }}</p>
            </Field>

            <Field>
              <FieldLabel for="notes">Notes</FieldLabel>
              <Textarea
                id="notes"
                v-model="notes"
                :disabled="submitting"
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
                :disabled="submitting"
              >
                <Plus class="w-4 h-4 mr-1" />
                Add Product
              </Button>
            </div>

            <div v-if="selectedProducts.length === 0 && fieldErrors.products" class="text-sm text-destructive py-4 text-center border rounded-md">
              {{ fieldErrors.products }}
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
                      :disabled="submitting"
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
                      :disabled="submitting"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      @click="removeProduct(item.productId)"
                      :disabled="submitting"
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
            <Button type="submit" :disabled="!canSubmit()">
              {{ submitting ? 'Creating...' : 'Create Purchase Order' }}
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
              v-for="product in filteredProducts()"
              :key="product.id"
              type="button"
              class="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-left"
              :class="{ 'opacity-50 pointer-events-none': selectedProducts.some(p => p.productId === product.id) }"
              @click="addProduct(product)"
            >
              <span class="font-medium">{{ product.name }}</span>
              <span class="text-muted-foreground">{{ product.code }}</span>
            </button>
            <p v-if="filteredProducts().length === 0" class="text-sm text-muted-foreground text-center py-4">
              No products found
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>
