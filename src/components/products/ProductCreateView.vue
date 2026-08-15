<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProducts } from '@/composables/useProducts'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const router = useRouter()
const { create, checkCodeUnique } = useProducts()

const name = ref('')
const code = ref('')
const description = ref('')
const submitting = ref(false)
const error = ref('')
const codeError = ref('')

async function handleCodeBlur() {
  if (!code.value.trim()) return
  const unique = await checkCodeUnique(code.value.trim())
  codeError.value = unique ? '' : 'This code is already taken'
}

async function handleSubmit() {
  if (codeError.value) return
  submitting.value = true
  error.value = ''
  try {
    const product = await create(name.value, code.value.trim(), description.value || undefined)
    toast.success('Product created')
    router.push({ name: 'product-detail', params: { id: product.id } })
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
        <CardTitle>New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel for="name">Name</FieldLabel>
              <Input id="name" v-model="name" required :disabled="submitting" />
            </Field>
            <Field>
              <FieldLabel for="code">Code</FieldLabel>
              <Input id="code" v-model="code" required :disabled="submitting" @blur="handleCodeBlur" />
              <p v-if="codeError" class="text-sm text-destructive">{{ codeError }}</p>
            </Field>
            <Field>
              <FieldLabel for="description">Description</FieldLabel>
              <Textarea id="description" v-model="description" :disabled="submitting" />
            </Field>
          </FieldGroup>
          <div v-if="error" class="text-sm text-destructive">{{ error }}</div>
          <div class="flex gap-2">
            <Button type="submit" :disabled="submitting || !!codeError">
              {{ submitting ? 'Creating...' : 'Create Product' }}
            </Button>
            <Button variant="outline" type="button" @click="router.back()">Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
