<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useClients } from '@/composables/useClients'
import { clientSchema } from '@/lib/schemas'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const router = useRouter()
const { create } = useClients()

const name = ref('')
const submitting = ref(false)
const fieldErrors = ref<Record<string, string>>({})
const serverError = ref('')

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
    const client = await create(result.data.name)
    toast.success('Client created')
    router.push({ name: 'client-detail', params: { id: client.id } })
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
    <Card>
      <CardHeader>
        <CardTitle>New Client</CardTitle>
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
              {{ submitting ? 'Creating...' : 'Create Client' }}
            </Button>
            <Button variant="outline" type="button" @click="router.back()">Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
