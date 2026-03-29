import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../stores/auth'

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

router.beforeEach(async (to, from) => {
  const auth = useAuth()
  
  // ตรวจสอบว่ามีข้อมูล user หรือไม่
  // (ถ้าใช้ ref ต้องใช้ .value แต่ถ้า return object ปกติก็ใช้ auth.isLoggedIn)
  const isLoggedIn = auth.isLoggedIn.value 

  if (to.meta.requiresAuth && !isLoggedIn) {
    // ถ้าจะไปหน้าเป้าหมายแต่ไม่ได้ login ให้เด้งไป login
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  
  if (to.meta.guestOnly && isLoggedIn) {
    // ถ้า login แล้วแต่อยากไปหน้า register/login ให้ดีดกลับไป home
    return { name: 'home' }
  }
})



/**
 * 🛡️ Navigation Guard (ฉบับแก้ไข Circular Dependency)
 */
router.beforeEach(async (to, from) => {
  // ✅ ย้ายมาเรียกใช้ข้างในนี้แทนการเรียกข้างบนสุด
  // ต้อง import useAuth มาไว้ข้างบนไฟล์ แต่ห้ามเรียกใช้จนกว่าจะเข้า function นี้
  const auth = useAuth() 
  
  // เช็คว่าโหลด Session เสร็จหรือยัง (ถ้าคุณทำระบบ isReady)
  // หรือเช็คจากตัวแปร isLoggedIn ตรงๆ
  const isLoggedIn = auth.isLoggedIn.value 

  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  
  if (to.meta.guestOnly && isLoggedIn) {
    return { name: 'home' }
  }
})

export default router