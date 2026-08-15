<script setup lang="ts">
import { onMounted } from 'vue'
import { usePOs } from '@/composables/usePOs'
import StatCard from './StatCard.vue'
import RecentPOList from './RecentPOList.vue'

const { poList, stats, loading, fetchRecent, fetchStats, formatCurrency } = usePOs()

onMounted(async () => {
  await Promise.all([fetchRecent(), fetchStats()])
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <h1 class="text-2xl font-bold">Dashboard</h1>

    <!-- Monthly stats -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard title="Open POs" :value="stats.openPOs" />
      <StatCard title="Deliveries This Month" :value="stats.deliveriesThisMonth" />
      <StatCard title="Gross Sales This Month" :value="formatCurrency(stats.grossSalesThisMonth)" />
      <StatCard title="Overdue Payments" :value="stats.overduePayments" />
    </div>

    <!-- Quarterly stats -->
    <div class="grid grid-cols-2 gap-4">
      <StatCard title="Deliveries This Quarter" :value="stats.deliveriesThisQuarter" />
      <StatCard title="Gross Sales This Quarter" :value="formatCurrency(stats.grossSalesThisQuarter)" />
    </div>

    <!-- Recent POs -->
    <RecentPOList :pos="poList" :loading="loading" />
  </div>
</template>
