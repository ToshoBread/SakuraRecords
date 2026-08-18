import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export interface Address {
  id: number
  clientid: number
  name: string
  address: string
  created_at: string
  updated_at: string
}

export function useAddresses() {
  const addresses = ref<Address[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchByClient(clientId: number) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('address')
        .select('*')
        .eq('clientid', clientId)
        .is('deleted_at', null)
        .order('name')

      if (err) error.value = err.message
      else addresses.value = (data as Address[]) ?? []
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function create(clientId: number, name: string, address: string) {
    const { data, error } = await supabase
      .from('address')
      .insert({ clientid: clientId, name, address })
      .select()
      .single()

    if (error) throw error
    return data as Address
  }

  async function update(id: number, name: string, address: string) {
    const { error } = await supabase
      .from('address')
      .update({ name, address, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  }

  async function softDelete(id: number) {
    const { error } = await supabase
      .from('address')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  }

  return { addresses, loading, error, fetchByClient, create, update, softDelete }
}
