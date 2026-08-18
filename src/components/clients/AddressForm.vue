<script setup lang="ts">
import { useAddresses } from '@/composables/useAddresses'
import { useFormValidation } from '@/composables/useFormValidation'
import { addressSchema } from '@/lib/schemas'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'

const props = defineProps<{
  clientId: number
  address?: { id: number; name: string; address: string } | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { create, update } = useAddresses()
const isEditing = !!props.address

const { errors, isSubmitting, serverError, defineField, handleServerSubmit } = useFormValidation(
  addressSchema,
  { name: props.address?.name ?? '', address: props.address?.address ?? '' },
)

const [name, nameAttrs] = defineField('name')
const [addressText, addressAttrs] = defineField('address')

const onSubmit = handleServerSubmit(async (values) => {
  if (isEditing && props.address) {
    await update(props.address.id, values.name, values.address)
    toast.success('Address updated')
  } else {
    await create(props.clientId, values.name, values.address)
    toast.success('Address added')
  }
  emit('saved')
  emit('close')
})
</script>

<template>
  <Sheet :open="true" @update:open="(v) => !v && emit('close')">
    <SheetContent side="right" class="w-full sm:max-w-md">
      <SheetHeader>
        <SheetTitle>{{ isEditing ? 'Edit Address' : 'New Address' }}</SheetTitle>
        <SheetDescription>
          {{ isEditing ? 'Update the address details.' : 'Add a delivery address for this client.' }}
        </SheetDescription>
      </SheetHeader>

      <form @submit.prevent="onSubmit" class="flex flex-col gap-4 px-6">
        <FieldGroup>
          <Field :data-invalid="!!errors.name">
            <FieldLabel for="addr-name">Label</FieldLabel>
            <Input id="addr-name" v-model="name" v-bind="nameAttrs" placeholder="e.g. Main Warehouse" required :disabled="isSubmitting" :aria-invalid="!!errors.name" />
            <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
          </Field>
          <Field :data-invalid="!!errors.address">
            <FieldLabel for="addr-address">Address</FieldLabel>
            <Input id="addr-address" v-model="addressText" v-bind="addressAttrs" placeholder="Full address" required :disabled="isSubmitting" :aria-invalid="!!errors.address" />
            <p v-if="errors.address" class="text-sm text-destructive">{{ errors.address }}</p>
          </Field>
        </FieldGroup>

        <div v-if="serverError" class="text-sm text-destructive">{{ serverError }}</div>

        <SheetFooter>
          <Button type="button" variant="outline" @click="emit('close')">Cancel</Button>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Address') }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
