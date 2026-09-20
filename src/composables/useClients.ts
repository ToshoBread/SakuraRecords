import { ref, computed } from 'vue'
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

  const currentPage = ref(1)
  const pageSize = ref(20)
  const totalItems = ref(0)
  const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value) || 1)

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

  async function fetchPage(page: number = 1, search: string = '') {
    loading.value = true
    error.value = null
    const start = (page - 1) * pageSize.value
    const end = start + pageSize.value - 1

    try {
      let query = supabase
        .from('client')
        .select('*', { count: 'exact' })
        .is('deleted_at', null)
        .order('name')
        .range(start, end)

      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      const { data, count, error: err } = await query

      if (err) {
        error.value = err.message
      } else {
        clients.value = data as Client[]
        totalItems.value = count ?? 0
        currentPage.value = page
      }
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

  return { clients, loading, error, fetchAll, fetchPage, currentPage, pageSize, totalItems, totalPages, create, update, softDelete }
}
