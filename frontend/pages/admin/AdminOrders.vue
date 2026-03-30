<template>
  <div class="orders-management">
    <div class="page-header">
      <h1>Order Management</h1>
      <p class="text-muted">View and manage all customer orders</p>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label>Status:</label>
        <select v-model="selectedStatus" class="filter-select">
          <option value="">All Orders</option>
          <option value="paid">Paid</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>
      <div class="filter-group">
        <input v-model="searchQuery" type="text" placeholder="Search order ID or customer..." class="search-input">
      </div>
    </div>

    <div class="card">
      <div v-if="loading" class="empty-state"><p>Loading orders...</p></div>
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
            <tr v-for="order in filteredOrders" :key="order.orderId">
              <td class="order-id">#{{ order.orderId }}</td>
              <td>{{ order.name || order.email }}</td>
              <td>{{ formatDate(order.date) }}</td>
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
                <button @click="viewOrder(order)" class="view-btn" title="View">
                  <span class="material-symbols-outlined">visibility</span>
                </button>
                <button @click="deleteOrder(order)" class="delete-btn" title="Delete">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!loading && filteredOrders.length === 0" class="empty-state">
        <span class="material-symbols-outlined">inbox</span>
        <p>No orders found</p>
      </div>
    </div>

    <div v-if="selectedOrder" class="modal-overlay" @click="selectedOrder = null">
      <div class="order-modal" @click.stop>
        <div class="modal-header">
          <h2>Order Details</h2>
          <button class="close-btn" @click="selectedOrder = null">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="order-modal-body">
          <div class="info-section">
            <h3>Order Information</h3>
            <div class="info-grid">
              <div class="info-item"><label>Order ID</label><p>#{{ selectedOrder.orderId }}</p></div>
              <div class="info-item"><label>Customer</label><p>{{ selectedOrder.name || selectedOrder.email }}</p></div>
              <div class="info-item"><label>Email</label><p>{{ selectedOrder.email }}</p></div>
              <div class="info-item"><label>Date</label><p>{{ formatDate(selectedOrder.date) }}</p></div>
              <div class="info-item"><label>Status</label>
                <p><span class="status-badge" :class="selectedOrder.status">{{ selectedOrder.status }}</span></p>
              </div>
            </div>
          </div>
          <div class="info-section">
            <h3>Products</h3>
            <div v-if="loadingDetail" style="text-align:center;padding:20px;color:var(--text-muted)">Loading...</div>
            <div v-else class="products-table">
              <div class="table-header">
                <div>Product Name</div><div>Qty</div><div>Price</div><div>Subtotal</div>
              </div>
              <div v-for="(item, i) in orderItems" :key="i" class="table-row">
                <div>{{ item.pdName }}</div>
                <div>{{ item.qty }}</div>
                <div>฿{{ Number(item.price).toLocaleString() }}</div>
                <div class="subtotal">฿{{ (item.qty * item.price).toLocaleString() }}</div>
              </div>
            </div>
          </div>
          <div class="info-section">
            <h3>Order Summary</h3>
            <div class="summary-grid">
              <div class="summary-row"><span>Total</span><span>฿{{ Number(selectedOrder.total).toLocaleString() }}</span></div>
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

      // จัดการเช็คว่าถ้ามี orderId ส่งมาจากหน้าอื่น ให้เปิด Modal
      const queryOrderId = route.query.orderId
      if (queryOrderId) {
        const targetOrder = orders.value.find(o => String(o.orderId) === String(queryOrderId))
        if (targetOrder) {
          await viewOrder(targetOrder)
        }
        // ล้าง URL ให้สะอาด ไม่ให้มี query parameter ค้างไว้
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
.orders-management { display:flex; flex-direction:column; gap:24px; }
.page-header h1 { margin:0 0 4px; font-size:24px; font-weight:900; color:var(--text-white); }
.text-muted { margin:0; font-size:14px; color:var(--text-muted); }
.filters { display:flex; gap:16px; flex-wrap:wrap; }
.filter-group { display:flex; align-items:center; gap:8px; }
.filter-group label { font-size:14px; font-weight:600; color:var(--text-light); }
.filter-select,.search-input { padding:8px 12px; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius); color:var(--text-white); font-size:13px; }
.search-input { min-width:250px; }
.filter-select:focus,.search-input:focus { outline:none; border-color:var(--primary); }
.card { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-xl); overflow:hidden; }
.table-container { overflow-x:auto; }
.orders-table { width:100%; border-collapse:collapse; }
.orders-table thead { background:var(--primary-05); border-bottom:2px solid var(--border); }
.orders-table th { padding:12px 16px; text-align:left; font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.05em; }
.orders-table td { padding:14px 16px; border-bottom:1px solid var(--border); font-size:13px; color:var(--text-light); }
.orders-table tbody tr:hover { background:var(--primary-05); }
.order-id { font-weight:700; color:var(--text-white); }
.items-count { color:var(--text-muted); }
.total { font-weight:700; color:var(--accent-gold); }
.status-select { padding:5px 8px; background:var(--bg-dark); border:1px solid var(--border); border-radius:4px; color:var(--text-white); font-size:12px; cursor:pointer; }
.status-select.paid { border-color:#4caf50; }
.status-select.delivered { border-color:#42a5f5; }
.view-btn { padding:6px 8px; background:var(--primary-10); border:1px solid var(--primary); border-radius:4px; color:var(--primary); cursor:pointer; transition:all .2s; }
.view-btn:hover { background:var(--primary); color:white; }
.view-btn .material-symbols-outlined { font-size:16px; }
.empty-state { text-align:center; padding:48px 24px; color:var(--text-dim); }
.empty-state .material-symbols-outlined { font-size:44px; display:block; margin-bottom:12px; opacity:.4; }
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; z-index:2000; padding:16px; }
.order-modal { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-xl); max-width:600px; width:100%; max-height:85vh; overflow-y:auto; display:flex; flex-direction:column; }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:20px; border-bottom:1px solid var(--border); }
.modal-header h2 { margin:0; font-size:18px; font-weight:700; color:var(--text-white); }
.close-btn { background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:20px; }
.order-modal-body { padding:20px; flex:1; }
.info-section { margin-bottom:24px; }
.info-section h3 { margin:0 0 12px; font-size:14px; font-weight:700; color:var(--text-white); text-transform:uppercase; letter-spacing:.05em; }
.info-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.info-item { display:flex; flex-direction:column; gap:4px; }
.info-item label { font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:.05em; }
.info-item p { margin:0; font-size:13px; color:var(--text-white); font-weight:600; }
.status-badge { display:inline-block; font-size:11px; font-weight:700; padding:4px 8px; border-radius:4px; text-transform:uppercase; }
.status-badge.paid { background:rgba(76,175,80,.15); color:#4caf50; }
.status-badge.delivered { background:rgba(33,150,243,.15); color:#42a5f5; }
.products-table { background:var(--primary-05); border-radius:var(--radius); overflow:hidden; }
.products-table .table-header { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:12px; padding:12px; background:var(--primary-10); font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; border-bottom:1px solid var(--border); }
.products-table .table-row { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:12px; align-items:center; padding:12px; border-bottom:1px solid var(--border); font-size:13px; color:var(--text-light); }
.products-table .table-row:last-child { border-bottom:none; }
.subtotal { font-weight:700; color:var(--text-white); }
.summary-grid { background:var(--primary-05); padding:12px; border-radius:var(--radius); }
.summary-row { display:flex; justify-content:space-between; font-size:13px; color:var(--text-light); font-weight:700; }
.modal-footer { padding:16px 20px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; }
.btn { padding:8px 16px; border-radius:var(--radius); font-size:13px; font-weight:600; cursor:pointer; border:none; transition:all .2s; display:inline-flex; align-items:center; gap:6px; }
.btn-secondary { background:var(--primary-10); color:var(--primary); border:1px solid var(--primary-20); }
.btn-secondary:hover { background:var(--primary-20); }
.btn-danger { background:rgba(211,47,47,.15); color:#ef5350; border:1px solid rgba(211,47,47,.3); }
.btn-danger:hover { background:rgba(211,47,47,.3); }
.btn .material-symbols-outlined { font-size:16px; }
.action-cell { display:flex; gap:6px; align-items:center; }
.delete-btn { padding:6px 8px; background:rgba(211,47,47,.1); border:1px solid rgba(211,47,47,.3); border-radius:4px; color:#ef5350; cursor:pointer; transition:all .2s; }
.delete-btn:hover { background:rgba(211,47,47,.3); }
.delete-btn .material-symbols-outlined { font-size:16px; }
.modal-footer { display:flex; justify-content:space-between; align-items:center; }
</style>