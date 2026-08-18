import { ref } from 'vue'
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

  return { products, loading, error, fetchAll, create, update, softDelete, checkCodeUnique }
}
