<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Dashboard Overview</h1>
      <p class="text-muted">Monitor your store performance</p>
    </div>

    <!-- Key Metrics -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon revenue">
          <span class="material-symbols-outlined">trending_up</span>
        </div>
        <div class="metric-content">
          <p class="metric-label">Total Revenue</p>
          <p class="metric-value">฿{{ dashboardData.summary?.totalRevenue?.toLocaleString()|| '0' }}</p>
          <p class="metric-change positive">+{{ dashboardData.summary?.totalOrders||0 }} orders</p>
        </div>
      </div>


      <div class="metric-card">
        <div class="metric-icon products">
          <span class="material-symbols-outlined">inventory_2</span>
        </div>
        <div class="metric-content">
          <p class="metric-label">total Seller</p>
          <p class="metric-value">{{ dashboardData.summary?.totalOrders || 0}}</p>
          <p class="metric-change">Total units: {{ dashboardData.summary?.totalUnits || 0 }}</p>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon stock">
          <span class="material-symbols-outlined">warning</span>
        </div>
        <div class="metric-content">
          <p class="metric-label">Low Stock Alert</p>
          <p class="metric-value">{{ dashboardData.summary?.lowStockCount || 0 }}</p>
          <p class="metric-change warning">Requires action</p>
        </div>
        <!-- <div class="stock-alerts-list" v-if="dashboardData.stockAlerts.length > 0">
          <h4>รายชื่อสินค้าที่ต้องเติม:</h4>
          <ul>
            <li v-for="item in dashboardData.stockAlerts" :key="item.pdID">
              {{ item.pdName }} (เหลือเพียง {{ item.stock_qty }} ชิ้น)
            </li>
          </ul>
        </div> -->
      </div>
    </div>

    <!-- Top Selling Products & Low Stock -->
    <div class="dashboard-grid">
      <!-- Top Selling Products -->
      <div class="card">
        <div class="card-header">
          <h2>Top 5 Best-Selling Products</h2>
          <span class="badge">{{ dashboardData.topProducts?.length || 0 }}</span>
        </div>
        <div class="products-list">
          <div v-for="(product, i) in dashboardData.topProducts" :key="i" class="product-row">
            <div class="rank">{{ i + 1 }}</div>
            <div class="product-info">
              <p class="product-name">{{ product.pdName }}</p>
              <p class="product-category">{{ product.pdCategory }}</p>
            </div>
            <div class="product-stats">
              <span class="sold">{{ product.soldQty }} sold</span>
              <span class="revenue">฿{{ Number (product.totalSales).toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Low Stock Alert -->
      <div class="card">
        <div class="card-header">
          <h2>Stock Alerts</h2>
          <span class="badge warning">{{ dashboardData.summary?.lowStockCount || 0 }}</span>
        </div>
        <div v-if="lowStockProducts.length === 0" class="empty-state">
          <span class="material-symbols-outlined">check_circle</span>
          <p>All products have healthy stock levels</p>
        </div>
        <div v-else class="alert-list">
          <div v-for="product in lowStockProducts" :key="product.pdID" class="alert-item">
            <div class="alert-icon">
              <span class="material-symbols-outlined">priority_high</span>
            </div>
            <div class="alert-info">
              <p class="alert-name">{{ product.pdName }}</p>
              <p class="alert-stock">Stock: {{ product.stock_qty }} units</p>
            </div>
            <div class="alert-action">
              <span class="stock-badge">{{ product.stock_qty < 10 ? 'Critical' : 'Low' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="card">
      <div class="card-header">
        <h2>Recent Orders</h2>
        <router-link to="/admin/orders" class="view-all">View All</router-link>
      </div>
      <div class="orders-table">
        <div class="table-header">
          <div class="col-order">Order ID</div>
          <div class="col-customer">Customer</div>
          <div class="col-date">Date</div>
          <div class="col-total">Total</div>
          <div class="col-status">Status</div>
        </div>
        <div v-for="order in allOrders" :key="order.orderId" class="table-row">
          <div class="col-order">{{ order.orderId }}</div>
          <div class="col-customer">{{ getCustomerName(order.customer) }}</div>
          <div class="col-date">{{ formatDate(order.date) }}</div>
          <div class="col-total">฿{{ order.total.toLocaleString() }}</div>
          <div class="col-status">
            <span class="status-badge" :class="order.status.toLowerCase()">{{ order.status }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../services/api'

// ✅ ประกาศ dashboardData ให้ตรงกับที่ template ใช้
const dashboardData = ref({
  summary: { totalRevenue: 0, totalOrders: 0, totalUnits: 0, lowStockCount: 0 },
  topProducts: [],
  stockAlerts: [],
})
const allOrders = ref([])
const allMembers = ref([])
const isLoading = ref(true)

// ✅ computed สำหรับ lowStockProducts ที่ template ใช้
const lowStockProducts = computed(() => dashboardData.value.stockAlerts || [])

const loadAdminData = async () => {
  try {
    isLoading.value = true

    const res = await api.dashboard()
    if (res.success) {
      dashboardData.value = {
        summary: res.summary || {},
        topProducts: res.topProducts || [],
        stockAlerts: res.stockAlerts || [],
      }
    }

    const ordersData = await api.getAllOrders()
    if (ordersData.success) allOrders.value = ordersData.orders

    const membersData = await api.getAllMembers()
    if (membersData.success) allMembers.value = membersData.members

  } catch (error) {
    console.error('Error loading admin data:', error)
  } finally {
    isLoading.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('th-TH')
}

function getCustomerName(email) {
  const member = allMembers.value.find(m => m.email === email)
  return member?.name || email || '-'
}

onMounted(() => {
  loadAdminData()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.dashboard-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 900;
  color: var(--text-white);
}

.dashboard-header .text-muted {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}

/* ── Metrics Grid ────────────────────────────────── */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.metric-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.metric-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon.revenue {
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
}

.metric-icon.products {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.metric-icon.stock {
  background: rgba(244, 67, 54, 0.15);
  color: #f44336;
}

.metric-icon .material-symbols-outlined {
  font-size: 28px;
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.metric-label {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-value {
  margin: 0;
  font-size: 24px;
  font-weight: 900;
  color: var(--text-white);
}

.metric-change {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}

.metric-change.positive {
  color: #4caf50;
  font-weight: 600;
}

.metric-change.warning {
  color: #f44336;
  font-weight: 600;
}

/* ── Dashboard Grid ──────────────────────────────── */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

/* ── Card ────────────────────────────────────────── */
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.card-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-white);
}

.badge {
  background: var(--primary-10);
  color: var(--primary);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--radius-full);
}

.badge.warning {
  background: rgba(244, 67, 54, 0.15);
  color: #f44336;
}

.view-all {
  color: var(--primary);
  font-size: 12px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

/* ── Products List ───────────────────────────────– */
.products-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: var(--primary-05);
  border-radius: var(--radius);
  transition: background 0.2s;
}

.product-row:hover {
  background: var(--primary-10);
}

.rank {
  width: 36px;
  height: 36px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
}

.product-name {
  margin: 0;
  font-weight: 700;
  font-size: 14px;
  color: var(--text-white);
}

.product-category {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

.product-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.sold {
  font-size: 12px;
  color: var(--text-muted);
}

.revenue {
  font-weight: 700;
  font-size: 14px;
  color: var(--accent-gold);
}

/* ── Alert List ──────────────────────────────────– */
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(244, 67, 54, 0.05);
  border-left: 3px solid #f44336;
  border-radius: var(--radius);
}

.alert-icon {
  color: #f44336;
  font-size: 20px;
  flex-shrink: 0;
}

.alert-info {
  flex: 1;
}

.alert-name {
  margin: 0;
  font-weight: 700;
  font-size: 14px;
  color: var(--text-white);
}

.alert-stock {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

.stock-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(244, 67, 54, 0.15);
  color: #f44336;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-dim);
}

.empty-state .material-symbols-outlined {
  font-size: 44px;
  display: block;
  margin-bottom: 12px;
  opacity: 0.4;
}

/* ── Orders Table ────────────────────────────────– */
.orders-table {
  overflow-x: auto;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 2px solid var(--border);
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  color: var(--text-light);
}

.table-row:last-child {
  border-bottom: none;
}

.col-order {
  font-weight: 700;
  color: var(--text-white);
}

.col-customer {
  color: var(--text-white);
}

.col-date {
  color: var(--text-muted);
}

.col-total {
  font-weight: 700;
  color: var(--accent-gold);
}

.status-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

.status-badge.delivered {
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
}

.status-badge.processing {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
