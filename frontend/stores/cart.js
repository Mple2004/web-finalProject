import { reactive, computed } from 'vue'
import api from '../services/api'

const state = reactive({
  items: [],
  isOpen: false,
  cartId: null,
})

export function useCart() {
  const count = computed(() => state.items.reduce((s, i) => s + i.qty, 0))
  const total = computed(() => state.items.reduce((s, i) => s + i.price * i.qty, 0))

  function open()   { state.isOpen = true }
  function close()  { state.isOpen = false }
  function toggle() { state.isOpen = !state.isOpen }

  function clearCart() {
    state.items = []
    state.cartId = null
    state.isOpen = false
  }

  // โหลดตะกร้าจาก DB เมื่อ login
  async function loadUserCart() {
    try {
      const chk = await api.chkCart()
      if (chk.cartExist) {
        state.cartId = chk.cartId
        const items = await api.getCartDetail(chk.cartId)
        // แก้: field จาก DB คือ pdId, pdName, price, qty
        state.items = items.map(i => ({
          id: i.pdId,
          name: i.pdName,
          price: Number(i.price),
          qty: Number(i.qty),
          image: i.pdImage || '',
        }))
      }
    } catch (err) {
      console.error('loadUserCart error:', err.message)
    }
  }

  async function add(product) {
    try {
      // แก้: product จาก DB ใช้ pdID, pdPrice — แต่ใน store เราแปลงเป็น id, price แล้ว
      // product ที่ส่งเข้ามาต้องมี id (= pdID) และ price (= pdPrice)
      const pdId = product.id || product.pdID
      const pdPrice = product.price || product.pdPrice

      const res = await api.addToCart(pdId, pdPrice)
      if (res.cartDtlOK) {
        state.cartId = res.cartId
        const existing = state.items.find(i => i.id === pdId)
        if (existing) {
          existing.qty++
        } else {
          state.items.push({
            id: pdId,
            name: product.name || product.pdName,
            price: Number(pdPrice),
            qty: 1,
            image: product.image || product.pdImage || '',
            volume: product.pdSize ? `${product.pdSize}ml` : '',
          })
        }
      }
      return res
    } catch (err) {
      console.error('add to cart error:', err.message)
      return { cartDtlOK: false, messageAddCartDtl: err.message }
    }
  }

  function updateQty(id, delta) {
    const item = state.items.find(i => i.id === id)
    if (!item) return
    item.qty += delta
    if (item.qty <= 0) {
      state.items = state.items.filter(i => i.id !== id)
    }
  }

  async function checkout() {
    if (!state.cartId) return { success: false, message: 'ไม่พบตะกร้า' }
    try {
      const res = await api.checkout(state.cartId)  // ✅ ไม่ส่ง email
      if (res?.success || res?.checkoutOK) clearCart()
      return res
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  return {
    state, count, total,
    open, close, toggle,
    loadUserCart, clearCart,
    add, updateQty, checkout,
  }
}