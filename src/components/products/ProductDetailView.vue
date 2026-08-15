<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProducts } from '@/composables/useProducts'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Pencil, Trash2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { products, loading, error, fetchAll, softDelete } = useProducts()

const productId = Number(route.params.id)

onMounted(() => fetchAll())

const product = computed(() => products.value.find(p => p.id === productId))

async function handleDelete() {
  if (!confirm('Delete this product?')) return
  await softDelete(productId)
  toast.success('Product deleted')
  router.push({ name: 'product-list' })
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div v-if="loading" class="flex flex-col gap-4">
      <Skeleton class="h-8 w-48" />
      <Skeleton class="h-64 w-full" />
    </div>

    <div v-else-if="error" class="text-destructive">{{ error }}</div>

    <template v-else-if="product">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ product.name }}</h1>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" as-child>
            <RouterLink :to="{ name: 'product-edit', params: { id: product.id } }">
              <Pencil data-icon="inline-start" />
              Edit
            </RouterLink>
          </Button>
          <Button variant="destructive" size="sm" @click="handleDelete">
            <Trash2 data-icon="inline-start" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-2 text-sm">
          <div class="flex justify-between">
            <span class="text-muted-foreground">Code</span>
            <span class="font-mono">{{ product.code }}</span>
          </div>
          <div v-if="product.description" class="flex justify-between">
            <span class="text-muted-foreground">Description</span>
            <span class="max-w-[300px] text-right">{{ product.description }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Created</span>
            <span>{{ formatDate(product.created_at) }}</span>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
