import { ref } from 'vue'
import { useForm as useVeeForm } from 'vee-validate'
import { toFormValidator } from '@vee-validate/zod'
import type { ZodSchema } from 'zod'

export function useFormValidation(
  schema: ZodSchema,
  initialValues: Record<string, any> = {},
) {
  const serverError = ref('')

  const { handleSubmit, errors, isSubmitting, setFieldError, setErrors, resetForm, defineField } = useVeeForm({
    validationSchema: toFormValidator(schema),
    initialValues,
  })

  function handleServerSubmit(
    fn: (values: Record<string, any>) => Promise<void>,
  ) {
    return handleSubmit(async (values) => {
      serverError.value = ''
      try {
        await fn(values)
      } catch (e: any) {
        serverError.value = e.message
      }
    })
  }

  return {
    errors,
    isSubmitting,
    serverError,
    defineField,
    handleServerSubmit,
    setFieldError,
    setErrors,
    resetForm,
  }
}
