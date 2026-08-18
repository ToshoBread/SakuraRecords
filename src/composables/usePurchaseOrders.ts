import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export interface PurchaseOrder {
  id: string
  clientid: number
  notes: string | null
  created_at: string
  client?: { name: string }
  deliveries?: { count: number }[]
  po_products?: { count: number }[]
}

export interface DashboardStats {
  openPurchaseOrders: number
  deliveriesThisMonth: number
  grossSalesThisMonth: number
  overdueDeliveries: number
  deliveriesThisQuarter: number
  grossSalesThisQuarter: number
}

export function usePurchaseOrders() {
  const purchaseOrderList = ref<PurchaseOrder[]>([])
  const stats = ref<DashboardStats>({
    openPurchaseOrders: 0,
    deliveriesThisMonth: 0,
    grossSalesThisMonth: 0,
    overdueDeliveries: 0,
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
        id, clientid, notes, created_at,
        client:clientid (name),
        deliveries:delivery (count),
        po_products:po_product (count)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (fetchErr) {
      error.value = fetchErr.message
    } else {
      purchaseOrderList.value = data as unknown as PurchaseOrder[]
    }
    loading.value = false
  }

  async function fetchStats() {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const quarterStart = getQuarterStart(now).toISOString()
    const today = now.toISOString()

    // Count open purchase orders (POs with products or undelivered deliveries)
    const { data: allPurchaseOrders } = await supabase
      .from('purchase_order')
      .select('id')
      .is('deleted_at', null)

    let openPurchaseOrders = 0
    if (allPurchaseOrders) {
      for (const po of allPurchaseOrders) {
        const { count: productCount } = await supabase
          .from('po_product')
          .select('*', { count: 'exact', head: true })
          .eq('poid', po.id)
          .is('deleted_at', null)

        if (productCount && productCount > 0) {
          openPurchaseOrders++
          continue
        }

        const { count: undeliveredCount } = await supabase
          .from('delivery')
          .select('*', { count: 'exact', head: true })
          .eq('poid', po.id)
          .eq('delivered', false)
          .is('deleted_at', null)

        if (undeliveredCount && undeliveredCount > 0) openPurchaseOrders++
      }
    }

    const { count: deliveriesThisMonth } = await supabase
      .from('delivery')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .gte('delivery_date', monthStart.slice(0, 10))

    const { data: monthSales } = await supabase
      .from('delivery')
      .select('shipped_quantity, unit_price')
      .is('deleted_at', null)
      .eq('delivered', true)
      .gte('delivery_date', monthStart.slice(0, 10))

    const grossSalesThisMonth = monthSales?.reduce(
      (sum, d) => sum + Number(d.shipped_quantity) * Number(d.unit_price), 0
    ) ?? 0

    const { count: overdueDeliveries } = await supabase
      .from('delivery')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .eq('delivered', false)
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
      .eq('delivered', true)
      .gte('delivery_date', quarterStart.slice(0, 10))

    const grossSalesThisQuarter = quarterSales?.reduce(
      (sum, d) => sum + Number(d.shipped_quantity) * Number(d.unit_price), 0
    ) ?? 0

    stats.value = {
      openPurchaseOrders: openPurchaseOrders ?? 0,
      deliveriesThisMonth: deliveriesThisMonth ?? 0,
      grossSalesThisMonth,
      overdueDeliveries: overdueDeliveries ?? 0,
      deliveriesThisQuarter: deliveriesThisQuarter ?? 0,
      grossSalesThisQuarter,
    }
  }

  // Fiscal quarters: Q1=Dec-Feb, Q2=Mar-May, Q3=Jun-Aug, Q4=Sep-Nov
  function getQuarterStart(date: Date): Date {
    const month = date.getMonth()
    const year = date.getFullYear()
    if (month >= 2 && month <= 4) return new Date(year, 2, 1)       // Q2: Mar-May
    if (month >= 5 && month <= 7) return new Date(year, 5, 1)       // Q3: Jun-Aug
    if (month >= 8 && month <= 10) return new Date(year, 8, 1)      // Q4: Sep-Nov
    return new Date(year - 1, 11, 1)                                // Q1: Dec-Feb (starts Dec of prev year)
  }

  async function createPurchaseOrder(purchaseOrderNumber: string, clientId: number, notes: string | null, products: { productId: number; ordered_quantity: number; price_per_kg: number }[]) {
    const { error: poError } = await supabase
      .from('purchase_order')
      .insert({ id: purchaseOrderNumber, clientid: clientId, notes })

    if (poError) throw poError

    const pivotRows = products.map(p => ({
      poid: purchaseOrderNumber,
      productid: p.productId,
      ordered_quantity: p.ordered_quantity,
      price_per_kg: p.price_per_kg,
    }))

    const { error: pivotError } = await supabase
      .from('po_product')
      .insert(pivotRows)

    if (pivotError) throw pivotError
  }

  async function checkPurchaseOrderNumberUnique(purchaseOrderNumber: string): Promise<boolean> {
    const { count, error: err } = await supabase
      .from('purchase_order')
      .select('*', { count: 'exact', head: true })
      .eq('id', purchaseOrderNumber)
      .is('deleted_at', null)

    if (err) throw err
    return count === 0
  }

  return {
    purchaseOrderList,
    stats,
    loading,
    error,
    fetchRecent,
    fetchStats,
    createPurchaseOrder,
    checkPurchaseOrderNumberUnique,
  }
}
