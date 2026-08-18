<script setup lang="ts">
import { computed } from 'vue'
import type { SalesByClientRow, MonthInfo } from '@/composables/useReports'
import { VisLine, VisXYContainer, VisAxis } from '@unovis/vue'
import { ChartCrosshair, ChartLegend } from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Download } from '@lucide/vue'
import { downloadCSV } from '@/lib/csv'
import { formatCurrency } from '@/lib/format'

const props = defineProps<{
  data: SalesByClientRow[]
  months: MonthInfo[]
  loading: boolean
}>()

const topClients = computed(() => props.data.slice(0, 5))

const chartData = computed(() =>
  props.months.map(m => {
    const obj: Record<string, string | number> = { monthLabel: m.label }
    for (const row of topClients.value) {
      obj[row.clientName] = row.months[m.label] ?? 0
    }
    return obj
  })
)

const colors = computed(() =>
  topClients.value.map((_, i) => `var(--chart-${(i % 5) + 1})`)
)

const yAccessors = computed(() =>
  topClients.value.map(row => (d: (typeof chartData.value)[number]) => d[row.clientName] as number)
)

const legendItems = computed(() =>
  topClients.value.map((row, i) => ({
    name: row.clientName,
    color: colors.value[i],
  }))
)

function exportCSV() {
  const headers = ['Client', ...props.months.map(m => m.label), 'Total']
  const rows = props.data.map(row => [
    row.clientName,
    ...props.months.map(m => row.months[m.label] ?? 0),
    row.total,
  ])
  downloadCSV('client-sales.csv', headers, rows)
}
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between">
      <CardTitle>Client Gross Sales Per Month</CardTitle>
      <Button variant="outline" size="sm" @click="exportCSV">
        <Download data-icon="inline-start" />
        Download CSV
      </Button>
    </CardHeader>
    <CardContent class="flex flex-col gap-4">
      <template v-if="loading">
        <Skeleton class="h-[300px] w-full" />
        <Skeleton class="h-[200px] w-full" />
      </template>
      <template v-else>
        <div class="min-h-[300px] w-full">
          <VisXYContainer :data="chartData">
            <VisLine
              :x="(_d: unknown, i: number) => i"
              :y="yAccessors"
              :color="colors"
              :line-width="2"
            />
            <VisAxis
              type="x"
              :tick-format="(_d: number, i: number) => months[i]?.label ?? ''"
              :tick-line="false"
              :domain-line="false"
              :grid-line="false"
            />
            <VisAxis
              type="y"
              :tick-format="(d: number) => formatCurrency(d)"
              :tick-line="false"
              :domain-line="false"
              :grid-line="true"
            />
            <ChartCrosshair
              :colors="colors"
              index="monthLabel"
              :items="legendItems"
            />
          </VisXYContainer>
        </div>
        <ChartLegend :items="legendItems" />

        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead v-for="m in months" :key="m.label" class="text-right">{{ m.label }}</TableHead>
                <TableHead class="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="row in data" :key="row.clientName">
                <TableCell class="font-medium">{{ row.clientName }}</TableCell>
                <TableCell v-for="m in months" :key="m.label" class="text-right">{{ formatCurrency(row.months[m.label] ?? 0) }}</TableCell>
                <TableCell class="text-right font-medium">{{ formatCurrency(row.total) }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </template>
    </CardContent>
  </Card>
</template>
