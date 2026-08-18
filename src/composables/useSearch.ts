import { ref } from 'vue'
import { useClients, type Client } from '@/composables/useClients'
import { useProducts, type Product } from '@/composables/useProducts'
import { usePurchaseOrders, type PurchaseOrder } from '@/composables/usePurchaseOrders'

export interface SearchResults {
  clients: Client[]
  products: Product[]
  purchaseOrders: PurchaseOrder[]
}

const clients = ref<Client[]>([])
const products = ref<Product[]>([])
const purchaseOrders = ref<PurchaseOrder[]>([])
const loaded = ref(false)
const loading = ref(false)

export function useSearch() {
  const clientsComposable = useClients()
  const productsComposable = useProducts()
  const purchaseOrdersComposable = usePurchaseOrders()

  async function loadAll() {
    if (loaded.value) return
    loading.value = true
    try {
      await Promise.all([
        clientsComposable.fetchAll(),
        productsComposable.fetchAll(),
        purchaseOrdersComposable.fetchRecent(50),
      ])
      clients.value = clientsComposable.clients.value
      products.value = productsComposable.products.value
      purchaseOrders.value = purchaseOrdersComposable.purchaseOrderList.value
      loaded.value = true
    } catch {
      loaded.value = false
    } finally {
      loading.value = false
    }
  }

  function search(query: string): SearchResults {
    const q = query.toLowerCase().trim()
    if (!q) return { clients: [], products: [], purchaseOrders: [] }

    const matchedClients = clients.value.filter(c =>
      c.name.toLowerCase().includes(q)
    ).slice(0, 5)

    const matchedProducts = products.value.filter(p =>
      p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    ).slice(0, 5)

    const matchedPOs = purchaseOrders.value.filter(po =>
      po.id.toLowerCase().includes(q) ||
      po.client?.name?.toLowerCase().includes(q)
    ).slice(0, 5)

    return {
      clients: matchedClients,
      products: matchedProducts,
      purchaseOrders: matchedPOs,
    }
  }

  return { loadAll, search, loading }
}
