import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../stores/auth'
import { useLoginModal } from '../stores/loginModal'
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
import Ordermangement from '../pages/admin/AdminOrders.vue'
import AdminProducts from '../pages/admin/AdminProducts.vue'
import AdminMembers from '../pages/admin/AdminMembers.vue'

const routes = [
  // ─── หน้า Guest (ไม่ต้อง login) ───────────────────
  { path: '/',               name: 'home',           component: HomeView },
  { path: '/category/:id?',  name: 'category',       component: CategoryPage,     props: true },
  { path: '/product/:id',    name: 'product-detail', component: ProductDetail,    props: true },
  { path: '/login',          name: 'login',          component: LoginPage,        meta: { guestOnly: true } },
  { path: '/register',       name: 'register',       component: RegisterPage,     meta: { guestOnly: true } },

  // ─── หน้า Member เท่านั้น (admin เข้าไม่ได้) ────────
  { path: '/profile',  name: 'profile',  component: ProfilePage,      meta: { requiresAuth: true, memberOnly: true } },
  { path: '/checkout', name: 'checkout', component: CheckoutPage,     meta: { requiresAuth: true, memberOnly: true } },
  { path: '/orders',   name: 'orders',   component: OrderHistoryPage, meta: { requiresAuth: true, memberOnly: true } },
  { path: '/wishlist', name: 'wishlist', component: WishlistPage,     meta: { requiresAuth: true, memberOnly: true } },

  // ─── หน้า Admin เท่านั้น ────────────────────────────
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, adminOnly: true },
    children: [
      { path: '',          redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'admin-dashboard', component: AdminDashboard },
      { path: 'orders',    name: 'admin-orders',    component: Ordermangement },
      { path: 'products',  name: 'admin-products',  component: AdminProducts },
      { path: 'members',   name: 'admin-members',   component: AdminMembers },
    ]
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
  const loginModal = useLoginModal()

  loginModal.reset()

  if (!sessionRestored) {
    await auth.restoreSession()
    sessionRestored = true
  }

  const isLogin = auth.isLoggedIn.value
  const isAdmin = auth.user.value?.status?.toLowerCase() === 'admin'

  if (to.meta.requiresAuth && !isLogin) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && isLogin) {
    return isAdmin ? { name: 'admin-dashboard' } : { name: 'home' }
  }

  // ✅ ใช้ matched เพื่อเช็ค nested routes ด้วย
  const requiresAdmin = to.matched.some(r => r.meta.adminOnly)
  const requiresMember = to.matched.some(r => r.meta.memberOnly)

  if (requiresMember && isLogin && isAdmin) {
    return { name: 'admin-dashboard' }
  }

  if (requiresAdmin && isLogin && !isAdmin) {
    return { name: 'home' }
  }
})

export default router