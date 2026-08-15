<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useClients } from '@/composables/useClients'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const router = useRouter()
const { create } = useClients()

const name = ref('')
const submitting = ref(false)
const error = ref('')

async function handleSubmit() {
  submitting.value = true
  error.value = ''
  try {
    const client = await create(name.value)
    toast.success('Client created')
    router.push({ name: 'client-detail', params: { id: client.id } })
  } catch (e: any) {
    toast.error(e.message)
    error.value = e.message
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
            <Field>
              <FieldLabel for="name">Name</FieldLabel>
              <Input id="name" v-model="name" required :disabled="submitting" />
            </Field>
          </FieldGroup>
          <div v-if="error" class="text-sm text-destructive">{{ error }}</div>
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
