import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export interface DeliveryWithRelations {
  id: number
  poid: string | null
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
  product: { id: number; name: string; code: string }
  address: { name: string; client: { name: string } }
  purchase_order: { id: string; client: { name: string } } | null
  transaction_document: { document: string }
  delivery_requirement: { requirement: string }
}

const selectQuery = `
  *,
  product:productid (id, name, code),
  address:addressid (name, client:clientid (name)),
  purchase_order:poid (id, client:clientid (name)),
  transaction_document:transactiondocumentid (document),
  delivery_requirement:deliveryrequirementid (requirement)
`

export function useDeliveries() {
  const deliveries = ref<DeliveryWithRelations[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    const { data, error: err } = await supabase
      .from('delivery')
      .select(selectQuery)
      .is('deleted_at', null)

    if (err) {
      error.value = err.message
    } else {
      deliveries.value = data as unknown as DeliveryWithRelations[]
    }
    loading.value = false
  }

  async function fetchStandalone() {
    loading.value = true
    const { data, error: err } = await supabase
      .from('delivery')
      .select(selectQuery)
      .is('deleted_at', null)
      .is('poid', null)

    if (err) {
      error.value = err.message
    } else {
      deliveries.value = data as unknown as DeliveryWithRelations[]
    }
    loading.value = false
  }

  async function fetchLinked() {
    loading.value = true
    const { data, error: err } = await supabase
      .from('delivery')
      .select(selectQuery)
      .is('deleted_at', null)
      .not('poid', 'is', null)

    if (err) {
      error.value = err.message
    } else {
      deliveries.value = data as unknown as DeliveryWithRelations[]
    }
    loading.value = false
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
    fetchAll,
    fetchStandalone,
    fetchLinked,
    linkDelivery,
    unlinkDelivery,
  }
}
