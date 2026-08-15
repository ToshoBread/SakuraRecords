import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export interface PODetail {
  id: string
  clientId: number
  notes: string | null
  created_at: string
  client: { id: number; name: string }
  po_products: POProduct[]
  deliveries: Delivery[]
}

export interface POProduct {
  poId: string
  productId: number
  ordered_quantity: number
  product: { id: number; name: string; code: string }
}

export interface Delivery {
  id: number
  poId: string
  productId: number
  shipped_quantity: number
  unit_price: number
  delivery_date: string
  payment_terms: number
  paid: boolean
  addressId: number
  transactionDocumentId: number
  deliveryRequirementId: number
  product: { name: string; code: string }
  address: { name: string }
  transaction_document: { document: string }
  delivery_requirement: { requirement: string }
}

export interface ProductWithRemaining {
  poId: string
  productId: number
  ordered_quantity: number
  product: { id: number; name: string; code: string }
  shipped: number
  remaining: number
}

export function usePO() {
  const po = ref<PODetail | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const productsWithRemaining = computed<ProductWithRemaining[]>(() => {
    if (!po.value) return []
    return po.value.po_products.map(pp => {
      const shipped = po.value!.deliveries
        .filter(d => d.productId === pp.productId)
        .reduce((sum, d) => sum + Number(d.shipped_quantity), 0)
      return {
        ...pp,
        shipped,
        remaining: Number(pp.ordered_quantity) - shipped,
      }
    })
  })

  async function fetchByPONumber(poNumber: string) {
    loading.value = true
    const { data, error: err } = await supabase
      .from('purchase_order')
      .select(`
        *,
        client:clientId (id, name),
        po_products:po_product (
          poId, productId, ordered_quantity,
          product:productId (id, name, code)
        ),
        deliveries:delivery (
          *,
          product:productId (name, code),
          address:addressId (name),
          transaction_document:transactionDocumentId (document),
          delivery_requirement:deliveryRequirementId (requirement)
        )
      `)
      .eq('id', poNumber)
      .is('deleted_at', null)
      .single()

    if (err) error.value = err.message
    else po.value = data as unknown as PODetail
    loading.value = false
  }

  async function addDelivery(delivery: {
    poId: string
    productId: number
    shipped_quantity: number
    unit_price: number
    delivery_date: string
    payment_terms: number
    paid: boolean
    addressId: number
    transactionDocumentId: number
    deliveryRequirementId: number
  }) {
    const { error: err } = await supabase
      .from('delivery')
      .insert(delivery)

    if (err) throw err
  }

  async function updateDelivery(id: number, delivery: {
    productId: number
    shipped_quantity: number
    unit_price: number
    delivery_date: string
    payment_terms: number
    paid: boolean
    addressId: number
    transactionDocumentId: number
    deliveryRequirementId: number
  }) {
    const { error: err } = await supabase
      .from('delivery')
      .update({
        ...delivery,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (err) throw err
  }

  async function deleteDelivery(id: number) {
    const { error: err } = await supabase
      .from('delivery')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (err) throw err
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return {
    po,
    loading,
    error,
    productsWithRemaining,
    fetchByPONumber,
    addDelivery,
    updateDelivery,
    deleteDelivery,
    formatCurrency,
  }
}
