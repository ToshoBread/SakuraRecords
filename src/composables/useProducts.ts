import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export interface Product {
  id: number
  name: string
  code: string
  description: string | null
  kg: number
  created_at: string
  updated_at: string
}

export function useProducts() {
  const products = ref<Product[]>([])
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
        .from('product')
        .select('*')
        .is('deleted_at', null)
        .order('name')

      if (err) error.value = err.message
      else products.value = data as Product[]
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
        .from('product')
        .select('*', { count: 'exact' })
        .is('deleted_at', null)
        .order('name')
        .range(start, end)

      if (search) {
        query = query.or(`name.ilike.*${search}*,code.ilike.*${search}*`)
      }

      const { data, count, error: err } = await query

      if (err) {
        error.value = err.message
      } else {
        products.value = data as Product[]
        totalItems.value = count ?? 0
        currentPage.value = page
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function create(name: string, code: string, description?: string, kg: number = 0) {
    const { data, error: err } = await supabase
      .from('product')
      .insert({ name, code, description: description || null, kg })
      .select()
      .single()

    if (err) throw err
    return data as Product
  }

  async function update(id: number, name: string, code: string, description?: string, kg: number = 0) {
    const { error: err } = await supabase
      .from('product')
      .update({ name, code, description: description || null, kg, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (err) throw err
  }

  async function softDelete(id: number) {
    const { error: err } = await supabase
      .from('product')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (err) throw err
  }

  async function checkCodeUnique(code: string): Promise<boolean> {
    const { count, error: err } = await supabase
      .from('product')
      .select('*', { count: 'exact', head: true })
      .eq('code', code)
      .is('deleted_at', null)

    if (err) throw err
    return count === 0
  }

  return { products, loading, error, fetchAll, fetchPage, currentPage, pageSize, totalItems, totalPages, create, update, softDelete, checkCodeUnique }
}
