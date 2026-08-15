import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/format'

export interface PurchaseOrderDetail {
  id: string
  clientid: number
  notes: string | null
  created_at: string
  client: { id: number; name: string }
  po_products: PurchaseOrderProduct[]
  deliveries: Delivery[]
}

export interface PurchaseOrderProduct {
  poid: string
  productid: number
  ordered_quantity: number
  product: { id: number; name: string; code: string }
}

export interface Delivery {
  id: number
  poid: string
  productid: number
  shipped_quantity: number
  unit_price: number
  delivery_date: string
  payment_terms: number
  paid: boolean
  addressid: number
  transactiondocumentid: number
  deliveryrequirementid: number
  product: { name: string; code: string }
  address: { name: string }
  transaction_document: { document: string }
  delivery_requirement: { requirement: string }
}

export interface ProductWithRemaining {
  poid: string
  productid: number
  ordered_quantity: number
  product: { id: number; name: string; code: string }
  shipped: number
  remaining: number
}

export function usePurchaseOrder() {
  const purchaseOrder = ref<PurchaseOrderDetail | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const productsWithRemaining = computed<ProductWithRemaining[]>(() => {
    if (!purchaseOrder.value) return []
    return purchaseOrder.value.po_products.map(pp => {
      const shipped = purchaseOrder.value!.deliveries
        .filter(d => d.productid === pp.productid)
        .reduce((sum, d) => sum + Number(d.shipped_quantity), 0)
      return {
        ...pp,
        shipped,
        remaining: Number(pp.ordered_quantity) - shipped,
      }
    })
  })

  async function fetchByPurchaseOrderNumber(purchaseOrderNumber: string) {
    loading.value = true
    const { data, error: err } = await supabase
      .from('purchase_order')
      .select(`
        *,
        client:clientid (id, name),
        po_products:po_product (
          poid, productid, ordered_quantity,
          product:productid (id, name, code)
        ),
        deliveries:delivery (
          *,
          product:productid (name, code),
          address:addressid (name),
          transaction_document:transactiondocumentid (document),
          delivery_requirement:deliveryrequirementid (requirement)
        )
      `)
      .eq('id', purchaseOrderNumber)
      .is('deleted_at', null)
      .single()

    if (err) error.value = err.message
    else purchaseOrder.value = data as unknown as PurchaseOrderDetail
    loading.value = false
  }

  async function addDelivery(delivery: {
    poid: string
    productid: number
    shipped_quantity: number
    unit_price: number
    delivery_date: string
    payment_terms: number
    paid: boolean
    addressid: number
    transactiondocumentid: number
    deliveryrequirementid: number
  }) {
    const { error: err } = await supabase
      .from('delivery')
      .insert(delivery)

    if (err) throw err
  }

  async function updateDelivery(id: number, delivery: {
    productid: number
    shipped_quantity: number
    unit_price: number
    delivery_date: string
    payment_terms: number
    paid: boolean
    addressid: number
    transactiondocumentid: number
    deliveryrequirementid: number
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

  return {
    purchaseOrder,
    loading,
    error,
    productsWithRemaining,
    fetchByPurchaseOrderNumber,
    addDelivery,
    updateDelivery,
    deleteDelivery,
    formatCurrency,
  }
}
