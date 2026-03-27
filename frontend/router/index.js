import { createRouter, createWebHistory } from 'vue-router'
// สมมติว่าไฟล์อยู่ในโฟลเดอร์ views ทั้งหมด
import HomeView from '../pages/HomeView.vue'
import CategoryPage from '../pages/CategoryPage.vue'
import ProductDetail from '../pages/ProductDetail.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import CheckoutPage from '../pages/CheckoutPage.vue'
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    // รองรับการกรองตาม Category จาก Sidebar (เช่น /category/Wine)
    path: '/category/:id?', 
    name: 'category',
    component: CategoryPage,
    props: true
  },
  {
    // :id ตรงนี้จะรับค่า pdID จากตาราง products เพื่อไปเรียก GET /products/:id
    path: '/product/:id',
    name: 'product-detail',
    component: ProductDetail,
    props: true
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: { guestOnly: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: CheckoutPage,
    meta: { requiresAuth: true }
  },
  // Catch-all route สำหรับหน้าที่ไม่พบบบ
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0, behavior: 'smooth' }
  }
})

/**
 * 🛡️ Navigation Guard
 * ตรวจสอบสถานะการ Login ก่อนเข้าหน้า Profile หรือ Checkout
 */
router.beforeEach((to, from, next) => {
  // ตรวจสอบ Token ใน Cookie (เนื่องจาก Backend ใช้ cookie-parser และ credentials: true)
  const hasToken = document.cookie.split(';').some(c => c.trim().startsWith('token='))
  
  // กรณีหน้าต้อง Login แต่ไม่มี Token
  if (to.meta.requiresAuth && !hasToken) {
    next({ name: 'login' })
  } 
  // กรณี Login แล้วแต่จะเข้าหน้า Login/Register อีก
  else if (to.meta.guestOnly && hasToken) {
    next({ name: 'home' })
  } 
  else {
    next()
  }
})

export default router