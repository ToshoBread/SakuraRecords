<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClients } from '@/composables/useClients'
import { useFormValidation } from '@/composables/useFormValidation'
import { clientSchema } from '@/lib/schemas'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

const route = useRoute()
const router = useRouter()
const { clients, loading, fetchAll, update } = useClients()

const clientId = computed(() => Number(route.params.id))

const { errors, isSubmitting, serverError, defineField, handleServerSubmit } = useFormValidation(
  clientSchema,
  { name: '' },
)

const [name, nameAttrs] = defineField('name')

onMounted(async () => {
  await fetchAll()
  const found = clients.value.find(c => c.id === clientId.value)
  if (found) name.value = found.name
})

const onSubmit = handleServerSubmit(async (values) => {
  await update(clientId.value, values.name)
  toast.success('Client updated')
  router.push({ name: 'client-detail', params: { id: clientId.value } })
})
</script>

<template>
  <div class="mx-auto max-w-lg">
    <div v-if="loading" class="flex flex-col gap-4">
      <Skeleton class="h-8 w-48" />
      <Skeleton class="h-64 w-full" />
    </div>

    <Card v-else>
      <CardHeader>
        <CardTitle>Edit Client</CardTitle>
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
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </Button>
            <Button variant="outline" type="button" @click="router.back()">Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
