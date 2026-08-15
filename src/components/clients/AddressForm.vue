<script setup lang="ts">
import { ref } from 'vue'
import { useAddresses } from '@/composables/useAddresses'
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
}>()

const { create, update } = useAddresses()

const name = ref(props.address?.name ?? '')
const addressText = ref(props.address?.address ?? '')
const submitting = ref(false)
const error = ref('')

const isEditing = !!props.address

async function handleSubmit() {
  submitting.value = true
  error.value = ''
  try {
    if (isEditing && props.address) {
      await update(props.address.id, name.value, addressText.value)
      toast.success('Address updated')
    } else {
      await create(props.clientId, name.value, addressText.value)
      toast.success('Address added')
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
    <SheetContent side="right" class="w-full sm:max-w-md">
      <SheetHeader>
        <SheetTitle>{{ isEditing ? 'Edit Address' : 'New Address' }}</SheetTitle>
        <SheetDescription>
          {{ isEditing ? 'Update the address details.' : 'Add a delivery address for this client.' }}
        </SheetDescription>
      </SheetHeader>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4 px-6">
        <FieldGroup>
          <Field>
            <FieldLabel for="addr-name">Label</FieldLabel>
            <Input id="addr-name" v-model="name" placeholder="e.g. Main Warehouse" required :disabled="submitting" />
          </Field>
          <Field>
            <FieldLabel for="addr-address">Address</FieldLabel>
            <Input id="addr-address" v-model="addressText" placeholder="Full address" required :disabled="submitting" />
          </Field>
        </FieldGroup>

        <div v-if="error" class="text-sm text-destructive">{{ error }}</div>

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
