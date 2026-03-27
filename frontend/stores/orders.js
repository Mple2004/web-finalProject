import api from '../services/api'

export function useOrders() {
  // แก้: ดึงประวัติคำสั่งซื้อจาก DB จริงแทน localStorage
  async function getUserOrders(email) {
    try {
      const res = await api.getOrderHistory(email)
      if (res.success) {
        return res.history // array ของ carts ที่ status = 'paid'
      }
      return []
    } catch (err) {
      console.error('getUserOrders error:', err.message)
      return []
    }
  }

  // ดึงรายละเอียดสินค้าในแต่ละ order
  async function getOrderItems(cartId) {
    try {
      const res = await api.getOrderDetail(cartId)
      if (res.success) return res.items
      return []
    } catch (err) {
      console.error('getOrderItems error:', err.message)
      return []
    }
  }

  return { getUserOrders, getOrderItems }
}