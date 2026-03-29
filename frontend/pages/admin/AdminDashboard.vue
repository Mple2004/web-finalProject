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
          <p class="metric-value">฿{{ totalRevenue.toLocaleString() }}</p>
          <p class="metric-change positive">+{{ orderCount }} orders</p>
        </div>
      </div>


      <div class="metric-card">
        <div class="metric-icon products">
          <span class="material-symbols-outlined">inventory_2</span>
        </div>
        <div class="metric-content">
          <p class="metric-label">total Seller</p>
          <p class="metric-value">{{ totalItemsSold }}</p>
          <p class="metric-change">Total units</p>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon stock">
          <span class="material-symbols-outlined">warning</span>
        </div>
        <div class="metric-content">
          <p class="metric-label">Low Stock Alert</p>
          <p class="metric-value">{{ lowStockCount }}</p>
          <p class="metric-change warning">Requires action</p>
        </div>
      </div>
    </div>

    <!-- Top Selling Products & Low Stock -->
    <div class="dashboard-grid">
      <!-- Top Selling Products -->
      <div class="card">
        <div class="card-header">
          <h2>Top 5 Best-Selling Products</h2>
          <span class="badge">{{ topProducts.length }}</span>
        </div>
        <div class="products-list">
          <div v-for="(product, i) in topProducts" :key="i" class="product-row">
            <div class="rank">{{ i + 1 }}</div>
            <div class="product-info">
              <p class="product-name">{{ product.pdName }}</p>
              <p class="product-category">{{ product.pdCategory }}</p>
            </div>
            <div class="product-stats">
              <span class="sold">{{ product.totalSold }} sold</span>
              <span class="revenue">฿{{ product.revenue.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Low Stock Alert -->
      <div class="card">
        <div class="card-header">
          <h2>Stock Alerts</h2>
          <span class="badge warning">{{ lowStockProducts.length }}</span>
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
        <div v-for="order in recentOrders" :key="order.historyID" class="table-row">
          <div class="col-order">{{ order.orderId }}</div>
          <div class="col-customer">{{ getCustomerName(order.email) }}</div>
          <div class="col-date">{{ formatDate(order.date) }}</div>
          <div class="col-total">฿{{ order.total_price.toLocaleString() }}</div>
          <div class="col-status">
            <span class="status-badge" :class="order.status.toLowerCase()">{{ order.status }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { MOCK_HISTORY, MOCK_PRODUCTS, mockUsers } from '../../data/mockData'

// Calculate total revenue
const totalRevenue = computed(() => {
  return MOCK_HISTORY.reduce((sum, order) => sum + order.total_price, 0)
})

// Count total orders
const orderCount = computed(() => MOCK_HISTORY.length)

// Calculate total items sold
const totalItemsSold = computed(() => {
  return MOCK_HISTORY.reduce((sum, order) => {
    return sum + order.products.reduce((pSum, p) => pSum + p.qty, 0)
  }, 0)
})

// Get top 5 best-selling products
const topProducts = computed(() => {
  const productSales = {}
  
  MOCK_HISTORY.forEach(order => {
    order.products.forEach(product => {
      if (!productSales[product.pdId]) {
        const fullProduct = MOCK_PRODUCTS.find(p => p.pdID === product.pdId)
        productSales[product.pdId] = {
          pdID: product.pdId,
          pdName: product.pdName,
          pdCategory: fullProduct?.pdCategory || 'Unknown',
          totalSold: 0,
          revenue: 0
        }
      }
      productSales[product.pdId].totalSold += product.qty
      productSales[product.pdId].revenue += product.qty * product.price
    })
  })

  return Object.values(productSales)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5)
})

// Get low stock products (< 20 units)
const lowStockProducts = computed(() => {
  return MOCK_PRODUCTS.filter(p => p.stock_qty < 20).sort((a, b) => a.stock_qty - b.stock_qty)
})

const lowStockCount = computed(() => lowStockProducts.value.length)

// Get recent orders
const recentOrders = computed(() => {
  return [...MOCK_HISTORY]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
})

// Get customer name from email
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
