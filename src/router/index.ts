import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useSettings } from '@/composables/useSettings'

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
        { path: '', name: 'dashboard', component: () => import('@/components/dashboard/DashboardView.vue') },
        { path: 'purchase-orders', name: 'purchase-order-list', component: () => import('@/components/po/POListView.vue') },
        { path: 'purchase-orders/new', name: 'purchase-order-create', component: () => import('@/components/po/POCreateView.vue') },
        { path: 'purchase-orders/:purchaseOrderNumber', name: 'purchase-order-detail', component: () => import('@/components/po/PODetailView.vue') },
        { path: 'purchase-orders/:purchaseOrderNumber/edit', name: 'purchase-order-edit', component: () => import('@/components/po/POEditView.vue') },
        { path: 'clients', name: 'client-list', component: () => import('@/components/clients/ClientListView.vue') },
        { path: 'clients/new', name: 'client-create', component: () => import('@/components/clients/ClientCreateView.vue') },
        { path: 'clients/:id', name: 'client-detail', component: () => import('@/components/clients/ClientDetailView.vue') },
        { path: 'clients/:id/edit', name: 'client-edit', component: () => import('@/components/clients/ClientEditView.vue') },
        { path: 'products', name: 'product-list', component: () => import('@/components/products/ProductListView.vue') },
        { path: 'products/new', name: 'product-create', component: () => import('@/components/products/ProductCreateView.vue') },
        { path: 'products/:id', name: 'product-detail', component: () => import('@/components/products/ProductDetailView.vue') },
        { path: 'products/:id/edit', name: 'product-edit', component: () => import('@/components/products/ProductEditView.vue') },
        { path: 'admin', name: 'admin', component: () => import('@/components/admin/AdminView.vue') },
        { path: 'settings', name: 'settings', component: () => import('@/components/settings/SettingsView.vue') },
        { path: 'reports', name: 'reports', component: () => import('@/components/reports/ReportsView.vue') },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'dashboard' },
    },
  ],
})

router.beforeEach(async (to) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const requiresAuth = to.meta.requiresAuth !== false

    if (requiresAuth && !session) {
      return { name: 'login' }
    }
    if (to.name === 'login' && session) {
      const { settings } = useSettings()
      return { name: settings.value.landingPage }
    }
  } catch {
    return { name: 'login' }
  }
})

export default router
