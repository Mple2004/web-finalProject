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
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0, behavior: 'smooth' }
  }
})

// ✅ flag ป้องกันเรียก restoreSession ซ้ำ
let sessionRestored = false

router.beforeEach(async (to, from) => {
  const auth = useAuth()

  // ✅ รอ restoreSession ครั้งแรกให้เสร็จก่อน
  if (!sessionRestored) {
    await auth.restoreSession()
    sessionRestored = true
  }

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isLoggedIn) {
    return { name: 'home' }
  }
})

export default router