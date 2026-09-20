import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export interface DeliveryWithRelations {
  id: number
  poid: string | null
  clientid: number | null
  productid: number
  shipped_quantity: number
  unit_price: number
  delivery_date: string
  payment_terms: number
  delivered: boolean
  addressid: number
  transactiondocumentid: number
  deliveryrequirementid: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  product_name: string | null
  product_code: string | null
  client_name: string | null
  po_number: string | null
  address_name: string | null
  po_client_name: string | null
  delivery_requirement_name: string | null
  product?: { id: number; name: string; code: string } | null
  address?: { name: string; client: { name: string } } | null
  purchase_order?: { id: string; client: { name: string } } | null
  client?: { name: string } | null
  transaction_document?: { document: string } | null
  delivery_requirement?: { requirement: string } | null
}

export function useDeliveries() {
  const deliveries = ref<DeliveryWithRelations[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const currentPage = ref(1)
  const pageSize = ref(20)
  const totalItems = ref(0)
  const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value) || 1)

  function buildSearchFilter(search: string) {
    if (!search) return ''
    return `product_name.ilike.*${search}*,product_code.ilike.*${search}*,po_number.ilike.*${search}*,client_name.ilike.*${search}*,address_name.ilike.*${search}*`
  }

  async function fetchPage(page: number = 1, search: string = '') {
    loading.value = true
    error.value = null
    const start = (page - 1) * pageSize.value
    const end = start + pageSize.value - 1

    try {
      let query = supabase
        .from('delivery_search')
        .select('*', { count: 'exact' })
        .order('delivery_date', { ascending: false })
        .range(start, end)

      if (search) {
        query = query.or(buildSearchFilter(search))
      }

      const { data, count, error: err } = await query

      if (err) {
        error.value = err.message
      } else {
        deliveries.value = (data ?? []) as DeliveryWithRelations[]
        totalItems.value = count ?? 0
        currentPage.value = page
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('delivery_search')
        .select('*')
        .order('delivery_date', { ascending: false })

      if (err) error.value = err.message
      else deliveries.value = (data ?? []) as DeliveryWithRelations[]
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchStandalone() {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('delivery_search')
        .select('*')
        .is('poid', null)
        .order('delivery_date', { ascending: false })

      if (err) error.value = err.message
      else deliveries.value = (data ?? []) as DeliveryWithRelations[]
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchLinked() {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('delivery_search')
        .select('*')
        .not('poid', 'is', null)
        .order('delivery_date', { ascending: false })

      if (err) error.value = err.message
      else deliveries.value = (data ?? []) as DeliveryWithRelations[]
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchPageStandalone(page: number = 1, search: string = '') {
    loading.value = true
    error.value = null
    const start = (page - 1) * pageSize.value
    const end = start + pageSize.value - 1

    try {
      let query = supabase
        .from('delivery_search')
        .select('*', { count: 'exact' })
        .is('poid', null)
        .order('delivery_date', { ascending: false })
        .range(start, end)

      if (search) {
        query = query.or(buildSearchFilter(search))
      }

      const { data, count, error: err } = await query

      if (err) {
        error.value = err.message
      } else {
        deliveries.value = (data ?? []) as DeliveryWithRelations[]
        totalItems.value = count ?? 0
        currentPage.value = page
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchPageLinked(page: number = 1, search: string = '') {
    loading.value = true
    error.value = null
    const start = (page - 1) * pageSize.value
    const end = start + pageSize.value - 1

    try {
      let query = supabase
        .from('delivery_search')
        .select('*', { count: 'exact' })
        .not('poid', 'is', null)
        .order('delivery_date', { ascending: false })
        .range(start, end)

      if (search) {
        query = query.or(buildSearchFilter(search))
      }

      const { data, count, error: err } = await query

      if (err) {
        error.value = err.message
      } else {
        deliveries.value = (data ?? []) as DeliveryWithRelations[]
        totalItems.value = count ?? 0
        currentPage.value = page
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function linkDelivery(deliveryId: number, poId: string) {
    const { error: err } = await supabase.rpc('link_delivery_to_po', {
      p_delivery_id: deliveryId,
      p_poid: poId,
    })

    if (err) throw err
  }

  async function unlinkDelivery(deliveryId: number) {
    const { error: err } = await supabase
      .from('delivery')
      .update({ poid: null, updated_at: new Date().toISOString() })
      .eq('id', deliveryId)

    if (err) throw err
  }

  return {
    deliveries,
    loading,
    error,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    fetchAll,
    fetchPage,
    fetchStandalone,
    fetchLinked,
    fetchPageStandalone,
    fetchPageLinked,
    linkDelivery,
    unlinkDelivery,
  }
}
