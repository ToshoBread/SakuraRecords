import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)
const loading = ref(true)

const role = computed(() => user.value?.app_metadata?.role as 'admin' | 'operator' | null)
const isAdmin = computed(() => role.value === 'admin')
const isOperator = computed(() => role.value === 'operator')

export function useAuth() {
  async function init() {
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ?? null
    loading.value = false

    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
  }

  return {
    user,
    loading,
    role,
    isAdmin,
    isOperator,
    init,
    login,
    logout,
  }
}
