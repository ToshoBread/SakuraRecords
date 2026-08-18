import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export interface Client {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export function useClients() {
  const clients = ref<Client[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('client')
        .select('*')
        .is('deleted_at', null)
        .order('name')

      if (err) error.value = err.message
      else clients.value = data as Client[]
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function create(name: string) {
    const { data, error: err } = await supabase
      .from('client')
      .insert({ name })
      .select()
      .single()

    if (err) throw err
    return data as Client
  }

  async function update(id: number, name: string) {
    const { error: err } = await supabase
      .from('client')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (err) throw err
  }

  async function softDelete(id: number) {
    const { error: err } = await supabase
      .from('client')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (err) throw err
  }

  return { clients, loading, error, fetchAll, create, update, softDelete }
}
