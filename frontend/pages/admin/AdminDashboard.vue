<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Dashboard Overview</h1>
      <p class="text-muted">Monitor your store performance</p>
    </div>

    <div v-if="loading" class="loading-state">Loading...</div>

    <template v-else>
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
            <p class="metric-label">Total Sold</p>
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
            <p class="metric-value">{{ lowStockProducts.length }}</p>
            <p class="metric-change warning">Requires action</p>
          </div>
        </div>
      </div>

      <!-- Top Selling & Low Stock -->
      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header">
            <h2>Top 5 Best-Selling Products</h2>
            <span class="badge">{{ topProducts.length }}</span>
          </div>
          <div class="products-list">
            <div v-if="topProducts.length === 0" class="empty-state">
              <span class="material-symbols-outlined">bar_chart</span>
              <p>No sales data yet</p>
            </div>
            <div v-for="(product, i) in topProducts" :key="product.pdID" class="product-row">
              <div class="rank">{{ i + 1 }}</div>
              <div class="product-info">
                <p class="product-name">{{ product.pdName }}</p>
                <p class="product-category">{{ product.pdCategory }}</p>
              </div>
              <div class="product-stats">
                <span class="sold">{{ product.totalSold }} sold</span>
                <span class="revenue">฿{{ Number(product.revenue).toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

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
          <div v-if="recentOrders.length === 0" class="empty-state">
            <p>No orders yet</p>
          </div>
          <div v-for="order in recentOrders" :key="order.orderId" class="table-row">
            <div class="col-order">#{{ order.orderId }}</div>
            <div class="col-customer">{{ order.name || order.email }}</div>
            <div class="col-date">{{ formatDate(order.date) }}</div>
            <div class="col-total">฿{{ Number(order.total).toLocaleString() }}</div>
            <div class="col-status">
              <span class="status-badge" :class="order.status">{{ order.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../services/api'

const loading = ref(true)
const summary = ref({ totalOrders: 0, totalRevenue: 0, totalItemsSold: 0 })
const topProducts = ref([])
const lowStockProducts = ref([])
const recentOrders = ref([])

const totalRevenue = computed(() => Number(summary.value.totalRevenue) || 0)
const orderCount = computed(() => Number(summary.value.totalOrders) || 0)
const totalItemsSold = computed(() => Number(summary.value.totalItemsSold) || 0)

onMounted(async () => {
  try {
    const res = await api.getAdminDashboard()
    if (res.success) {
      summary.value = res.summary
      topProducts.value = res.topProducts
      lowStockProducts.value = res.lowStockProducts
      recentOrders.value = res.recentOrders
    }
  } catch (err) {
    console.error('Dashboard load error:', err.message)
  } finally {
    loading.value = false
  }
})

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}
</script>

<style scoped>
.dashboard { display:flex; flex-direction:column; gap:32px; }
.dashboard-header h1 { margin:0 0 8px 0; font-size:28px; font-weight:900; color:var(--text-white); }
.dashboard-header .text-muted { margin:0; color:var(--text-muted); font-size:14px; }
.loading-state { text-align:center; padding:60px; color:var(--text-muted); }
.metrics-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:20px; }
.metric-card { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-xl); padding:24px; display:flex; align-items:flex-start; gap:16px; }
.metric-icon { width:56px; height:56px; border-radius:var(--radius-lg); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.metric-icon.revenue { background:rgba(76,175,80,0.15); color:#4caf50; }
.metric-icon.products { background:rgba(255,193,7,0.15); color:#ffc107; }
.metric-icon.stock { background:rgba(244,67,54,0.15); color:#f44336; }
.metric-icon .material-symbols-outlined { font-size:28px; }
.metric-content { display:flex; flex-direction:column; gap:4px; flex:1; }
.metric-label { margin:0; font-size:12px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:.05em; }
.metric-value { margin:0; font-size:24px; font-weight:900; color:var(--text-white); }
.metric-change { margin:0; font-size:12px; color:var(--text-muted); }
.metric-change.positive { color:#4caf50; font-weight:600; }
.metric-change.warning { color:#f44336; font-weight:600; }
.dashboard-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(400px,1fr)); gap:20px; }
.card { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-xl); padding:24px; }
.card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
.card-header h2 { margin:0; font-size:16px; font-weight:700; color:var(--text-white); }
.badge { background:var(--primary-10); color:var(--primary); font-size:11px; font-weight:700; padding:4px 10px; border-radius:var(--radius-full); }
.badge.warning { background:rgba(244,67,54,0.15); color:#f44336; }
.view-all { color:var(--primary); font-size:12px; font-weight:600; text-decoration:underline; cursor:pointer; }
.products-list { display:flex; flex-direction:column; gap:12px; }
.product-row { display:flex; align-items:center; gap:16px; padding:12px; background:var(--primary-05); border-radius:var(--radius); }
.rank { width:36px; height:36px; background:var(--primary); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; flex-shrink:0; }
.product-info { flex:1; }
.product-name { margin:0; font-weight:700; font-size:14px; color:var(--text-white); }
.product-category { margin:2px 0 0 0; font-size:12px; color:var(--text-muted); }
.product-stats { display:flex; flex-direction:column; align-items:flex-end; gap:4px; }
.sold { font-size:12px; color:var(--text-muted); }
.revenue { font-weight:700; font-size:14px; color:var(--accent-gold); }
.alert-list { display:flex; flex-direction:column; gap:12px; }
.alert-item { display:flex; align-items:center; gap:12px; padding:12px; background:rgba(244,67,54,0.05); border-left:3px solid #f44336; border-radius:var(--radius); }
.alert-icon { color:#f44336; font-size:20px; flex-shrink:0; }
.alert-info { flex:1; }
.alert-name { margin:0; font-weight:700; font-size:14px; color:var(--text-white); }
.alert-stock { margin:2px 0 0 0; font-size:12px; color:var(--text-muted); }
.stock-badge { font-size:11px; font-weight:700; padding:4px 8px; border-radius:4px; background:rgba(244,67,54,0.15); color:#f44336; }
.empty-state { text-align:center; padding:40px 20px; color:var(--text-dim); }
.empty-state .material-symbols-outlined { font-size:44px; display:block; margin-bottom:12px; opacity:.4; }
.orders-table { overflow-x:auto; }
.table-header { display:grid; grid-template-columns:1fr 1fr 1fr 1fr 1fr; gap:16px; padding:12px 0; border-bottom:2px solid var(--border); font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:12px; }
.table-row { display:grid; grid-template-columns:1fr 1fr 1fr 1fr 1fr; gap:16px; align-items:center; padding:12px 0; border-bottom:1px solid var(--border); font-size:13px; color:var(--text-light); }
.table-row:last-child { border-bottom:none; }
.col-order { font-weight:700; color:var(--text-white); }
.col-total { font-weight:700; color:var(--accent-gold); }
.status-badge { display:inline-block; font-size:11px; font-weight:700; padding:4px 8px; border-radius:4px; text-transform:uppercase; }
.status-badge.paid { background:rgba(76,175,80,0.15); color:#4caf50; }
.status-badge.delivered { background:rgba(33,150,243,0.15); color:#42a5f5; }
@media(max-width:768px) {
  .metrics-grid,.dashboard-grid { grid-template-columns:1fr; }
  .table-header,.table-row { grid-template-columns:1fr 1fr; }
}
</style>
