import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export interface PO {
  id: string
  clientId: number
  notes: string | null
  created_at: string
  client?: { name: string }
  deliveries?: { count: number }[]
  po_products?: { count: number }[]
}

export interface DashboardStats {
  openPOs: number
  deliveriesThisMonth: number
  grossSalesThisMonth: number
  overduePayments: number
  deliveriesThisQuarter: number
  grossSalesThisQuarter: number
}

export function usePOs() {
  const poList = ref<PO[]>([])
  const stats = ref<DashboardStats>({
    openPOs: 0,
    deliveriesThisMonth: 0,
    grossSalesThisMonth: 0,
    overduePayments: 0,
    deliveriesThisQuarter: 0,
    grossSalesThisQuarter: 0,
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchRecent(limit = 10) {
    loading.value = true
    const { data, error: fetchErr } = await supabase
      .from('purchase_order')
      .select(`
        id, clientId, notes, created_at,
        client:clientId (name),
        deliveries:delivery (count),
        po_products:po_product (count)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (fetchErr) {
      error.value = fetchErr.message
    } else {
      poList.value = data as PO[]
    }
    loading.value = false
  }

  async function fetchStats() {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const quarterStart = getQuarterStart(now).toISOString()
    const today = now.toISOString()

    const { count: openPOs } = await supabase
      .rpc('count_open_pos')

    const { count: deliveriesThisMonth } = await supabase
      .from('delivery')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .gte('delivery_date', monthStart.slice(0, 10))

    const { data: monthSales } = await supabase
      .from('delivery')
      .select('shipped_quantity, unit_price')
      .is('deleted_at', null)
      .gte('delivery_date', monthStart.slice(0, 10)) as { data: { shipped_quantity: number; unit_price: number }[] | null }

    const grossSalesThisMonth = monthSales?.reduce(
      (sum, d) => sum + Number(d.shipped_quantity) * Number(d.unit_price), 0
    ) ?? 0

    const { count: overduePayments } = await supabase
      .from('delivery')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .eq('paid', false)
      .filter('delivery_date + (payment_terms || \' days\')::interval', 'lt', today)

    const { count: deliveriesThisQuarter } = await supabase
      .from('delivery')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .gte('delivery_date', quarterStart.slice(0, 10))

    const { data: quarterSales } = await supabase
      .from('delivery')
      .select('shipped_quantity, unit_price')
      .is('deleted_at', null)
      .gte('delivery_date', quarterStart.slice(0, 10)) as { data: { shipped_quantity: number; unit_price: number }[] | null }

    const grossSalesThisQuarter = quarterSales?.reduce(
      (sum, d) => sum + Number(d.shipped_quantity) * Number(d.unit_price), 0
    ) ?? 0

    stats.value = {
      openPOs: openPOs ?? 0,
      deliveriesThisMonth: deliveriesThisMonth ?? 0,
      grossSalesThisMonth,
      overduePayments: overduePayments ?? 0,
      deliveriesThisQuarter: deliveriesThisQuarter ?? 0,
      grossSalesThisQuarter,
    }
  }

  function getQuarterStart(date: Date): Date {
    const month = date.getMonth()
    if (month >= 3 && month < 6) return new Date(date.getFullYear(), 3, 1)
    if (month >= 6 && month < 9) return new Date(date.getFullYear(), 6, 1)
    if (month >= 9) return new Date(date.getFullYear(), 9, 1)
    return new Date(date.getFullYear() - 1, 9, 1)
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  async function createPO(poNumber: string, clientId: number, notes: string | null, products: { productId: number; ordered_quantity: number }[]) {
    const { error: poError } = await supabase
      .from('purchase_order')
      .insert({ id: poNumber, clientId, notes })

    if (poError) throw poError

    const pivotRows = products.map(p => ({
      poId: poNumber,
      productId: p.productId,
      ordered_quantity: p.ordered_quantity,
    }))

    const { error: pivotError } = await supabase
      .from('po_product')
      .insert(pivotRows)

    if (pivotError) throw pivotError
  }

  async function checkPONumberUnique(poNumber: string): Promise<boolean> {
    const { count } = await supabase
      .from('purchase_order')
      .select('*', { count: 'exact', head: true })
      .eq('id', poNumber)
      .is('deleted_at', null)

    return count === 0
  }

  return {
    poList,
    stats,
    loading,
    error,
    fetchRecent,
    fetchStats,
    formatCurrency,
    createPO,
    checkPONumberUnique,
  }
}
