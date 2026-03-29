import { ref } from 'vue'
import api from '../services/api'
import { useCart } from './cart'


// ✅ helper อ่าน avatar จาก localStorage
function getAvatar(email) {
  return email ? localStorage.getItem(`avatar_${email}`) || '' : ''
}

const user = ref(null)
const isLoggedIn = ref(false)
export function useAuth() {

  async function restoreSession() {
    try {
      const me = await api.getMe()
      if (me?.login) {
        user.value = {
          email:  me.email,
          name:   me.name,
          status: me.status,
          avatar: getAvatar(me.email),
        }
        isLoggedIn.value = true
        await useCart().loadUserCart()
      } else {
        user.value = null
        isLoggedIn.value = false
      }
    } catch {
      user.value = null
      isLoggedIn.value = false
    }
  }

  async function login(email, password) {
    try {
      const res = await api.login(email, password)
      if (res.login) {
        const me = await api.getMe()
        user.value = { email: me.email, name: me.name, status: me.status, avatar: getAvatar(me.email) }
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

   // ✅ เพิ่ม updateAvatar — เรียกจาก ProfilePage หลัง save
  function updateAvatar(avatarDataUrl) {
    if (!user.value) return
    localStorage.setItem(`avatar_${user.value.email}`, avatarDataUrl)
    user.value = { ...user.value, avatar: avatarDataUrl }
  }

  function removeAvatar() {
    if (!user.value) return
    localStorage.removeItem(`avatar_${user.value.email}`)
    user.value = { ...user.value, avatar: '' }
  }

  return { user, isLoggedIn, login, register, logout, restoreSession, updateAvatar, removeAvatar }
}