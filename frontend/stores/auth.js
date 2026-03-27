import { ref } from 'vue'
import api from '../services/api'
import { useCart } from './cart'

const user = ref(null)
const isLoggedIn = ref(false)

async function restoreSession() {
  try {
    const me = await api.getMe()
    if (me.login) {
      user.value = { email: me.email, name: me.name, status: me.status }
      isLoggedIn.value = true
      // แก้: โหลดตะกร้าของ user จาก DB ด้วย
      await useCart().loadUserCart()
    }
  } catch {
    user.value = null
    isLoggedIn.value = false
  }
}
restoreSession()

export function useAuth() {
  async function login(email, password) {
    try {
      const res = await api.login(email, password)
      if (res.login) {
        const me = await api.getMe()
        user.value = { email: me.email, name: me.name, status: me.status }
        isLoggedIn.value = true
        // แก้: โหลดตะกร้าของ user จาก DB หลัง login สำเร็จ
        await useCart().loadUserCart()
        return { success: true }
      }
      return { success: false, message: res.message || 'Invalid email or password.' }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  async function register(name, email, password) {
    try {
      const res = await api.register(name, email, password)
      if (res.regist) {
        return await login(email, password)
      }
      return { success: false, message: res.message || 'Registration failed.' }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  async function logout() {
    useCart().clearCart()
    await api.logout()
    user.value = null
    isLoggedIn.value = false
  }

  return { user, isLoggedIn, login, register, logout }
}