import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export interface ClientDetail {
  id: number
  name: string
  created_at: string
  updated_at: string
  addresses: { id: number; clientid: number; name: string; address: string }[]
  purchase_orders: { id: string; created_at: string }[]
}

export function useClient() {
  const client = ref<ClientDetail | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchById(id: number) {
    loading.value = true
    const { data, error: err } = await supabase
      .from('client')
      .select(`
        *,
        addresses:address (*),
        purchase_orders:purchase_order (id, created_at)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (err) error.value = err.message
    else client.value = data as unknown as ClientDetail
    loading.value = false
  }

  return { client, loading, error, fetchById }
}
