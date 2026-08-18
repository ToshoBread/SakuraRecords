<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useFormValidation } from '@/composables/useFormValidation'
import { loginSchema } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Eye, EyeOff } from '@lucide/vue'

const router = useRouter()
const { login } = useAuth()
const showPassword = ref(false)

const { errors, isSubmitting, serverError, defineField, handleServerSubmit } = useFormValidation(
  loginSchema,
  { email: '', password: '' },
)

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleServerSubmit(async (values) => {
  await login(values.email, values.password)
  router.push({ name: 'dashboard' })
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background p-4">
    <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <CardTitle class="text-2xl">SakuraRecords</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
          <FieldGroup>
            <Field :data-invalid="!!errors.email">
              <FieldLabel for="email">Email</FieldLabel>
              <Input
                id="email"
                v-model="email"
                v-bind="emailAttrs"
                type="email"
                placeholder="you@example.com"
                required
                :disabled="isSubmitting"
                :aria-invalid="!!errors.email"
              />
              <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
            </Field>
            <Field :data-invalid="!!errors.password">
              <FieldLabel for="password">Password</FieldLabel>
              <div class="relative">
                <Input
                  id="password"
                  v-model="password"
                  v-bind="passwordAttrs"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  :disabled="isSubmitting"
                  :aria-invalid="!!errors.password"
                  class="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  class="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" class="size-4" />
                  <Eye v-else class="size-4" />
                </Button>
              </div>
              <p v-if="errors.password" class="text-sm text-destructive">{{ errors.password }}</p>
            </Field>
          </FieldGroup>
          <div v-if="serverError" class="text-sm text-destructive">{{ serverError }}</div>
          <Button type="submit" :disabled="isSubmitting" class="w-full">
            {{ isSubmitting ? 'Signing in...' : 'Sign In' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
