<script setup lang="ts">
import { onMounted } from 'vue'
import { usePurchaseOrders } from '@/composables/usePurchaseOrders'
import StatCard from './StatCard.vue'
import RecentPOList from './RecentPOList.vue'

const { purchaseOrderList, stats, loading, fetchRecent, fetchStats, formatCurrency } = usePurchaseOrders()

onMounted(async () => {
  await Promise.all([fetchRecent(), fetchStats()])
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <h1 class="text-2xl font-bold">Dashboard</h1>

    <!-- Monthly stats -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard title="Open POs" :value="stats.openPurchaseOrders" />
      <StatCard title="Deliveries This Month" :value="stats.deliveriesThisMonth" />
      <StatCard title="Gross Sales This Month" :value="formatCurrency(stats.grossSalesThisMonth)" />
      <StatCard title="Overdue Deliveries" :value="stats.overdueDeliveries" />
    </div>

    <!-- Quarterly stats -->
    <div class="grid grid-cols-2 gap-4">
      <StatCard title="Deliveries This Quarter" :value="stats.deliveriesThisQuarter" />
      <StatCard title="Gross Sales This Quarter" :value="formatCurrency(stats.grossSalesThisQuarter)" />
    </div>

    <!-- Recent POs -->
    <RecentPOList :pos="purchaseOrderList" :loading="loading" />
  </div>
</template>
