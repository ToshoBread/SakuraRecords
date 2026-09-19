<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/format'
import { useFormValidation } from '@/composables/useFormValidation'
import { deliverySchema } from '@/lib/schemas'
import { toast } from 'vue-sonner'
import type { ProductWithRemaining, Delivery } from '@/composables/usePurchaseOrder'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Link2, Unlink } from '@lucide/vue'

interface ProductOption {
  productid: number
  name: string
  code: string
  price_per_kg?: number
  remaining?: number
  ordered_quantity?: number
}

interface ClientOption {
  id: number
  name: string
}

interface AddressOption {
  id: number
  name: string
}

interface PurchaseOrderOption {
  id: string
  client: { name: string }
}

const props = defineProps<{
  poId?: string | null
  clientId?: number | null
  products?: ProductWithRemaining[]
  delivery?: Delivery | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const isEditing = computed(() => !!props.delivery)
const isStandalone = computed(() => !props.poId)
const hasPO = computed(() => Boolean(props.poId || selectedPO.value || props.delivery?.poid))
const isUnitPriceEditable = computed(() => !hasPO.value)

const selectedPO = ref<string | null>(null)
const selectedClient = ref<string | null>(null)
const allClients = ref<ClientOption[]>([])
const allProducts = ref<ProductOption[]>([])
const poProducts = ref<ProductOption[]>([])
const purchaseOrders = ref<PurchaseOrderOption[]>([])
const addresses = ref<AddressOption[]>([])
const transactionDocuments = ref<{ id: number; document: string }[]>([])
const deliveryRequirements = ref<{ id: number; requirement: string }[]>([])

const { errors, isSubmitting, serverError, defineField, handleServerSubmit } = useFormValidation(
  deliverySchema,
  {
    productId: props.delivery ? String(props.delivery.productid) : '',
    unit_price: props.delivery?.unit_price ?? 0,
    shipped_quantity: props.delivery?.shipped_quantity ?? 1,
    delivery_date: props.delivery?.delivery_date ?? new Date().toISOString().slice(0, 10),
    payment_terms: props.delivery?.payment_terms ?? 30,
    delivered: props.delivery?.delivered ?? false,
    addressId: props.delivery ? String(props.delivery.addressid) : '',
    transactionDocumentId: props.delivery ? String(props.delivery.transactiondocumentid) : '1',
    deliveryRequirementId: props.delivery ? String(props.delivery.deliveryrequirementid) : '1',
  },
)

const [productId] = defineField('productId')
const [shipped_quantity, shipped_quantityAttrs] = defineField('shipped_quantity')
const [unit_price, unit_priceAttrs] = defineField('unit_price')
const [delivery_date, delivery_dateAttrs] = defineField('delivery_date')
const [payment_terms, payment_termsAttrs] = defineField('payment_terms')
const [delivered] = defineField('delivered')
const [addressId] = defineField('addressId')
const [transactionDocumentId] = defineField('transactionDocumentId')
const [deliveryRequirementId] = defineField('deliveryRequirementId')

const currentClientId = computed(() => props.clientId ?? Number(selectedClient.value) ?? null)

const effectiveProducts = computed<ProductOption[]>(() => {
  if (props.poId && props.products) {
    return props.products.map(pp => ({
      productid: pp.productid,
      name: pp.product.name,
      code: pp.product.code,
      price_per_kg: pp.price_per_kg,
      remaining: pp.remaining,
    }))
  }
  if (selectedPO.value && poProducts.value.length > 0) {
    return poProducts.value
  }
  return allProducts.value
})

const selectedProduct = computed(() => {
  const id = Number(productId.value)
  return effectiveProducts.value.find(p => p.productid === id)
})

const effectivePricePerKg = computed(() => {
  if (props.delivery && props.delivery.poid) {
    return props.delivery.unit_price
  }
  const selectedId = Number(productId.value)
  const prod = effectiveProducts.value.find(p => p.productid === selectedId)
  return prod?.price_per_kg ?? 0
})

const maxQuantity = computed(() => {
  if (!hasPO.value) return null
  if (!selectedProduct.value) return 0
  if (selectedProduct.value.remaining !== undefined) return selectedProduct.value.remaining
  if (selectedProduct.value.ordered_quantity !== undefined) {
    return selectedProduct.value.ordered_quantity
  }
  return 0
})

const totalPrice = computed(() => {
  const qty = Number(shipped_quantity.value)
  const price = hasPO.value ? effectivePricePerKg.value : Number(unit_price.value)
  return qty * price
})

const isProductDisabled = computed(() => {
  if (isSubmitting.value) return true
  if (isEditing.value && props.delivery?.poid) return true
  return false
})

const isAddressDisabled = computed(() => {
  if (isSubmitting.value) return true
  return false
})

const canLink = computed(() => {
  if (!isEditing.value) return false
  if (!props.delivery) return false
  return !props.delivery.poid && !!selectedPO.value && !isSubmitting.value
})

const isLinked = computed(() => {
  if (!isEditing.value) return false
  if (!props.delivery) return false
  return Boolean(props.delivery.poid)
})

watch(
  [hasPO, productId, () => selectedPO.value],
  () => {
    if (hasPO.value && !isEditing.value) {
      const price = effectivePricePerKg.value
      if (price > 0) {
        unit_price.value = price
      }
    }
  },
  { immediate: true },
)

watch(
  currentClientId,
  async (newClientId) => {
    addressId.value = ''
    if (newClientId) {
      const { data } = await supabase
        .from('address')
        .select('id, name')
        .eq('clientid', newClientId)
        .is('deleted_at', null)
        .order('name')
      addresses.value = (data as AddressOption[]) ?? []
      if (props.delivery && addresses.value.some(a => a.id === props.delivery.addressid)) {
        addressId.value = String(props.delivery.addressid)
      }
    } else {
      addresses.value = []
    }
  },
  { immediate: true },
)

watch(selectedPO, async (newPO) => {
  if (newPO) {
    const { data } = await supabase
      .from('po_product')
      .select(
        'productid, ordered_quantity, price_per_kg, product:productid (id, name, code)',
      )
      .eq('poid', newPO)
    poProducts.value = (data as unknown as ProductOption[]) ?? []
  } else {
    poProducts.value = []
  }
})

onMounted(async () => {
  const fetches: Promise<unknown>[] = [
    supabase
      .from('transaction_document')
      .select('id, document')
      .is('deleted_at', null)
      .order('document'),
    supabase
      .from('delivery_requirement')
      .select('id, requirement')
      .is('deleted_at', null)
      .order('requirement'),
  ]

  if (!props.clientId) {
    fetches.push(
      supabase.from('client').select('id, name').is('deleted_at', null).order('name'),
      supabase.from('product').select('id, name, code').is('deleted_at', null).order('name'),
      supabase
        .from('purchase_order')
        .select('id, client:clientid (name)')
        .is('deleted_at', null)
        .order('id'),
    )
  }

  if (props.delivery && !props.clientId) {
    fetches.push(
      supabase
        .from('address')
        .select('clientid')
        .eq('id', props.delivery.addressid)
        .single(),
    )
  }

  const [tdRes, drRes, ...rest] = await Promise.all(fetches)

  transactionDocuments.value = (tdRes.data as { id: number; document: string }[]) ?? []
  deliveryRequirements.value = (drRes.data as { id: number; requirement: string }[]) ?? []

  if (!props.clientId) {
    allClients.value = (rest[0].data as ClientOption[]) ?? []
    allProducts.value = (rest[1].data as ProductOption[]) ?? []
    purchaseOrders.value = (rest[2].data as PurchaseOrderOption[]) ?? []

    if (props.delivery) {
      const addrClient = rest[3].data as { clientid: number } | null
      if (addrClient) {
        selectedClient.value = String(addrClient.clientid)
        if (props.delivery.poid) {
          selectedPO.value = props.delivery.poid
        }
      }
    }
  } else if (props.clientId) {
    const { data } = await supabase
      .from('address')
      .select('id, name')
      .eq('clientid', props.clientId)
      .is('deleted_at', null)
      .order('name')
    addresses.value = (data as AddressOption[]) ?? []
  }

  if (!props.poId && props.products && props.products.length > 0) {
    const firstWithRemaining = props.products.find(p => p.remaining > 0)
    if (firstWithRemaining) productId.value = String(firstWithRemaining.productid)
  }
})

const onSubmit = handleServerSubmit(async (values) => {
  const price = hasPO.value ? effectivePricePerKg.value : Number(values.unit_price)
  const poidToSave = props.delivery
    ? props.delivery.poid
    : (props.poId ?? null)

  const payload = {
    productid: Number(values.productId),
    shipped_quantity: Number(values.shipped_quantity),
    unit_price: price,
    delivery_date: values.delivery_date,
    payment_terms: Number(values.payment_terms),
    delivered: values.delivered,
    addressid: Number(values.addressId),
    transactiondocumentid: Number(values.transactionDocumentId),
    deliveryrequirementid: Number(values.deliveryRequirementId),
  }

  if (props.delivery) {
    const { error: err } = await supabase
      .from('delivery')
      .update({ ...payload, poid: props.delivery.poid, updated_at: new Date().toISOString() })
      .eq('id', props.delivery.id)
    if (err) throw err
    toast.success('Delivery updated')
  } else {
    if (poidToSave) {
      const { error: err } = await supabase
        .from('delivery')
        .insert({ ...payload, poid: poidToSave })
      if (err) throw err
      toast.success('Delivery added')
    } else {
      const { error: err } = await supabase
        .from('delivery')
        .insert({ ...payload, poid: null })
      if (err) throw err
      toast.success('Delivery saved')
    }
  }
  emit('saved')
  emit('close')
})

async function handleLinkToPO() {
  if (!props.delivery || !selectedPO.value) return
  try {
    const { error: err } = await supabase.rpc('link_delivery_to_po', {
      p_delivery_id: props.delivery.id,
      p_poid: selectedPO.value,
    })
    if (err) throw err
    toast.success('Delivery linked to PO')
    emit('saved')
    emit('close')
  } catch (e: any) {
    toast.error(e.message)
  }
}

async function handleUnlink() {
  if (!props.delivery) return
  if (!confirm('Unlink this delivery from its PO?')) return
  try {
    const { error: err } = await supabase
      .from('delivery')
      .update({ poid: null, updated_at: new Date().toISOString() })
      .eq('id', props.delivery.id)
    if (err) throw err
    toast.success('Delivery unlinked')
    emit('saved')
    emit('close')
  } catch (e: any) {
    toast.error(e.message)
  }
}
</script>

<template>
  <Sheet :open="true" @update:open="(v) => !v && emit('close')">
    <SheetContent side="right" class="w-full sm:max-w-lg overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{{ isEditing ? 'Edit Delivery' : 'New Delivery' }}</SheetTitle>
        <SheetDescription>
          <template v-if="isEditing">
            <template v-if="isLinked">
              Update delivery details for PO {{ props.delivery?.poid }}.
            </template>
            <template v-else>
              Update delivery details. This delivery is not linked to a PO.
            </template>
          </template>
          <template v-else>
            {{ isStandalone ? 'Record a delivery without a purchase order.' : 'Record a new delivery for this purchase order.' }}
          </template>
        </SheetDescription>
      </SheetHeader>

      <form @submit.prevent="onSubmit" class="flex flex-col gap-4 px-6 py-4">
        <div v-if="isEditing && isLinked" class="rounded-md border px-4 py-3">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm text-muted-foreground">Linked to PO</span>
              <p class="font-medium">{{ props.delivery?.poid }}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              :disabled="isSubmitting"
              @click="handleUnlink"
            >
              <Unlink class="size-4" />
              Unlink
            </Button>
          </div>
        </div>

        <div v-if="isEditing && !isLinked && isStandalone" class="rounded-md border px-4 py-3 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Not linked to a PO</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              :disabled="!canLink"
              @click="handleLinkToPO"
            >
              <Link2 class="size-4" />
              Link to PO
            </Button>
          </div>
          <Select v-model="selectedPO" :disabled="isSubmitting">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select PO to link..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="po in purchaseOrders"
                :key="po.id"
                :value="po.id"
              >
                {{ po.id }} ({{ po.client?.name }})
              </SelectItem>
            </SelectContent>
          </Select>
          <p class="text-xs text-muted-foreground">
            Select a PO, then click Link. The delivery stays standalone until linked.
          </p>
        </div>

        <FieldGroup>
          <Field v-if="!props.clientId && isStandalone">
            <FieldLabel for="clientSelect">Client</FieldLabel>
            <Select v-model="selectedClient" :disabled="isSubmitting">
              <SelectTrigger id="clientSelect" class="w-full">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="client in allClients"
                  :key="client.id"
                  :value="String(client.id)"
                >
                  {{ client.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field v-if="!props.poId && isStandalone && !isEditing">
            <FieldLabel for="poSelect">Purchase Order (optional — for price reference)</FieldLabel>
            <Select v-model="selectedPO" :disabled="isSubmitting">
              <SelectTrigger id="poSelect" class="w-full">
                <SelectValue placeholder="Select PO to filter products and auto-derive price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="po in purchaseOrders"
                  :key="po.id"
                  :value="po.id"
                >
                  {{ po.id }} ({{ po.client?.name }})
                </SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground">
              Delivery stays standalone until you click Link below. PO filters products and derives unit price.
            </p>
          </Field>

          <Field v-if="isStandalone && !isEditing" :data-invalid="!!errors.productId">
            <FieldLabel>Product</FieldLabel>
            <Select v-model="productId" :disabled="isSubmitting">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="prod in effectiveProducts"
                  :key="prod.productid"
                  :value="String(prod.productid)"
                >
                  {{ prod.name }} ({{ prod.code }})
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.productId" class="text-sm text-destructive">{{ errors.productId }}</p>
          </Field>

          <Field v-else :data-invalid="!!errors.productId">
            <FieldLabel>Product</FieldLabel>
            <div v-if="isProductDisabled" class="flex items-center gap-2 py-2">
              <span class="font-medium">{{ props.delivery?.product?.name }}</span>
              <span class="text-muted-foreground">({{ props.delivery?.product?.code }})</span>
            </div>
            <Select v-else v-model="productId" :disabled="isSubmitting">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="prod in effectiveProducts"
                  :key="prod.productid"
                  :value="String(prod.productid)"
                >
                  {{ prod.name }} ({{ prod.code }})
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.productId" class="text-sm text-destructive">{{ errors.productId }}</p>
          </Field>

          <Field :data-invalid="!!errors.shipped_quantity">
            <FieldLabel for="qty">Shipped Quantity (kg)</FieldLabel>
            <Input
              id="qty"
              type="number"
              v-model="shipped_quantity"
              v-bind="shipped_quantityAttrs"
              :min="1"
              :max="maxQuantity ?? undefined"
              required
              :disabled="isSubmitting"
              :aria-invalid="!!errors.shipped_quantity"
            />
            <p v-if="errors.shipped_quantity" class="text-sm text-destructive">{{ errors.shipped_quantity }}</p>
            <p v-else-if="maxQuantity !== null" class="text-xs text-muted-foreground">
              Max: {{ maxQuantity }} kg
            </p>
          </Field>

          <Field v-if="isUnitPriceEditable" :data-invalid="!!errors.unit_price">
            <FieldLabel for="unitPrice">Price/kg (₱)</FieldLabel>
            <Input
              id="unitPrice"
              type="number"
              v-model="unit_price"
              v-bind="unit_priceAttrs"
              min="0"
              step="0.01"
              required
              :disabled="isSubmitting"
              :aria-invalid="!!errors.unit_price"
            />
            <p v-if="errors.unit_price" class="text-sm text-destructive">{{ errors.unit_price }}</p>
          </Field>

          <div v-else class="rounded-md border px-4 py-3 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Price/kg</span>
              <span>{{ formatCurrency(effectivePricePerKg) }}</span>
            </div>
            <div class="flex justify-between font-medium mt-1">
              <span>Total</span>
              <span>{{ formatCurrency(totalPrice) }}</span>
            </div>
          </div>

          <Field :data-invalid="!!errors.delivery_date">
            <FieldLabel for="date">Delivery Date</FieldLabel>
            <Input
              id="date"
              type="date"
              v-model="delivery_date"
              v-bind="delivery_dateAttrs"
              required
              :disabled="isSubmitting"
              :aria-invalid="!!errors.delivery_date"
            />
            <p v-if="errors.delivery_date" class="text-sm text-destructive">{{ errors.delivery_date }}</p>
          </Field>

          <Field :data-invalid="!!errors.payment_terms">
            <FieldLabel for="terms">Payment Terms (days)</FieldLabel>
            <Input
              id="terms"
              type="number"
              v-model="payment_terms"
              v-bind="payment_termsAttrs"
              min="0"
              required
              :disabled="isSubmitting"
              :aria-invalid="!!errors.payment_terms"
            />
            <p v-if="errors.payment_terms" class="text-sm text-destructive">{{ errors.payment_terms }}</p>
          </Field>

          <Field>
            <div class="flex items-center gap-3">
              <Switch
                v-model="delivered"
                :disabled="isSubmitting"
              />
              <FieldLabel class="mb-0">Delivered</FieldLabel>
            </div>
          </Field>

          <Field :data-invalid="!!errors.addressId">
            <FieldLabel>Address</FieldLabel>
            <Select v-model="addressId" :disabled="isSubmitting || !currentClientId">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select address" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="addr in addresses"
                  :key="addr.id"
                  :value="String(addr.id)"
                >
                  {{ addr.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.addressId" class="text-sm text-destructive">{{ errors.addressId }}</p>
            <p v-else-if="!currentClientId && isStandalone" class="text-xs text-muted-foreground">
              Select a client above to load addresses.
            </p>
          </Field>

          <Field :data-invalid="!!errors.transactionDocumentId">
            <FieldLabel>Transaction Document</FieldLabel>
            <Select v-model="transactionDocumentId" :disabled="isSubmitting">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="td in transactionDocuments"
                  :key="td.id"
                  :value="String(td.id)"
                >
                  {{ td.document }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.transactionDocumentId" class="text-sm text-destructive">{{ errors.transactionDocumentId }}</p>
          </Field>

          <Field :data-invalid="!!errors.deliveryRequirementId">
            <FieldLabel>Delivery Requirement</FieldLabel>
            <Select v-model="deliveryRequirementId" :disabled="isSubmitting">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select requirement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="dr in deliveryRequirements"
                  :key="dr.id"
                  :value="String(dr.id)"
                >
                  {{ dr.requirement }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.deliveryRequirementId" class="text-sm text-destructive">{{ errors.deliveryRequirementId }}</p>
          </Field>
        </FieldGroup>

        <div v-if="serverError" class="text-sm text-destructive">{{ serverError }}</div>

        <SheetFooter>
          <Button type="button" variant="outline" @click="emit('close')">Cancel</Button>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Delivery') }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
