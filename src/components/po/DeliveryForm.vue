<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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
  saved: []
}>()

const isEditing = computed(() => !!props.delivery)

const { errors, isSubmitting, serverError, defineField, handleServerSubmit } = useFormValidation(
  deliverySchema,
  {
    productId: props.delivery ? String(props.delivery.productid) : '',
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
const [delivery_date, delivery_dateAttrs] = defineField('delivery_date')
const [payment_terms, payment_termsAttrs] = defineField('payment_terms')
const [delivered] = defineField('delivered')
const [addressId] = defineField('addressId')
const [transactionDocumentId] = defineField('transactionDocumentId')
const [deliveryRequirementId] = defineField('deliveryRequirementId')

const addresses = ref<{ id: number; name: string }[]>([])
const transactionDocuments = ref<{ id: number; document: string }[]>([])
const deliveryRequirements = ref<{ id: number; requirement: string }[]>([])

const selectedProductRemaining = computed(() => {
  const pp = props.products.find(p => p.productid === Number(productId.value))
  if (!pp) return null
  if (isEditing.value && props.delivery && props.delivery.productid === Number(productId.value)) {
    return pp.remaining + Number(props.delivery.shipped_quantity)
  }
  return pp.remaining
})

const selectedProductPricePerKg = computed(() => {
  const pp = props.products.find(p => p.productid === Number(productId.value))
  return pp?.price_per_kg ?? 0
})

const maxQuantity = computed(() => selectedProductRemaining.value ?? 0)

const totalPrice = computed(() => Number(shipped_quantity.value) * selectedProductPricePerKg.value)

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

const onSubmit = handleServerSubmit(async (values) => {
  const payload = {
    poid: props.poId,
    productid: Number(values.productId),
    shipped_quantity: Number(values.shipped_quantity),
    unit_price: selectedProductPricePerKg.value,
    delivery_date: values.delivery_date,
    payment_terms: Number(values.payment_terms),
    delivered: values.delivered,
    addressid: Number(values.addressId),
    transactiondocumentid: Number(values.transactionDocumentId),
    deliveryrequirementid: Number(values.deliveryRequirementId),
  }

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
  emit('saved')
  emit('close')
})
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

      <form @submit.prevent="onSubmit" class="flex flex-col gap-4 px-6 py-4">
        <FieldGroup>
          <Field :data-invalid="!!errors.productId">
            <FieldLabel>Product</FieldLabel>
            <Select v-model="productId" :disabled="isSubmitting || isEditing">
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

          <div class="rounded-md border px-4 py-3 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Price/kg</span>
              <span>{{ formatCurrency(selectedProductPricePerKg) }}</span>
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
            <Select v-model="addressId" :disabled="isSubmitting">
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
