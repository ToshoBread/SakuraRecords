import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: () => import('@/views/dashboard/DashboardView.vue') },
        { path: 'purchase-orders', name: 'purchase-order-list', component: () => import('@/views/po/POListView.vue') },
        { path: 'purchase-orders/new', name: 'purchase-order-create', component: () => import('@/views/po/POCreateView.vue') },
        { path: 'purchase-orders/:purchaseOrderNumber', name: 'purchase-order-detail', component: () => import('@/views/po/PODetailView.vue') },
        { path: 'purchase-orders/:purchaseOrderNumber/edit', name: 'purchase-order-edit', component: () => import('@/views/po/POEditView.vue') },
        { path: 'deliveries', name: 'delivery-list', component: () => import('@/views/deliveries/DeliveryListView.vue') },
        { path: 'clients', name: 'client-list', component: () => import('@/views/clients/ClientListView.vue') },
        { path: 'clients/new', name: 'client-create', component: () => import('@/views/clients/ClientCreateView.vue') },
        { path: 'clients/:id', name: 'client-detail', component: () => import('@/views/clients/ClientDetailView.vue') },
        { path: 'clients/:id/edit', name: 'client-edit', component: () => import('@/views/clients/ClientEditView.vue') },
        { path: 'products', name: 'product-list', component: () => import('@/views/products/ProductListView.vue') },
        { path: 'products/new', name: 'product-create', component: () => import('@/views/products/ProductCreateView.vue') },
        { path: 'products/:id', name: 'product-detail', component: () => import('@/views/products/ProductDetailView.vue') },
        { path: 'products/:id/edit', name: 'product-edit', component: () => import('@/views/products/ProductEditView.vue') },
        { path: 'admin', name: 'admin', component: () => import('@/views/admin/AdminView.vue') },
        { path: 'settings', name: 'settings', component: () => import('@/views/settings/SettingsView.vue') },
        { path: 'reports', name: 'reports', component: () => import('@/views/reports/ReportsView.vue') },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'dashboard' },
    },
  ],
})

function readLandingPage() {
  try {
    const stored = localStorage.getItem('settings')
    if (stored) return JSON.parse(stored).landingPage ?? 'dashboard'
  } catch {}
  return 'dashboard'
}

router.beforeEach(async (to) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const requiresAuth = to.meta.requiresAuth !== false

    if (requiresAuth && !session) {
      return { name: 'login' }
    }
    if (to.name === 'login' && session) {
      return { name: readLandingPage() }
    }
  } catch {
    return { name: 'login' }
  }
})

export default router
