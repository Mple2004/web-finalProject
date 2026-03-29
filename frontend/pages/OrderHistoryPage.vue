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
    <Teleport to="body">
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
    </Teleport>
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
    const res = await orders.getUserOrders()
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
  if (!selectedOrderData.value?.items?.length) return
  try {
    for (const item of selectedOrderData.value.items) {
      const pdId    = item.pdId || item.pdID
      const pdPrice = Number(item.pdPrice || item.price || 0)
      if (!pdId || !pdPrice) continue
      await api.addToCart(pdId, pdPrice, item.qty)
    }
    await cart.loadUserCart()
    toast.show('✓ Items added to cart')
    closeModal()
    router.push('/checkout')
  } catch (err) {
    toast.show(`✗ Failed to reorder: ${err.message}`)
  }
}
</script>

<style scoped>
.order-history-page {
  min-height: 100vh;
  background: var(--bg-dark);
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.history-header {
  max-width: 1200px;
  margin: 0 auto 40px;
}

.history-header h1 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: var(--text-white);
}

/* Filter Bar */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-group label {
  color: var(--text-light);
  font-weight: 500;
  font-size: 0.9rem;
}

.filter-info {
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* Orders Grid */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .orders-grid {
    grid-template-columns: 1fr;
  }
}

/* Order Card */
.order-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.order-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary);
  box-shadow: 0 8px 24px rgba(212, 17, 50, 0.15);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.order-id-date {
  flex: 1;
}

.order-id {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-white);
  margin-bottom: 4px;
}

.order-date {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.order-status {
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  text-transform: uppercase;
}

.order-status.processing {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.order-status.shipped {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.order-status.delivered {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.order-status.cancelled {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Order Items Preview */
.order-items-preview {
  margin-bottom: 16px;
  flex: 1;
}

.items-count {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.item-badge {
  display: inline-block;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.75rem;
  color: var(--text-light);
  line-height: 1.4;
}

.item-badge.more {
  background: rgba(212, 17, 50, 0.1);
  border-color: var(--primary);
  color: var(--primary);
}

/* Order Footer */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.order-total {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
}

.view-details-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(212, 17, 50, 0.1);
  border: 1px solid var(--primary);
  border-radius: var(--radius);
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.view-details-btn:hover {
  background: var(--primary);
  color: white;
}

.view-details-btn .material-symbols-outlined {
  font-size: 1rem;
}

/* Modal */
.modal-content {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  font-size: 1.3rem;
  color: var(--text-white);
  margin-bottom: 4px;
}

.modal-date {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  color: var(--text-muted);
  transition: all 0.2s;
  cursor: pointer;
  background: none;
  border: none;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-white);
}

/* Modal Body */
.modal-body {
  padding: 24px;
}

.status-section {
  text-align: center;
  margin-bottom: 32px;
  padding: 20px;
  background: rgba(34, 197, 94, 0.05);
  border-radius: var(--radius-lg);
}

.order-status-large {
  display: inline-block;
  padding: 8px 20px;
  border-radius: var(--radius-full);
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
}

.order-status-large.processing {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.order-status-large.shipped {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
}

.order-status-large.delivered {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.order-status-large.cancelled {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.delivery-estimate {
  margin-top: 12px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.modal-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-white);
  margin-bottom: 16px;
}

/* Items Detail List */
.items-detail-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 0.95rem;
  color: var(--text-white);
  margin-bottom: 4px;
  font-weight: 500;
}

.item-qty {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.item-price {
  text-align: right;
}

.item-price p {
  font-size: 0.9rem;
  color: var(--text-light);
  margin: 0;
}

.item-price p:first-child {
  font-weight: 600;
  color: var(--primary);
}

.item-subtotal {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Summary Section */
.summary-section {
  background: rgba(255, 255, 255, 0.03);
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.summary-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.summary-row span:last-child {
  color: var(--text-light);
  font-weight: 500;
}

.summary-divider {
  height: 1px;
  background: var(--border);
  margin: 8px 0;
}

.summary-row.total {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-white);
}

.total-amount {
  color: var(--primary);
}

/* Modal Footer */

.modal-overlay {
  position: fixed;      /* ✅ fixed ไม่ใช่ absolute */
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;  /* ✅ กลางแนวตั้ง */
  justify-content: center; /* ✅ กลางแนวนอน */
  padding: 16px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid var(--border);
}

.modal-footer button,
.modal-footer a {
  flex: 1;
  padding: 12px 16px;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  text-decoration: none;
  display: inline-block;
}
.modal-content {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;     /* ✅ ไม่เกิน 90% ของหน้าจอ */
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.btn-secondary { background: transparent; border: 1px solid var(--border); color: var(--text-light); }
.btn-secondary:hover { background: rgba(255,255,255,0.05); border-color: var(--text-light); }
.btn-primary { background: var(--primary); color: white; }
.btn-primary:hover { background: var(--primary-hover); }

@media (max-width: 768px) {
  .order-id {
    font-size: 1rem;
  }

  .modal-content {
    max-height: 100vh;
    border-radius: var(--radius);
  }

  .modal-footer {
    flex-direction: column;
  }
}

/* Entrance animations */
.orders-grid { animation: fadeUp 0.5s ease 0.2s both; }
.order-card  { animation: fadeUp 0.4s ease both; }
.order-card:nth-child(1) { animation-delay: 0.05s; }
.order-card:nth-child(2) { animation-delay: 0.12s; }
.order-card:nth-child(3) { animation-delay: 0.19s; }
.order-card:nth-child(4) { animation-delay: 0.26s; }
.order-card:nth-child(5) { animation-delay: 0.33s; }
</style>