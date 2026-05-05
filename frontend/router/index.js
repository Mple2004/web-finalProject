import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../stores/auth'
import HomeView from '../pages/HomeView.vue'
import CategoryPage from '../pages/CategoryPage.vue'
import ProductDetail from '../pages/ProductDetail.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import CheckoutPage from '../pages/CheckoutPage.vue'
import OrderHistoryPage from '../pages/OrderHistoryPage.vue'
import WishlistPage from '../pages/WishlistPage.vue'
import AdminLayout from '../pages/admin/AdminLayout.vue'
import AdminDashboard from '../pages/admin/AdminDashboard.vue'
import AdminProducts from '../pages/admin/AdminProducts.vue'
import AdminMembers from '../pages/admin/AdminMembers.vue'
import AdminOrders from '../pages/admin/AdminOrders.vue'

const routes = [
  { path: '/',              name: 'home',           component: HomeView },
  { path: '/category/:id?', name: 'category',       component: CategoryPage, props: true },
  { path: '/product/:id',   name: 'product-detail', component: ProductDetail, props: true },
  { path: '/login',         name: 'login',          component: LoginPage,     meta: { guestOnly: true } },
  { path: '/register',      name: 'register',       component: RegisterPage,  meta: { guestOnly: true } },
  { path: '/profile',       name: 'profile',        component: ProfilePage,   meta: { requiresAuth: true } },
  { path: '/checkout',      name: 'checkout',       component: CheckoutPage,  meta: { requiresAuth: true } },
  { path: '/orders',        name: 'orders',         component: OrderHistoryPage, meta: { requiresAuth: true } },
  { path: '/wishlist',      name: 'wishlist',       component: WishlistPage,  meta: { requiresAuth: true } },
  { path: '/contact',       name: 'contact',        component: () => import('../pages/ContactPage.vue') },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '',          redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'admin-dashboard', component: AdminDashboard },
      { path: 'products',  name: 'admin-products',  component: AdminProducts },
      { path: 'members',   name: 'admin-members',   component: AdminMembers },
      { path: 'orders',    name: 'admin-orders',    component: AdminOrders },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0, behavior: 'smooth' }
  }
})

let sessionRestored = false

router.beforeEach(async (to, from) => {
  const auth = useAuth()

  if (!sessionRestored) {
    await auth.restoreSession()
    sessionRestored = true
  }

  if (to.meta.requiresAuth && !auth.isLoggedIn.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && auth.user.value?.status !== 'admin') {
    return { name: 'home' }
  }

  // Admin users are restricted to /admin pages only
  if (auth.isLoggedIn.value && auth.user.value?.status === 'admin' && !to.path.startsWith('/admin')) {
    return { name: 'admin-dashboard' }
  }

  if (to.meta.guestOnly && auth.isLoggedIn.value) {
    return { name: 'home' }
  }
})

export default router
