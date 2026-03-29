<template>
  <main class="order-history-page">
    <div class="history-header">
      <h1>📦 My Orders</h1>
      <nav class="breadcrumbs">
        <router-link to="/" class="crumb-link">Home</router-link>
        <span class="material-symbols-outlined crumb-sep">chevron_right</span>
        <span class="crumb-current">My Orders</span>
      </nav>
    </div>

    <div v-if="!isLoggedIn" class="container login-required">
      <div class="empty-state">
        <span class="material-symbols-outlined empty-icon">lock</span>
        <h2>Please Log In</h2>
        <p>You need to be logged in to view your order history.</p>
        <router-link to="/login" class="btn-primary">Go to Login</router-link>
      </div>
    </div>

    <div v-else class="container">
      <!-- Loading -->
      <div v-if="loading" class="empty-state">
        <span class="material-symbols-outlined empty-icon" style="animation: pulse 1s infinite">hourglass_empty</span>
        <p>Loading orders...</p>
      </div>

      <div v-else-if="userOrders.length === 0" class="empty-state">
        <span class="material-symbols-outlined empty-icon">shopping_cart</span>
        <h2>No Orders Yet</h2>
        <p>Start shopping to see your order history here.</p>
        <router-link to="/" class="btn-primary">Continue Shopping</router-link>
      </div>

      <div v-else class="orders-wrapper">
        <div class="filter-bar">
          <div class="filter-group">
            <label for="status-filter">Filter by Status:</label>
            <select v-model="selectedStatus" id="status-filter" class="filter-select">
              <option value="">All Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div class="filter-info">Total: {{ filteredOrders.length }} order(s)</div>
        </div>

        <div class="orders-grid">
          <div
            v-for="order in filteredOrders"
            :key="order.cartId"
            class="order-card"
            @click="selectOrder(order)"
          >
            <div class="order-header">
              <div class="order-id-date">
                <h3 class="order-id">#{{ order.cartId }}</h3>
                <p class="order-date">{{ formatDate(order.date) }}</p>
              </div>
              <span :class="['order-status', (order.status || 'processing').toLowerCase()]">
                {{ order.status || 'Processing' }}
              </span>
            </div>

            <div class="order-items-preview">
              <p class="items-count">{{ order.items?.length || 0 }} item(s)</p>
              <div class="items-list">
                <span v-for="(item, idx) in (order.items || []).slice(0, 2)" :key="idx" class="item-badge">
                  {{ item.pdName || item.name }} (x{{ item.qty }})
                </span>
                <span v-if="(order.items?.length || 0) > 2" class="item-badge more">
                  +{{ order.items.length - 2 }} more
                </span>
              </div>
            </div>

            <div class="order-footer">
              <span class="order-total">฿{{ Number(order.total_price || 0).toFixed(2) }}</span>
              <button @click.stop="selectOrder(order)" class="view-details-btn">
                View Details
                <span class="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <div v-if="selectedOrderData" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content order-detail-modal" @click.stop>
        <div class="modal-header">
          <div>
            <h2>#{{ selectedOrderData.cartId }}</h2>
            <p class="modal-date">{{ formatDate(selectedOrderData.date) }}</p>
          </div>
          <button @click="closeModal" class="close-btn">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="status-section">
            <span :class="['order-status-large', (selectedOrderData.status || 'processing').toLowerCase()]">
              {{ selectedOrderData.status || 'Processing' }}
            </span>
            <p class="delivery-estimate">Estimated delivery: 3-5 business days</p>
          </div>

          <div class="modal-section">
            <h3 class="section-title">Order Items</h3>
            <div class="items-detail-list">
              <div v-for="(item, idx) in (selectedOrderData.items || [])" :key="idx" class="item-detail-row">
                <div class="item-info">
                  <p class="item-name">{{ item.pdName || item.name }}</p>
                  <p class="item-qty">Quantity: {{ item.qty }}</p>
                </div>
                <div class="item-price">
                  <p>฿{{ Number(item.pdPrice || item.price || 0).toFixed(2) }}</p>
                  <p class="item-subtotal">Subtotal: ฿{{ (Number(item.pdPrice || item.price || 0) * item.qty).toFixed(2) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-section summary-section">
            <h3 class="section-title">Order Summary</h3>
            <div class="summary-detail">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>฿{{ subtotalFromOrder.toFixed(2) }}</span>
              </div>
              <div class="summary-row">
                <span>Tax (7%)</span>
                <span>฿{{ taxFromOrder.toFixed(2) }}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span>฿{{ shippingFromOrder.toFixed(2) }}</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row total">
                <span>Total Amount</span>
                <span class="total-amount">฿{{ Number(selectedOrderData.total_price || 0).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">Close</button>
          <button @click="reorderItems" class="btn-primary">Order Again</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'
import { useCart } from '../stores/cart'
import { useToast } from '../stores/toast'
import { useOrders } from '../stores/orders'
import api from '../services/api'

const router = useRouter()
const auth = useAuth()
const cart = useCart()
const toast = useToast()
const orders = useOrders()

const isLoggedIn = auth.isLoggedIn
const user = auth.user

const userOrders = ref([])
const loading = ref(false)
const selectedStatus = ref('')
const selectedOrderData = ref(null)

// ✅ fetch จาก API จริง
onMounted(async () => {
  if (!isLoggedIn.value) return
  loading.value = true
  try {
    const res = await orders.getUserOrders(user.value.email)
    // รองรับทั้ง array และ { history: [...] }
    const raw = Array.isArray(res) ? res : (res?.history ?? res?.data ?? [])

    // ✅ fetch items ของแต่ละ order
    userOrders.value = await Promise.all(
      raw.map(async (order) => {
        try {
          const detail = await api.getOrderDetail(order.cartId || order.cart_id)
          const items = Array.isArray(detail) ? detail : (detail?.items ?? detail?.data ?? [])
          return { ...order, items }
        } catch {
          return { ...order, items: [] }
        }
      })
    )

    // เรียงตามวันที่ล่าสุดก่อน
    userOrders.value.sort((a, b) => new Date(b.date) - new Date(a.date))
  } catch (err) {
    console.error('Failed to load orders:', err.message)
    userOrders.value = []
  } finally {
    loading.value = false
  }
})

const filteredOrders = computed(() => {
  if (!selectedStatus.value) return userOrders.value
  return userOrders.value.filter(o => o.status === selectedStatus.value)
})

const subtotalFromOrder = computed(() => {
  if (!selectedOrderData.value?.items) return 0
  return selectedOrderData.value.items.reduce((sum, item) =>
    sum + Number(item.pdPrice || item.price || 0) * item.qty, 0)
})
const taxFromOrder      = computed(() => Math.round(subtotalFromOrder.value * 0.07 * 100) / 100)
const shippingFromOrder = computed(() => subtotalFromOrder.value > 1000 ? 0 : 100)

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function selectOrder(order) {
  selectedOrderData.value = JSON.parse(JSON.stringify(order))
}

function closeModal() {
  selectedOrderData.value = null
}

async function reorderItems() {
  if (!selectedOrderData.value?.items) return
  for (const item of selectedOrderData.value.items) {
    try {
      // ✅ fetch product จาก API จริง
      const product = await api.getProductById(item.pdId || item.pdID)
      if (product) {
        for (let i = 0; i < item.qty; i++) {
          cart.add(product)
        }
      }
    } catch { /* skip */ }
  }
  toast.show('✓ Items added to cart')
  closeModal()
  router.push('/checkout')
}
</script>