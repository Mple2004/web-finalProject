<template>
  <div class="orders-management">
    <div class="page-header">
      <h1>Order Management</h1>
      <p class="text-muted">View and manage all customer orders</p>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <label>Filter by Status:</label>
        <select v-model="selectedStatus" class="filter-select">
          <option value="">All Orders</option>
          <option value="Processing">Processing</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>
      <div class="filter-group">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search order ID..."
          class="search-input"
        >
      </div>
    </div>

    <!-- Orders Table -->
    <div class="card">
      <div class="table-container">
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
            <tr v-for="order in filteredOrders" :key="order.historyID">
              <td class="order-id">{{ order.orderId }}</td>
              <td>{{ getCustomerName(order.email) }}</td>
              <td>{{ formatDate(order.date) }}</td>
              <td class="items-count">{{ order.products.length }} item(s)</td>
              <td class="total">฿{{ order.total_price.toLocaleString() }}</td>
              <td>
                <div class="status-select-wrapper">
                  <select 
                    :value="order.status"
                    @change="(e) => updateOrderStatus(order.historyID, e.target.value)"
                    class="status-select"
                    :class="order.status.toLowerCase()"
                  >
                    <option>Processing</option>
                    <option>Delivered</option>
                  </select>
                </div>
              </td>
              <td>
                <button @click="selectedOrder = order" class="view-btn">
                  <span class="material-symbols-outlined">visibility</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredOrders.length === 0" class="empty-state">
        <span class="material-symbols-outlined">inbox</span>
        <p>No orders found</p>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <div v-if="selectedOrder" class="modal-overlay" @click="selectedOrder = null">
      <div class="order-modal" @click.stop>
        <div class="modal-header">
          <h2>Order Details</h2>
          <button class="close-btn" @click="selectedOrder = null">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="order-modal-body">
          <!-- Order Info -->
          <div class="info-section">
            <h3>Order Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Order ID</label>
                <p>{{ selectedOrder.orderId }}</p>
              </div>
              <div class="info-item">
                <label>Customer</label>
                <p>{{ getCustomerName(selectedOrder.email) }}</p>
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
                <p class="status-badge" :class="selectedOrder.status.toLowerCase()">
                  {{ selectedOrder.status }}
                </p>
              </div>
            </div>
          </div>

          <!-- Products -->
          <div class="info-section">
            <h3>Products</h3>
            <div class="products-table">
              <div class="table-header">
                <div>Product Name</div>
                <div>Qty</div>
                <div>Price</div>
                <div>Subtotal</div>
              </div>
              <div v-for="(product, i) in selectedOrder.products" :key="i" class="table-row">
                <div>{{ product.pdName }}</div>
                <div>{{ product.qty }}</div>
                <div>฿{{ product.price.toLocaleString() }}</div>
                <div class="subtotal">฿{{ (product.qty * product.price).toLocaleString() }}</div>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="info-section">
            <h3>Order Summary</h3>
            <div class="summary-grid">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>฿{{ selectedOrder.total_price.toLocaleString() }}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span>฿0.00</span>
              </div>
              <div class="summary-row total">
                <span>Total</span>
                <span>฿{{ selectedOrder.total_price.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="selectedOrder = null">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MOCK_HISTORY, mockUsers } from '../../data/mockData'
import { useToast } from '../../stores/toast'
import { useRoute } from 'vue-router'

const toast = useToast()
const route = useRoute()
const selectedStatus = ref('')
const searchQuery = ref('')
const selectedOrder = ref(null)
const orders = ref([...MOCK_HISTORY])

onMounted(() => {
  if (route.query.order) {
    selectedOrder.value = orders.value.find(o => o.orderId === route.query.order) || null
  }
})

// Filter orders
const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    const matchStatus = !selectedStatus.value || order.status === selectedStatus.value
    const matchSearch = !searchQuery.value || order.orderId.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchStatus && matchSearch
  })
})

