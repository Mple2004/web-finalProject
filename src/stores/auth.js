import { ref } from 'vue'
import api from '../services/api'
import { mockUsers } from '../data/mockData'
import { useCart } from './cart'

// Module-level state — shared across all components
const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))
const isLoggedIn = ref(!!user.value)

// Restore cart when page is refreshed while logged in
if (user.value?.id) {
  useCart().loadUserCart(user.value.id)
}

export function useAuth() {
  function login(email, password) {
    const found = mockUsers.find(
      (u) => u.email === email && u.password === password
    )
    if (found) {
      const { password: _pw, ...safeUser } = found
      user.value = safeUser
      isLoggedIn.value = true
      localStorage.setItem('auth_user', JSON.stringify(safeUser))
      useCart().loadUserCart(safeUser.id)
      return { success: true }
    }
    return { success: false, message: 'Invalid email or password.' }
  }

  async function register(name, email, password) {
    const result = await api.register(name, email, password)
    if (result?.ok) {
      user.value = result.data.user
      isLoggedIn.value = true
      localStorage.setItem('auth_user', JSON.stringify(result.data.user))
      useCart().loadUserCart(result.data.user.id)
      return { success: true }
    }
    return {
      success: false,
      message: result?.data?.message || 'Registration failed. Please try again.',
    }
  }

  function logout() {
    useCart().clearCart()
    user.value = null
    isLoggedIn.value = false
    localStorage.removeItem('auth_user')
    api.logout()
  }

  return { user, isLoggedIn, login, register, logout }
}
