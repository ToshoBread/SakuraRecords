import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export interface DateRange {
  start: Date
  end: Date
}

export interface MonthInfo {
  label: string
  timestamp: number
}

export interface QuantityByProductRow {
  productName: string
  productCode: string
  months: Record<string, number>
  total: number
}

export interface SalesByClientRow {
  clientName: string
  months: Record<string, number>
  total: number
}

export interface SalesByProductRow {
  productName: string
  productCode: string
  months: Record<string, number>
  total: number
}

function getMonthLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short' })
}

function getMonthsInRange(start: Date, end: Date): MonthInfo[] {
  const months: MonthInfo[] = []
  const current = new Date(start.getFullYear(), start.getMonth(), 1)
  const endDate = new Date(end.getFullYear(), end.getMonth(), 1)
  const seen = new Set<string>()

  while (current <= endDate) {
    const label = current.toLocaleDateString('en-US', { month: 'short' })
    if (!seen.has(label)) {
      seen.add(label)
      months.push({
        label,
        timestamp: current.getTime(),
      })
    }
    current.setMonth(current.getMonth() + 1)
  }
  return months
}

export function useReports() {
  const quantityByProduct = ref<QuantityByProductRow[]>([])
  const salesByClient = ref<SalesByClientRow[]>([])
  const salesByProduct = ref<SalesByProductRow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const months = ref<MonthInfo[]>([])

  async function fetchQuantityByProduct(range: DateRange) {
    const { data, error: err } = await supabase
      .from('delivery')
      .select(`
        shipped_quantity,
        delivery_date,
        product:productid (name, code)
      `)
      .is('deleted_at', null)
      .eq('delivered', true)
      .gte('delivery_date', range.start.toISOString().slice(0, 10))
      .lte('delivery_date', range.end.toISOString().slice(0, 10))

    if (err) throw err

    const grouped = new Map<string, { name: string; code: string; months: Record<string, number> }>()

    for (const row of data ?? []) {
      const product = row.product as { name: string; code: string } | null
      if (!product) continue

      const key = product.code
      if (!grouped.has(key)) {
        grouped.set(key, { name: product.name, code: product.code, months: {} })
      }

      const entry = grouped.get(key)!
      const monthLabel = getMonthLabel(row.delivery_date)
      entry.months[monthLabel] = (entry.months[monthLabel] ?? 0) + Number(row.shipped_quantity)
    }

    quantityByProduct.value = Array.from(grouped.values()).map(row => ({
      productName: row.name,
      productCode: row.code,
      months: row.months,
      total: Object.values(row.months).reduce((s, v) => s + v, 0),
    }))
  }

  async function fetchSalesByClient(range: DateRange) {
    const { data, error: err } = await supabase
      .from('delivery')
      .select(`
        shipped_quantity,
        unit_price,
        delivery_date,
        purchase_order:poid (clientid, client:clientid (name))
      `)
      .is('deleted_at', null)
      .eq('delivered', true)
      .gte('delivery_date', range.start.toISOString().slice(0, 10))
      .lte('delivery_date', range.end.toISOString().slice(0, 10))

    if (err) throw err

    const grouped = new Map<string, { name: string; months: Record<string, number> }>()

    for (const row of data ?? []) {
      const po = row.purchase_order as { client: { name: string } } | null
      if (!po?.client) continue

      const clientName = po.client.name
      if (!grouped.has(clientName)) {
        grouped.set(clientName, { name: clientName, months: {} })
      }

      const entry = grouped.get(clientName)!
      const monthLabel = getMonthLabel(row.delivery_date)
      const sales = Number(row.shipped_quantity) * Number(row.unit_price)
      entry.months[monthLabel] = (entry.months[monthLabel] ?? 0) + sales
    }

    salesByClient.value = Array.from(grouped.values()).map(row => ({
      clientName: row.name,
      months: row.months,
      total: Object.values(row.months).reduce((s, v) => s + v, 0),
    }))
  }

  async function fetchSalesByProduct(range: DateRange) {
    const { data, error: err } = await supabase
      .from('delivery')
      .select(`
        shipped_quantity,
        unit_price,
        delivery_date,
        product:productid (name, code)
      `)
      .is('deleted_at', null)
      .eq('delivered', true)
      .gte('delivery_date', range.start.toISOString().slice(0, 10))
      .lte('delivery_date', range.end.toISOString().slice(0, 10))

    if (err) throw err

    const grouped = new Map<string, { name: string; code: string; months: Record<string, number> }>()

    for (const row of data ?? []) {
      const product = row.product as { name: string; code: string } | null
      if (!product) continue

      const key = product.code
      if (!grouped.has(key)) {
        grouped.set(key, { name: product.name, code: product.code, months: {} })
      }

      const entry = grouped.get(key)!
      const monthLabel = getMonthLabel(row.delivery_date)
      const sales = Number(row.shipped_quantity) * Number(row.unit_price)
      entry.months[monthLabel] = (entry.months[monthLabel] ?? 0) + sales
    }

    salesByProduct.value = Array.from(grouped.values()).map(row => ({
      productName: row.name,
      productCode: row.code,
      months: row.months,
      total: Object.values(row.months).reduce((s, v) => s + v, 0),
    }))
  }

  async function fetchAll(range: DateRange) {
    loading.value = true
    error.value = null
    months.value = getMonthsInRange(range.start, range.end)

    try {
      await Promise.all([
        fetchQuantityByProduct(range),
        fetchSalesByClient(range),
        fetchSalesByProduct(range),
      ])
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return {
    quantityByProduct,
    salesByClient,
    salesByProduct,
    loading,
    error,
    months,
    fetchAll,
  }
}