// Get customer name
function getCustomerName(email) {
  const user = mockUsers.find(u => u.email === email)
  return user?.name || email
}

// Format date
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Update order status
function updateOrderStatus(historyID, newStatus) {
  const order = orders.value.find(o => o.historyID === historyID)
  if (order) {
    order.status = newStatus
    toast.show(`✓ Order ${order.orderId} updated to ${newStatus}`)
    if (selectedOrder.value?.historyID === historyID) {
      selectedOrder.value.status = newStatus
    }
  }
}
</script>

<style scoped>
.orders-management {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ── Filters ─────────────────────────────────────– */
.filters {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-light);
}

.filter-select,
.search-input {
  padding: 8px 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-white);
  font-size: 13px;
}

.search-input {
  min-width: 250px;
}

.filter-select:focus,
.search-input:focus {
  outline: none;
  border-color: var(--primary);
}

/* ── Card ────────────────────────────────────────– */
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

/* ── Table ───────────────────────────────────────– */
.table-container {
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table thead {
  background: var(--primary-05);
  border-bottom: 2px solid var(--border);
}

.orders-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.orders-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  color: var(--text-light);
}

.orders-table tbody tr:hover {
  background: var(--primary-05);
}

.order-id {
  font-weight: 700;
  color: var(--text-white);
}

.items-count {
  color: var(--text-muted);
}

.total {
  font-weight: 700;
  color: var(--accent-gold);
}

.status-select-wrapper {
  position: relative;
}

.status-select {
  padding: 6px 8px;
  background: var(--bg-dark);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-white);
  font-size: 12px;
  cursor: pointer;
}

.status-select.processing {
  border-color: #ffc107;
}

.status-select.delivered {
  border-color: #4caf50;
}

.view-btn {
  padding: 6px 8px;
  background: var(--primary-10);
  border: 1px solid var(--primary);
  border-radius: 4px;
  color: var(--primary);
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  background: var(--primary);
  color: white;
}

.view-btn .material-symbols-outlined {
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-dim);
}

.empty-state .material-symbols-outlined {
  font-size: 44px;
  display: block;
  margin-bottom: 12px;
  opacity: 0.4;
}

/* ── Modal ───────────────────────────────────────– */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:2000; padding:16px; }
.order-modal { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-xl); max-width:600px; width:100%; max-height:85vh; overflow-y:auto; display:flex; flex-direction:column; animation:slideUp 0.3s ease; }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-white);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 20px;
}

.close-btn:hover {
  color: var(--text-white);
}

.order-modal-body {
  padding: 20px;
  flex: 1;
}

.info-section {
  margin-bottom: 24px;
}

.info-section h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-white);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-item p {
  margin: 0;
  font-size: 13px;
  color: var(--text-white);
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

.status-badge.processing {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.status-badge.delivered {
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
}

/* ── Products Table ──────────────────────────────– */
.products-table {
  background: var(--primary-05);
  border-radius: var(--radius);
  overflow: hidden;
}

.products-table .table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 12px;
  padding: 12px;
  background: var(--primary-10);
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  border-bottom: 1px solid var(--border);
}

.products-table .table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  color: var(--text-light);
}

.products-table .table-row:last-child {
  border-bottom: none;
}

.products-table .subtotal {
  font-weight: 700;
  color: var(--text-white);
}

/* ── Summary ────────────────────────────────────– */
.summary-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--primary-05);
  padding: 12px;
  border-radius: var(--radius);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-light);
}

.summary-row.total {
  border-top: 1px solid var(--border);
  padding-top: 12px;
  margin-top: 4px;
  font-weight: 700;
  color: var(--text-white);
}

/* ── Modal Footer ────────────────────────────────– */
.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-secondary {
  background: var(--primary-10);
  color: var(--primary);
  border: 1px solid var(--primary-20);
}

.btn-secondary:hover {
  background: var(--primary-20);
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }

  .search-input {
    min-width: auto;
    width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .order-modal {
    max-width: 100%;
  }
}
</style>
