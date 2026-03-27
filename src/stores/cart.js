import { reactive, computed } from 'vue'
import api from '../services/api'

const state = reactive({
  items: [],
  isOpen: false,
  currentUserId: null,
})

function _save() {
  if (state.currentUserId !== null) {
    localStorage.setItem(`cart_${state.currentUserId}`, JSON.stringify(state.items))
  }
}

export function useCart() {
  const count = computed(() => state.items.reduce((s, i) => s + i.qty, 0))
  const total = computed(() => state.items.reduce((s, i) => s + i.price * i.qty, 0))

  function open()   { state.isOpen = true }
  function close()  { state.isOpen = false }
  function toggle() { state.isOpen = !state.isOpen }

  function loadUserCart(userId) {
    state.currentUserId = userId
    const saved = localStorage.getItem(`cart_${userId}`)
    state.items = saved ? JSON.parse(saved) : []
  }

  function clearCart() {
    state.items = []
    state.currentUserId = null
    state.isOpen = false
  }

  function add(product) {
    const existing = state.items.find((i) => i.id === product.id)
    if (existing) {
      existing.qty++
    } else {
      state.items.push({ ...product, qty: 1 })
    }
    _save()
    api.addToCart(product.id, 1)
  }

  function updateQty(id, delta) {
    const item = state.items.find((i) => i.id === id)
    if (!item) return
    item.qty += delta
    if (item.qty <= 0) {
      state.items = state.items.filter((i) => i.id !== id)
      api.removeCartItem(id)
    } else {
      api.updateCartItem(id, item.qty)
    }
    _save()
  }

  async function checkout() {
    await api.checkout(state.items)
    state.items = []
    _save()
    state.isOpen = false
  }

  return {
    state,
    count,
    total,
    open,
    close,
    toggle,
    loadUserCart,
    clearCart,
    add,
    updateQty,
    checkout,
  }
}
