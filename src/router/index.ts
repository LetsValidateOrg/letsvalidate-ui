import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { AuthService } from '../services/AuthService'
import { hostedLoginUrls } from '../models/HostedUrls'

// Redirect users to cognito url if it's a guarded url and they aren't logged in
function getAuthStatus() {
  const cognitoHostedLoginUrl = hostedLoginUrls[window.location.hostname] as string
  if (!AuthService.authStatusLogedIn()) {
    window.location.href = cognitoHostedLoginUrl
    return false
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      beforeEnter: [getAuthStatus]
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})
export default router
