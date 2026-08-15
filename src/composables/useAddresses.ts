import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export interface Address {
  id: number
  clientId: number
  name: string
  address: string
  created_at: string
  updated_at: string
}

export function useAddresses() {
  const addresses = ref<Address[]>([])
  const loading = ref(false)

  async function fetchByClient(clientId: number) {
    loading.value = true
    const { data } = await supabase
      .from('address')
      .select('*')
      .eq('clientId', clientId)
      .is('deleted_at', null)
      .order('name')

    addresses.value = (data as Address[]) ?? []
    loading.value = false
  }

  async function create(clientId: number, name: string, address: string) {
    const { data, error } = await supabase
      .from('address')
      .insert({ clientId, name, address })
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

  return { addresses, loading, fetchByClient, create, update, softDelete }
}
