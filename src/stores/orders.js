import { MOCK_ORDERS } from '../data/mockData'

export function useOrders() {
  function getUserOrders(userId) {
    const saved = localStorage.getItem(`orders_${userId}`)
    const local = saved ? JSON.parse(saved) : []
    const mock = MOCK_ORDERS.filter(o => o.userId === userId)
    const localIds = new Set(local.map(o => o.id))
    return [...local, ...mock.filter(o => !localIds.has(o.id))]
  }

  function addOrder(userId, order) {
    const existing = JSON.parse(localStorage.getItem(`orders_${userId}`) || '[]')
    existing.unshift({ ...order, userId })
    localStorage.setItem(`orders_${userId}`, JSON.stringify(existing))
  }

  return { getUserOrders, addOrder }
}
