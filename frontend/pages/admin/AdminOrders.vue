<template>
  <div class="orders-management">
    <!-- Filters -->
    <div class="filters">
      <div class="search-wrap">
        <span class="material-symbols-outlined search-icon">search</span>
        <input v-model="searchQuery" type="text" placeholder="Search order ID or customer…" class="search-input">
        <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <select v-model="selectedStatus" class="filter-select">
        <option value="">All Statuses</option>
        <option value="paid">Paid</option>
        <option value="delivered">Delivered</option>
      </select>
    </div>

    <div class="card">
      <div v-if="loading" class="loading-state">
        <span class="spinner-ring"></span>
        <p>Loading orders…</p>
      </div>
      <div v-else class="table-container">
        <table class="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredOrders.length === 0">
              <td colspan="7" class="empty-cell">
                <span class="material-symbols-outlined">inbox</span>
                <p>No orders found</p>
              </td>
            </tr>
            <tr v-for="order in filteredOrders" :key="order.orderId">
              <td class="order-id">#{{ order.orderId }}</td>
              <td>{{ order.name || order.email }}</td>
              <td class="date">{{ formatDate(order.date) }}</td>
              <td class="items-count">{{ order.itemCount }} item(s)</td>
              <td class="total">฿{{ Number(order.total).toLocaleString() }}</td>
              <td>
                <select
                  :value="order.status"
                  @change="(e) => updateStatus(order, e.target.value)"
                  class="status-select"
                  :class="order.status"
                >
                  <option value="paid">paid</option>
                  <option value="delivered">delivered</option>
                </select>
              </td>
              <td class="action-cell">
                <button @click="viewOrder(order)" class="icon-btn view" title="View details">
                  <span class="material-symbols-outlined">visibility</span>
                </button>
                <button @click="deleteOrder(order)" class="icon-btn delete" title="Delete">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <div v-if="selectedOrder" class="modal-overlay" @click="selectedOrder = null">
      <div class="order-modal" @click.stop>
        <div class="modal-header">
          <div>
            <h2>Order Details</h2>
            <p class="modal-sub">Order #{{ selectedOrder.orderId }}</p>
          </div>
          <button class="close-btn" @click="selectedOrder = null">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="order-modal-body">
          <div class="info-section">
            <h3>Order Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Customer</label>
                <p>{{ selectedOrder.name || selectedOrder.email }}</p>
              </div>
              <div class="info-item">
                <label>Email</label>
                <p>{{ selectedOrder.email }}</p>
              </div>
              <div class="info-item">
                <label>Date</label>
                <p>{{ formatDate(selectedOrder.date) }}</p>
              </div>
              <div class="info-item">
                <label>Status</label>
                <p><span class="status-badge" :class="selectedOrder.status">{{ selectedOrder.status }}</span></p>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h3>Products</h3>
            <div v-if="loadingDetail" class="detail-loading">
              <span class="spinner-ring small"></span> Loading…
            </div>
            <div v-else class="products-table">
              <div class="pt-header">
                <div>Product</div><div>Qty</div><div>Price</div><div>Subtotal</div>
              </div>
              <div v-for="(item, i) in orderItems" :key="i" class="pt-row">
                <div>{{ item.pdName }}</div>
                <div>{{ item.qty }}</div>
                <div>฿{{ Number(item.price).toLocaleString() }}</div>
                <div class="subtotal">฿{{ (item.qty * item.price).toLocaleString() }}</div>
              </div>
            </div>
          </div>

          <div class="info-section">
            <div class="total-row">
              <span>Order Total</span>
              <span class="total-val">฿{{ Number(selectedOrder.total).toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-danger" @click="deleteOrder(selectedOrder)">
            <span class="material-symbols-outlined">delete</span> Delete Order
          </button>
          <button class="btn btn-secondary" @click="selectedOrder = null">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'
import { useToast } from '../../stores/toast'

const toast = useToast()
const route = useRoute()
const router = useRouter()

const orders = ref([])
const loading = ref(true)
const selectedStatus = ref('')
const searchQuery = ref('')
const selectedOrder = ref(null)
const orderItems = ref([])
const loadingDetail = ref(false)

const filteredOrders = computed(() =>
  orders.value.filter(o => {
    const matchStatus = !selectedStatus.value || o.status === selectedStatus.value
    const matchSearch = !searchQuery.value ||
      String(o.orderId).includes(searchQuery.value) ||
      (o.name || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      o.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchStatus && matchSearch
  })
)

onMounted(async () => {
  try {
    const res = await api.getAllOrders()
    if (res.success) {
      orders.value = res.orders
      const queryOrderId = route.query.orderId
      if (queryOrderId) {
        const targetOrder = orders.value.find(o => String(o.orderId) === String(queryOrderId))
        if (targetOrder) await viewOrder(targetOrder)
        router.replace({ path: '/admin/orders' })
      }
    }
  } catch (err) {
    toast.show('✗ Failed to load orders')
  } finally {
    loading.value = false
  }
})

async function viewOrder(order) {
  selectedOrder.value = order
  orderItems.value = []
  loadingDetail.value = true
  try {
    const res = await api.getOrderDetail(order.orderId)
    orderItems.value = res.success ? res.items : []
  } catch {
    orderItems.value = []
  } finally {
    loadingDetail.value = false
  }
}

async function updateStatus(order, newStatus) {
  try {
    const res = await api.updateOrderStatus(order.orderId, newStatus)
    if (res.success) {
      order.status = newStatus
      if (selectedOrder.value?.orderId === order.orderId) {
        selectedOrder.value.status = newStatus
      }
      toast.show(`✓ Order #${order.orderId} updated to ${newStatus}`)
    }
  } catch (err) {
    toast.show(`✗ Error: ${err.message}`)
  }
}

async function deleteOrder(order) {
  if (!confirm(`Delete order #${order.orderId}? This cannot be undone.`)) return
  try {
    const res = await api.deleteOrder(order.orderId)
    if (res.success) {
      orders.value = orders.value.filter(o => o.orderId !== order.orderId)
      if (selectedOrder.value?.orderId === order.orderId) selectedOrder.value = null
      toast.show(`✓ Order #${order.orderId} deleted`)
    } else {
      toast.show(`✗ ${res.message || 'Failed to delete'}`)
    }
  } catch (err) {
    toast.show(`✗ ${err.response?.data?.message || err.message}`)
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.orders-management { display: flex; flex-direction: column; gap: 20px; }

/* Filters */
.filters { display: flex; gap: 12px; flex-wrap: wrap; }
.search-wrap {
  position: relative; flex: 1; min-width: 260px;
  display: flex; align-items: center;
}
.search-icon {
  position: absolute; left: 12px; font-size: 18px;
  color: var(--text-muted); pointer-events: none;
}
.search-input {
  width: 100%; padding: 10px 36px 10px 40px;
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-white); font-size: 13px;
}
.search-input:focus { outline: none; border-color: var(--primary); }
.search-clear {
  position: absolute; right: 10px;
  background: none; border: none; color: var(--text-muted);
  cursor: pointer; display: flex; align-items: center; padding: 4px;
}
.search-clear:hover { color: var(--text-white); }
.search-clear .material-symbols-outlined { font-size: 16px; }
.filter-select {
  padding: 10px 12px; background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-white); font-size: 13px;
}
.filter-select:focus { outline: none; border-color: var(--primary); }

/* Loading */
.loading-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 60px; gap: 12px; color: var(--text-muted);
}
.spinner-ring {
  width: 36px; height: 36px; border: 3px solid var(--border);
  border-top-color: var(--primary); border-radius: 50%;
  animation: spin 0.8s linear infinite; display: inline-block;
}
.spinner-ring.small { width: 18px; height: 18px; border-width: 2px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Card / Table */
.card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-xl); overflow: hidden; }
.table-container { overflow-x: auto; }
.orders-table { width: 100%; border-collapse: collapse; }
.orders-table thead { background: var(--primary-05); border-bottom: 1px solid var(--border); }
.orders-table th {
  padding: 11px 16px; text-align: left; font-size: 11px;
  font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .07em;
}
.orders-table td { padding: 13px 16px; border-bottom: 1px solid var(--border); font-size: 13px; color: var(--text-light); }
.orders-table tbody tr:hover { background: var(--primary-05); }
.orders-table tbody tr:last-child td { border-bottom: none; }

.order-id { font-weight: 700; color: var(--text-white); }
.date { color: var(--text-muted); }
.items-count { color: var(--text-muted); }
.total { font-weight: 700; color: var(--accent-gold); }

.empty-cell { text-align: center; padding: 56px 24px; color: var(--text-dim); }
.empty-cell .material-symbols-outlined { font-size: 44px; display: block; margin-bottom: 12px; opacity: .4; }

.status-select {
  padding: 5px 8px; background: var(--bg-dark); border: 1px solid var(--border);
  border-radius: 4px; color: var(--text-white); font-size: 12px; cursor: pointer;
}
.status-select.paid      { border-color: #4caf50; }
.status-select.delivered { border-color: #42a5f5; }

.action-cell { display: flex; gap: 6px; align-items: center; }
.icon-btn {
  width: 32px; height: 32px; border-radius: var(--radius);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; border: 1px solid transparent;
}
.icon-btn .material-symbols-outlined { font-size: 16px; }
.icon-btn.view {
  background: var(--primary-10); border-color: var(--primary-20); color: var(--primary);
}
.icon-btn.view:hover { background: var(--primary); color: white; }
.icon-btn.delete {
  background: rgba(211,47,47,.1); border-color: rgba(211,47,47,.2); color: #ef5350;
}
.icon-btn.delete:hover { background: rgba(211,47,47,.25); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.65);
  display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 16px;
}
.order-modal {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius-xl); max-width: 580px; width: 100%;
  max-height: 88vh; overflow-y: auto;
  display: flex; flex-direction: column;
}
.modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid var(--border);
}
.modal-header h2 { margin: 0; font-size: 17px; font-weight: 700; color: var(--text-white); }
.modal-sub { margin: 4px 0 0 0; font-size: 12px; color: var(--text-muted); }
.close-btn {
  background: none; border: none; color: var(--text-muted);
  cursor: pointer; padding: 2px; border-radius: var(--radius);
  transition: color 0.2s;
}
.close-btn:hover { color: var(--text-white); }
.close-btn .material-symbols-outlined { font-size: 22px; }

