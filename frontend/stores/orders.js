import api from '../services/api'

export function useOrders() {
  // แก้: ดึงประวัติคำสั่งซื้อจาก DB จริงแทน localStorage
  async function getUserOrders() {
    try {
      const res = await api.getOrderHistory()
      const raw = res?.history ?? (Array.isArray(res) ? res : [])

      // ✅ map field ให้ตรงกับที่ template ใช้
      return raw.map(o => ({
        cartId:      o.orderId,
        date:        o.date,
        status:      o.status,
        total_price: Number(o.total || 0),
        // items จาก API เป็น string เช่น "Leo x1, Chang x2"
        // แปลงเป็น array เพื่อให้ template วนได้
        items: (o.items || '').split(', ').filter(Boolean).map(str => {
          const match = str.match(/^(.+)\s+x(\d+)$/)
          return match
            ? { pdName: match[1], qty: Number(match[2]), price: 0 }
            : { pdName: str, qty: 1, price: 0 }
        })
      }))
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