<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { toast } from 'vue-sonner'
import type { ProductWithRemaining, Delivery } from '@/composables/usePurchaseOrder'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const props = defineProps<{
  poId: string
  clientId: number
  products: ProductWithRemaining[]
  delivery?: Delivery | null
}>()

const emit = defineEmits<{
  close: []
}>()

const isEditing = computed(() => !!props.delivery)

const productId = ref<string>(props.delivery ? String(props.delivery.productid) : '')
const shipped_quantity = ref(props.delivery?.shipped_quantity ?? 1)
const unit_price = ref(props.delivery?.unit_price ?? 0)
const delivery_date = ref(props.delivery?.delivery_date ?? new Date().toISOString().slice(0, 10))
const payment_terms = ref(props.delivery?.payment_terms ?? 30)
const paid = ref(props.delivery?.paid ?? false)
const addressId = ref<string>(props.delivery ? String(props.delivery.addressid) : '')
const transactionDocumentId = ref<string>(props.delivery ? String(props.delivery.transactiondocumentid) : '')
const deliveryRequirementId = ref<string>(props.delivery ? String(props.delivery.deliveryrequirementid) : '')

const addresses = ref<{ id: number; name: string }[]>([])
const transactionDocuments = ref<{ id: number; document: string }[]>([])
const deliveryRequirements = ref<{ id: number; requirement: string }[]>([])

const submitting = ref(false)
const error = ref('')

const selectedProductRemaining = computed(() => {
  const pp = props.products.find(p => p.productid === Number(productId.value))
  if (!pp) return null
  if (isEditing.value && props.delivery && props.delivery.productid === Number(productId.value)) {
    return pp.remaining + Number(props.delivery.shipped_quantity)
  }
  return pp.remaining
})

const maxQuantity = computed(() => selectedProductRemaining.value ?? 0)

onMounted(async () => {
  const [addrRes, tdRes, drRes] = await Promise.all([
    supabase.from('address').select('id, name').eq('clientid', props.clientId).is('deleted_at', null).order('name'),
    supabase.from('transaction_document').select('id, document').is('deleted_at', null).order('document'),
    supabase.from('delivery_requirement').select('id, requirement').is('deleted_at', null).order('requirement'),
  ])
  addresses.value = (addrRes.data as { id: number; name: string }[]) ?? []
  transactionDocuments.value = (tdRes.data as { id: number; document: string }[]) ?? []
  deliveryRequirements.value = (drRes.data as { id: number; requirement: string }[]) ?? []

  if (!productId.value && props.products.length > 0) {
    const firstWithRemaining = props.products.find(p => p.remaining > 0)
    if (firstWithRemaining) productId.value = String(firstWithRemaining.productid)
  }
})

async function handleSubmit() {
  if (!productId.value || !addressId.value || !transactionDocumentId.value || !deliveryRequirementId.value) return
  if (Number(shipped_quantity.value) <= 0) return
  if (maxQuantity.value !== null && Number(shipped_quantity.value) > maxQuantity.value) return

  submitting.value = true
  error.value = ''

  const payload = {
    poid: props.poId,
    productid: Number(productId.value),
    shipped_quantity: Number(shipped_quantity.value),
    unit_price: Number(unit_price.value),
    delivery_date: delivery_date.value,
    payment_terms: Number(payment_terms.value),
    paid: paid.value,
    addressid: Number(addressId.value),
    transactiondocumentid: Number(transactionDocumentId.value),
    deliveryrequirementid: Number(deliveryRequirementId.value),
  }

  try {
    if (isEditing.value && props.delivery) {
      const { poid: _poid, ...updateData } = payload
      const { error: err } = await supabase
        .from('delivery')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', props.delivery.id)
      if (err) throw err
      toast.success('Delivery updated')
    } else {
      const { error: err } = await supabase
        .from('delivery')
        .insert(payload)
      if (err) throw err
      toast.success('Delivery added')
    }
    emit('close')
  } catch (e: any) {
    toast.error(e.message)
    error.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Sheet :open="true" @update:open="(v) => !v && emit('close')">
    <SheetContent side="right" class="w-full sm:max-w-lg overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{{ isEditing ? 'Edit Delivery' : 'New Delivery' }}</SheetTitle>
        <SheetDescription>
          {{ isEditing ? 'Update delivery details.' : 'Record a new delivery for this purchase order.' }}
        </SheetDescription>
      </SheetHeader>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4 px-6 py-4">
        <FieldGroup>
          <Field>
            <FieldLabel>Product</FieldLabel>
            <Select v-model="productId" :disabled="submitting || isEditing">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="pp in products"
                  :key="pp.productid"
                  :value="String(pp.productid)"
                >
                  {{ pp.product.name }} ({{ pp.product.code }})
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel for="qty">Shipped Quantity</FieldLabel>
            <Input
              id="qty"
              type="number"
              v-model="shipped_quantity"
              :min="1"
              :max="maxQuantity ?? undefined"
              required
              :disabled="submitting"
            />
            <p v-if="maxQuantity !== null" class="text-xs text-muted-foreground">
              Max: {{ maxQuantity }}
            </p>
          </Field>

          <Field>
            <FieldLabel for="price">Unit Price (₱)</FieldLabel>
            <Input
              id="price"
              type="number"
              v-model="unit_price"
              min="0"
              step="0.01"
              required
              :disabled="submitting"
            />
          </Field>

          <Field>
            <FieldLabel for="date">Delivery Date</FieldLabel>
            <Input
              id="date"
              type="date"
              v-model="delivery_date"
              required
              :disabled="submitting"
            />
          </Field>

          <Field>
            <FieldLabel for="terms">Payment Terms (days)</FieldLabel>
            <Input
              id="terms"
              type="number"
              v-model="payment_terms"
              min="0"
              required
              :disabled="submitting"
            />
          </Field>

          <Field>
            <div class="flex items-center gap-3">
              <Switch
                :checked="paid"
                @update:checked="paid = $event"
                :disabled="submitting"
              />
              <FieldLabel class="mb-0">Paid</FieldLabel>
            </div>
          </Field>

          <Field>
            <FieldLabel>Address</FieldLabel>
            <Select v-model="addressId" :disabled="submitting">
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
          </Field>

          <Field>
            <FieldLabel>Transaction Document</FieldLabel>
            <Select v-model="transactionDocumentId" :disabled="submitting">
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
          </Field>

          <Field>
            <FieldLabel>Delivery Requirement</FieldLabel>
            <Select v-model="deliveryRequirementId" :disabled="submitting">
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
          </Field>
        </FieldGroup>

        <div v-if="error" class="text-sm text-destructive">{{ error }}</div>

        <SheetFooter>
          <Button type="button" variant="outline" @click="emit('close')">Cancel</Button>
          <Button type="submit" :disabled="submitting || !productId || !addressId || !transactionDocumentId || !deliveryRequirementId">
            {{ submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Delivery') }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
