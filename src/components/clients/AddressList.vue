<script setup lang="ts">
import { useAddresses } from '@/composables/useAddresses'
import { useAuth } from '@/composables/useAuth'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  addresses: { id: number; clientid: number; name: string; address: string }[]
}>()

const emit = defineEmits<{
  edit: [address: { id: number; name: string; address: string }]
  deleted: []
}>()

const { softDelete } = useAddresses()
const { isAdmin } = useAuth()

async function handleDelete(id: number) {
  if (!confirm('Delete this address?')) return
  try {
    await softDelete(id)
    toast.success('Address deleted')
    emit('deleted')
  } catch (e: any) {
    toast.error(e.message)
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div
      v-for="addr in addresses"
      :key="addr.id"
      class="flex items-start justify-between rounded-md border p-3"
    >
      <div class="flex flex-col gap-1">
        <span class="text-sm font-medium">{{ addr.name }}</span>
        <span class="text-sm text-muted-foreground">{{ addr.address }}</span>
      </div>
      <div class="flex gap-1">
        <Button variant="ghost" size="sm" @click="emit('edit', addr)">
          <Pencil data-icon="inline-start" />
          Edit
        </Button>
        <Button v-if="isAdmin" variant="ghost" size="sm" @click="handleDelete(addr.id)">
          <Trash2 data-icon="inline-start" />
          Delete
        </Button>
      </div>
    </div>
  </div>
</template>
