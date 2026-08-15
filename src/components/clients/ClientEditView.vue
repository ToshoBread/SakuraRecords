<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClients } from '@/composables/useClients'
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

const clientId = Number(route.params.id)
const name = ref('')
const submitting = ref(false)
const fieldErrors = ref<Record<string, string>>({})
const serverError = ref('')

onMounted(async () => {
  await fetchAll()
  const found = clients.value.find(c => c.id === clientId)
  if (found) name.value = found.name
})

async function handleSubmit() {
  const result = clientSchema.safeParse({ name: name.value })
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
    await update(clientId, result.data.name)
    toast.success('Client updated')
    router.push({ name: 'client-detail', params: { id: clientId } })
  } catch (e: any) {
    toast.error(e.message)
    serverError.value = e.message
  } finally {
    submitting.value = false
  }
}
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
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
          <FieldGroup>
            <Field :data-invalid="!!fieldErrors.name">
              <FieldLabel for="name">Name</FieldLabel>
              <Input id="name" v-model="name" required :disabled="submitting" aria-invalid="true" />
              <p v-if="fieldErrors.name" class="text-sm text-destructive">{{ fieldErrors.name }}</p>
            </Field>
          </FieldGroup>
          <div v-if="serverError" class="text-sm text-destructive">{{ serverError }}</div>
          <div class="flex gap-2">
            <Button type="submit" :disabled="submitting">
              {{ submitting ? 'Saving...' : 'Save Changes' }}
            </Button>
            <Button variant="outline" type="button" @click="router.back()">Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
