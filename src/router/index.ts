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
      name: 'dashboard',
      component: () => import('@/components/dashboard/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/po',
      name: 'po-list',
      component: () => import('@/components/po/POListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/po/new',
      name: 'po-create',
      component: () => import('@/components/po/POCreateView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/po/:poNumber',
      name: 'po-detail',
      component: () => import('@/components/po/PODetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/po/:poNumber/edit',
      name: 'po-edit',
      component: () => import('@/components/po/POEditView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/clients',
      name: 'client-list',
      component: () => import('@/components/clients/ClientListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/clients/new',
      name: 'client-create',
      component: () => import('@/components/clients/ClientCreateView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/clients/:id',
      name: 'client-detail',
      component: () => import('@/components/clients/ClientDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/clients/:id/edit',
      name: 'client-edit',
      component: () => import('@/components/clients/ClientEditView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/products',
      name: 'product-list',
      component: () => import('@/components/products/ProductListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/products/new',
      name: 'product-create',
      component: () => import('@/components/products/ProductCreateView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: () => import('@/components/products/ProductDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/products/:id/edit',
      name: 'product-edit',
      component: () => import('@/components/products/ProductEditView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const { data: { session } } = await supabase.auth.getSession()
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !session) {
    return { name: 'login' }
  }
  if (to.name === 'login' && session) {
    return { name: 'dashboard' }
  }
})

export default router
