<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight, MoreHorizontal } from '@lucide/vue'

interface Props {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  pageSizeOptions?: number[]
}

interface Emits {
  (e: 'update:currentPage', page: number): void
  (e: 'update:pageSize', size: number): void
}

const props = withDefaults(defineProps<Props>(), {
  pageSizeOptions: () => [10, 20, 50, 100],
})
const emit = defineEmits<Emits>()

const pagesAround = 2

const shownPages = computed(() => {
  if (props.totalPages <= 1) return []
  const start = Math.max(2, props.currentPage - pagesAround)
  const end = Math.min(props.totalPages - 1, props.currentPage + pagesAround)
  const pages: (number | string)[] = [1]
  if (start > 2) pages.push('ellipsis')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < props.totalPages - 1) pages.push('ellipsis')
  if (props.totalPages > 1) pages.push(props.totalPages)
  return pages
})

function goToPage(page: number) {
  const clamped = Math.max(1, Math.min(props.totalPages, page))
  if (clamped !== props.currentPage) {
    emit('update:currentPage', clamped)
  }
}

function nextPage() {
  if (props.currentPage < props.totalPages) {
    emit('update:currentPage', props.currentPage + 1)
  }
}

function prevPage() {
  if (props.currentPage > 1) {
    emit('update:currentPage', props.currentPage - 1)
  }
}

function updatePageSize(value: string) {
  const size = parseInt(value, 10)
  emit('update:pageSize', size)
  emit('update:currentPage', 1)
}
</script>

<template>
  <div v-if="totalPages > 0" class="flex items-center justify-between px-2">
    <div class="flex items-center gap-2">
      <p class="text-sm text-muted-foreground">
        Items per page
      </p>
      <Select
        :model-value="String(pageSize)"
        @update:model-value="updatePageSize"
      >
        <SelectTrigger class="h-8 w-[70px]">
          <SelectValue :placeholder="String(pageSize)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="size in pageSizeOptions"
            :key="size"
            :value="String(size)"
          >
            {{ size }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div class="flex items-center gap-1">
      <p class="text-sm text-muted-foreground">
        {{ totalItems }} items
      </p>
      <div v-if="totalPages > 1" class="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          :disabled="currentPage === 1"
          @click="prevPage"
          aria-label="Previous page"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>

        <Button
          v-for="page in shownPages"
          :key="page"
          :variant="page === currentPage ? 'default' : 'ghost'"
          size="sm"
          :disabled="page === 'ellipsis'"
          @click="typeof page === 'number' ? goToPage(page) : undefined"
        >
          <MoreHorizontal v-if="page === 'ellipsis'" class="h-4 w-4" />
          <span v-else>{{ page }}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          :disabled="currentPage === totalPages"
          @click="nextPage"
          aria-label="Next page"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
