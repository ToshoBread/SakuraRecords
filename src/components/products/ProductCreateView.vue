<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProducts } from '@/composables/useProducts'
import { productSchema } from '@/lib/schemas'
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
const kg = ref(0)
const submitting = ref(false)
const fieldErrors = ref<Record<string, string>>({})
const serverError = ref('')
const codeError = ref('')

async function handleCodeBlur() {
  if (!code.value.trim()) return
  const unique = await checkCodeUnique(code.value.trim())
  codeError.value = unique ? '' : 'This code is already taken'
}

async function handleSubmit() {
  const result = productSchema.safeParse({
    name: name.value,
    code: code.value.trim(),
    description: description.value || undefined,
    kg: kg.value,
  })
  if (!result.success) {
    fieldErrors.value = Object.fromEntries(
      result.error.issues.map(i => [i.path[0] as string, i.message])
    )
    return
  }
  if (codeError.value) return
  fieldErrors.value = {}
  submitting.value = true
  serverError.value = ''
  try {
    const product = await create(result.data.name, result.data.code, result.data.description, result.data.kg)
    toast.success('Product created')
    router.push({ name: 'product-detail', params: { id: product.id } })
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
        <CardTitle>New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
          <FieldGroup>
            <Field :data-invalid="!!fieldErrors.name">
              <FieldLabel for="name">Name</FieldLabel>
              <Input id="name" v-model="name" required :disabled="submitting" aria-invalid="true" />
              <p v-if="fieldErrors.name" class="text-sm text-destructive">{{ fieldErrors.name }}</p>
            </Field>
            <Field :data-invalid="!!fieldErrors.code || !!codeError">
              <FieldLabel for="code">Code</FieldLabel>
              <Input id="code" v-model="code" required :disabled="submitting" @blur="handleCodeBlur" aria-invalid="true" />
              <p v-if="fieldErrors.code" class="text-sm text-destructive">{{ fieldErrors.code }}</p>
              <p v-else-if="codeError" class="text-sm text-destructive">{{ codeError }}</p>
            </Field>
            <Field>
              <FieldLabel for="description">Description</FieldLabel>
              <Textarea id="description" v-model="description" :disabled="submitting" />
            </Field>
            <Field :data-invalid="!!fieldErrors.kg">
              <FieldLabel for="kg">Kilograms per unit</FieldLabel>
              <Input id="kg" type="number" v-model.number="kg" min="0" step="0.01" :disabled="submitting" aria-invalid="true" />
              <p v-if="fieldErrors.kg" class="text-sm text-destructive">{{ fieldErrors.kg }}</p>
            </Field>
          </FieldGroup>
          <div v-if="serverError" class="text-sm text-destructive">{{ serverError }}</div>
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
