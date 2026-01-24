import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      name: 'home',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/input',
      name: 'input',
      component: () => import('../views/SleepInputView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/data',
      name: 'data-management',
      component: () => import('../views/DataManagementView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/logs',
      name: 'logs',
      component: () => import('../views/SleepLogListView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/logs/:id',
      name: 'log-detail',
      component: () => import('../views/SleepLogDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/analysis',
      name: 'analysis',
      component: () => import('../views/SleepAnalysisView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UserListView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/users/:id',
      name: 'user-profile',
      component: () => import('../views/UserProfileView.vue'),
      meta: { requiresAuth: true }
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
