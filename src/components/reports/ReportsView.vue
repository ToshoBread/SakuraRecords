<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useReports, type DateRange } from '@/composables/useReports'
import DateRangePicker from './DateRangePicker.vue'
import QuantityReport from './QuantityReport.vue'
import ClientSalesReport from './ClientSalesReport.vue'
import ProductSalesReport from './ProductSalesReport.vue'

function getCurrentQuarter(): DateRange {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()

  let startMonth: number
  let startYear: number

  if (month >= 11 || month <= 1) {
    startMonth = 11
    startYear = month >= 11 ? year : year - 1
  } else if (month >= 2 && month <= 4) {
    startMonth = 2
    startYear = year
  } else if (month >= 5 && month <= 7) {
    startMonth = 5
    startYear = year
  } else {
    startMonth = 8
    startYear = year
  }

  const start = new Date(startYear, startMonth, 1)
  const end = new Date(start.getFullYear(), start.getMonth() + 3, 0)
  return { start, end }
}

const dateRange = ref<DateRange>(getCurrentQuarter())
const { quantityByProduct, salesByClient, salesByProduct, loading, error, months, fetchAll } = useReports()

async function load() {
  await fetchAll(dateRange.value)
}

onMounted(load)
watch(dateRange, load, { deep: true })
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold">Reports</h1>
      <DateRangePicker v-model="dateRange" />
    </div>

    <div v-if="error" class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
      {{ error }}
    </div>

    <QuantityReport :data="quantityByProduct" :months="months" :loading="loading" />
    <ClientSalesReport :data="salesByClient" :months="months" :loading="loading" />
    <ProductSalesReport :data="salesByProduct" :months="months" :loading="loading" />
  </div>
</template>
