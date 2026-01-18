import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: DashboardView,
    },
    {
      path: '/input',
      name: 'input',
      component: () => import('../views/SleepInputView.vue'),
    },
    {
      path: '/logs',
      name: 'logs',
      component: () => import('../views/SleepLogListView.vue'),
    },
    {
      path: '/logs/:id',
      name: 'log-detail',
      component: () => import('../views/SleepLogDetailView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
