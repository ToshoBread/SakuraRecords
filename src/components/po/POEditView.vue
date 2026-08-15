<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePurchaseOrder } from '@/composables/usePurchaseOrder'
import { useProducts } from '@/composables/useProducts'
import { toast } from 'vue-sonner'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Plus, Trash2 } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const poNumber = route.params.purchaseOrderNumber as string

const { purchaseOrder, loading, error, productsWithRemaining, fetchByPurchaseOrderNumber } = usePurchaseOrder()
const { products: allProducts, fetchAll: fetchAllProducts } = useProducts()

const notes = ref('')
const localProducts = ref<{ productid: number; name: string; code: string; ordered_quantity: number; hasDeliveries: boolean }[]>([])
const showProductSheet = ref(false)
const productSearch = ref('')
const submitting = ref(false)
const submitError = ref('')

const filteredProducts = computed(() => {
  if (!productSearch.value) return allProducts.value
  const q = productSearch.value.toLowerCase()
  return allProducts.value.filter(p =>
    p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
  )
})

onMounted(async () => {
  await Promise.all([fetchByPurchaseOrderNumber(poNumber), fetchAllProducts()])
  if (purchaseOrder.value) {
    notes.value = purchaseOrder.value.notes || ''
    localProducts.value = productsWithRemaining.value.map(p => ({
      productid: p.productid,
      name: p.product.name,
      code: p.product.code,
      ordered_quantity: Number(p.ordered_quantity),
      hasDeliveries: p.shipped > 0,
    }))
  }
})

function addProduct(product: { id: number; name: string; code: string }) {
  if (localProducts.value.some(p => p.productid === product.id)) return
  localProducts.value.push({
    productid: product.id,
    name: product.name,
    code: product.code,
    ordered_quantity: 1,
    hasDeliveries: false,
  })
  showProductSheet.value = false
  productSearch.value = ''
}

function removeProduct(productid: number) {
  const product = localProducts.value.find(p => p.productid === productid)
  if (product?.hasDeliveries) return
  localProducts.value = localProducts.value.filter(p => p.productid !== productid)
}

function updateQuantity(productid: number, qty: number) {
  const item = localProducts.value.find(p => p.productid === productid)
  if (item) item.ordered_quantity = Math.max(1, qty)
}

const canSubmit = computed(() => {
  return localProducts.value.length > 0 && !submitting.value
})

async function handleSubmit() {
  if (!canSubmit.value) return

  submitting.value = true
  submitError.value = ''
  try {
    const { error: notesError } = await supabase
      .from('purchase_order')
      .update({ notes: notes.value || null, updated_at: new Date().toISOString() })
      .eq('id', poNumber)

    if (notesError) throw notesError

    const { data: currentPivots } = await supabase
      .from('po_product')
      .select('productid')
      .eq('poid', poNumber)

    const currentProductIds = currentPivots?.map(p => p.productid) ?? []
    const newProductIds = localProducts.value.map(p => p.productid)

    const toAdd = localProducts.value.filter(p => !currentProductIds.includes(p.productid))
    if (toAdd.length > 0) {
      const { error: addError } = await supabase
        .from('po_product')
        .insert(toAdd.map(p => ({
          poid: poNumber,
          productid: p.productid,
          ordered_quantity: p.ordered_quantity,
        })))
      if (addError) throw addError
    }

    const toRemove = currentProductIds.filter(id => !newProductIds.includes(id))
    for (const productid of toRemove) {
      const product = localProducts.value.find(p => p.productid === productid)
      if (product?.hasDeliveries) continue
      const { error: removeError } = await supabase
        .from('po_product')
        .delete()
        .eq('poid', poNumber)
        .eq('productid', productid)
      if (removeError) throw removeError
    }

    for (const product of localProducts.value) {
      if (currentProductIds.includes(product.productid)) {
        const { error: qtyError } = await supabase
          .from('po_product')
          .update({ ordered_quantity: product.ordered_quantity })
          .eq('poid', poNumber)
          .eq('productid', product.productid)
        if (qtyError) throw qtyError
      }
    }

    router.push({ name: 'purchase-order-detail',     params: { purchaseOrderNumber: poNumber } })
    toast.success('Purchase order updated')
  } catch (e: any) {
    toast.error(e.message)
    submitError.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div v-if="loading" class="flex flex-col gap-4">
      <Skeleton class="h-8 w-48" />
      <Skeleton class="h-64 w-full" />
      <Skeleton class="h-64 w-full" />
    </div>

    <div v-else-if="error" class="text-destructive">{{ error }}</div>

    <template v-else-if="purchaseOrder">
      <Card>
        <CardHeader>
          <CardTitle>Edit Purchase Order</CardTitle>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">
            <div class="flex flex-col gap-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Purchase Order Number</span>
                <span class="font-medium">{{ purchaseOrder.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Client</span>
                <span class="font-medium">{{ purchaseOrder.client.name }}</span>
              </div>
            </div>

            <FieldGroup>
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

              <div v-if="localProducts.length === 0" class="text-sm text-muted-foreground py-4 text-center border rounded-md">
                No products added yet
              </div>

              <Table v-else>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead class="w-32">Quantity</TableHead>
                    <TableHead class="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="item in localProducts" :key="item.productid">
                    <TableCell>{{ item.name }}</TableCell>
                    <TableCell>{{ item.code }}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        :model-value="item.ordered_quantity"
                        @update:model-value="updateQuantity(item.productid, Number($event))"
                        min="1"
                        class="h-9"
                        :disabled="submitting || item.hasDeliveries"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="removeProduct(item.productid)"
                        :disabled="submitting || item.hasDeliveries"
                        :title="item.hasDeliveries ? 'Cannot remove: product has deliveries' : 'Remove product'"
                      >
                        <Trash2 class="w-4 h-4" :class="item.hasDeliveries ? 'text-muted-foreground' : 'text-destructive'" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <p v-if="localProducts.some(p => p.hasDeliveries)" class="text-xs text-muted-foreground">
                Products with existing deliveries cannot be removed or have their quantity changed.
              </p>
            </div>

            <div v-if="submitError" class="text-sm text-destructive">{{ submitError }}</div>

            <div class="flex gap-2">
              <Button type="submit" :disabled="!canSubmit">
                {{ submitting ? 'Saving...' : 'Save Changes' }}
              </Button>
              <Button variant="outline" type="button" @click="router.back()">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Sheet v-model:open="showProductSheet">
        <SheetContent side="right" class="w-[400px] sm:w-[540px]">
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
                :class="{ 'opacity-50 pointer-events-none': localProducts.some(p => p.productid === product.id) }"
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
    </template>
  </div>
</template>
