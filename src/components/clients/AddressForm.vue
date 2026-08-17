<script setup lang="ts">
import { ref } from 'vue'
import { useAddresses } from '@/composables/useAddresses'
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

const name = ref(props.address?.name ?? '')
const addressText = ref(props.address?.address ?? '')
const submitting = ref(false)
const fieldErrors = ref<Record<string, string>>({})
const serverError = ref('')

const isEditing = !!props.address

async function handleSubmit() {
  const result = addressSchema.safeParse({ name: name.value, address: addressText.value })
  if (!result.success) {
    fieldErrors.value = Object.fromEntries(
      result.error.issues.map(i => [i.path[0] as string, i.message])
    )
    return
  }
  fieldErrors.value = {}
  submitting.value = true
  serverError.value = ''
  try {
    if (isEditing && props.address) {
      await update(props.address.id, result.data.name, result.data.address)
      toast.success('Address updated')
    } else {
      await create(props.clientId, result.data.name, result.data.address)
      toast.success('Address added')
    }
    emit('saved')
    emit('close')
  } catch (e: any) {
    toast.error(e.message)
    serverError.value = e.message
  } finally {
    submitting.value = false
  }
}
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

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4 px-6">
        <FieldGroup>
          <Field :data-invalid="!!fieldErrors.name">
            <FieldLabel for="addr-name">Label</FieldLabel>
            <Input id="addr-name" v-model="name" placeholder="e.g. Main Warehouse" required :disabled="submitting" aria-invalid="true" />
            <p v-if="fieldErrors.name" class="text-sm text-destructive">{{ fieldErrors.name }}</p>
          </Field>
          <Field :data-invalid="!!fieldErrors.address">
            <FieldLabel for="addr-address">Address</FieldLabel>
            <Input id="addr-address" v-model="addressText" placeholder="Full address" required :disabled="submitting" aria-invalid="true" />
            <p v-if="fieldErrors.address" class="text-sm text-destructive">{{ fieldErrors.address }}</p>
          </Field>
        </FieldGroup>

        <div v-if="serverError" class="text-sm text-destructive">{{ serverError }}</div>

        <SheetFooter>
          <Button type="button" variant="outline" @click="emit('close')">Cancel</Button>
          <Button type="submit" :disabled="submitting">
            {{ submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Address') }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
