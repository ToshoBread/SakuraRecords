<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useProducts } from '@/composables/useProducts'
import { useFormValidation } from '@/composables/useFormValidation'
import { productSchema } from '@/lib/schemas'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const router = useRouter()
const { create } = useProducts()

const { errors, isSubmitting, serverError, defineField, handleServerSubmit } = useFormValidation(
  productSchema,
  { name: '', code: '', description: '', kg: 0 },
)

const [name, nameAttrs] = defineField('name')
const [code, codeAttrs] = defineField('code')
const [description, descriptionAttrs] = defineField('description')
const [kg, kgAttrs] = defineField('kg')

const onSubmit = handleServerSubmit(async (values) => {
  const product = await create(values.name, values.code, values.description, values.kg)
  toast.success('Product created')
  router.push({ name: 'product-detail', params: { id: product.id } })
})
</script>

<template>
  <div class="mx-auto max-w-lg">
    <Card>
      <CardHeader>
        <CardTitle>New Product</CardTitle>
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
              {{ isSubmitting ? 'Creating...' : 'Create Product' }}
            </Button>
            <Button variant="outline" type="button" @click="router.back()">Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