.order-modal-body { padding: 20px 24px; flex: 1; display: flex; flex-direction: column; gap: 20px; }
.info-section h3 {
  margin: 0 0 12px; font-size: 11px; font-weight: 700;
  color: var(--text-muted); text-transform: uppercase; letter-spacing: .08em;
}
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.info-item { display: flex; flex-direction: column; gap: 4px; }
.info-item label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; }
.info-item p { margin: 0; font-size: 13px; color: var(--text-white); font-weight: 600; }

.status-badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; }
.status-badge.paid      { background: rgba(76,175,80,.15);  color: #4caf50; }
.status-badge.delivered { background: rgba(33,150,243,.15); color: #42a5f5; }

.detail-loading { display: flex; align-items: center; gap: 8px; color: var(--text-muted); padding: 16px 0; font-size: 13px; }

.products-table { background: var(--bg-dark); border-radius: var(--radius); overflow: hidden; }
.pt-header {
  display: grid; grid-template-columns: 2fr 0.6fr 1fr 1fr;
  gap: 8px; padding: 10px 14px; font-size: 11px; font-weight: 700;
  color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border);
}
.pt-row {
  display: grid; grid-template-columns: 2fr 0.6fr 1fr 1fr;
  gap: 8px; align-items: center; padding: 11px 14px;
  border-bottom: 1px solid var(--border); font-size: 13px; color: var(--text-light);
}
.pt-row:last-child { border-bottom: none; }
.subtotal { font-weight: 700; color: var(--text-white); }

.total-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px; background: var(--bg-dark); border-radius: var(--radius);
  font-size: 14px; font-weight: 700; color: var(--text-light);
}
.total-val { font-size: 18px; color: var(--accent-gold); }

.modal-footer {
  padding: 16px 24px; border-top: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
}
.btn {
  padding: 9px 18px; border-radius: var(--radius); font-size: 13px;
  font-weight: 600; cursor: pointer; border: none; transition: all .2s;
  display: inline-flex; align-items: center; gap: 6px;
}
.btn .material-symbols-outlined { font-size: 16px; }
.btn-secondary { background: var(--primary-10); color: var(--primary); border: 1px solid var(--primary-20); }
.btn-secondary:hover { background: var(--primary-20); }
.btn-danger { background: rgba(211,47,47,.12); color: #ef5350; border: 1px solid rgba(211,47,47,.25); }
.btn-danger:hover { background: rgba(211,47,47,.25); }
</style>
