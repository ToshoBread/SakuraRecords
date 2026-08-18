<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProducts } from '@/composables/useProducts'
import { useFormValidation } from '@/composables/useFormValidation'
import { productSchema } from '@/lib/schemas'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'

const route = useRoute()
const router = useRouter()
const { products, loading, fetchAll, update } = useProducts()

const productId = Number(route.params.id)

const { errors, isSubmitting, serverError, defineField, handleServerSubmit } = useFormValidation(
  productSchema,
  { name: '', code: '', description: '', kg: 0 },
)

const [name, nameAttrs] = defineField('name')
const [code, codeAttrs] = defineField('code')
const [description, descriptionAttrs] = defineField('description')
const [kg, kgAttrs] = defineField('kg')

onMounted(async () => {
  await fetchAll()
  const found = products.value.find(p => p.id === productId)
  if (found) {
    name.value = found.name
    code.value = found.code
    description.value = found.description || ''
    kg.value = found.kg
  }
})

const onSubmit = handleServerSubmit(async (values) => {
  await update(productId, values.name, values.code, values.description, values.kg)
  toast.success('Product updated')
  router.push({ name: 'product-detail', params: { id: productId } })
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
        <CardTitle>Edit Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
          <FieldGroup>
            <Field :data-invalid="!!errors.name">
              <FieldLabel for="name">Name</FieldLabel>
              <Input id="name" v-model="name" v-bind="nameAttrs" required :disabled="isSubmitting" :aria-invalid="!!errors.name" />
              <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
            </Field>
            <Field :data-invalid="!!errors.code">
              <FieldLabel for="code">Code</FieldLabel>
              <Input id="code" v-model="code" v-bind="codeAttrs" required :disabled="isSubmitting" :aria-invalid="!!errors.code" />
              <p v-if="errors.code" class="text-sm text-destructive">{{ errors.code }}</p>
            </Field>
            <Field>
              <FieldLabel for="description">Description</FieldLabel>
              <Textarea id="description" v-model="description" v-bind="descriptionAttrs" :disabled="isSubmitting" />
            </Field>
            <Field :data-invalid="!!errors.kg">
              <FieldLabel for="kg">Kilograms per unit</FieldLabel>
              <Input id="kg" type="number" v-model="kg" v-bind="kgAttrs" min="0" step="0.01" :disabled="isSubmitting" :aria-invalid="!!errors.kg" />
              <p v-if="errors.kg" class="text-sm text-destructive">{{ errors.kg }}</p>
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
