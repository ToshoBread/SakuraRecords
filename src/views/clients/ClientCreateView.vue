<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useClients } from '@/composables/useClients'
import { useFormValidation } from '@/composables/useFormValidation'
import { clientSchema } from '@/lib/schemas'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const router = useRouter()
const { create } = useClients()

const { errors, isSubmitting, serverError, defineField, handleServerSubmit } = useFormValidation(
  clientSchema,
  { name: '' },
)

const [name, nameAttrs] = defineField('name')

const onSubmit = handleServerSubmit(async (values) => {
  const client = await create(values.name)
  toast.success('Client created')
  router.push({ name: 'client-detail', params: { id: client.id } })
})
</script>

<template>
  <div class="mx-auto max-w-lg">
    <Card>
      <CardHeader>
        <CardTitle>New Client</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
          <FieldGroup>
            <Field :data-invalid="!!errors.name">
              <FieldLabel for="name">Name</FieldLabel>
              <Input id="name" v-model="name" v-bind="nameAttrs" required :disabled="isSubmitting" :aria-invalid="!!errors.name" />
              <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
            </Field>
          </FieldGroup>
          <div v-if="serverError" class="text-sm text-destructive">{{ serverError }}</div>
          <div class="flex gap-2">
            <Button type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Creating...' : 'Create Client' }}
            </Button>
            <Button variant="outline" type="button" @click="router.back()">Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
