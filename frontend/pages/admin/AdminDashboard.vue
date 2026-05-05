<template>
  <div class="dashboard">
    <div v-if="loading" class="loading-state">
      <span class="spinner-ring"></span>
      <p>Loading dashboard…</p>
    </div>

    <template v-else>
      <!-- Key Metrics -->
      <div class="metrics-grid">
        <div class="metric-card revenue">
          <div class="metric-icon">
            <span class="material-symbols-outlined">trending_up</span>
          </div>
          <div class="metric-content">
            <p class="metric-label">Total Revenue</p>
            <p class="metric-value">฿{{ totalRevenue.toLocaleString() }}</p>
            <p class="metric-change positive">+{{ orderCount }} orders</p>
          </div>
        </div>

        <div class="metric-card sold">
          <div class="metric-icon">
            <span class="material-symbols-outlined">inventory_2</span>
          </div>
          <div class="metric-content">
            <p class="metric-label">Total Sold</p>
            <p class="metric-value">{{ totalItemsSold }}</p>
            <p class="metric-change neutral">Total units</p>
          </div>
        </div>

        <div class="metric-card alert">
          <div class="metric-icon">
            <span class="material-symbols-outlined">warning</span>
          </div>
          <div class="metric-content">
            <p class="metric-label">Low Stock Alert</p>
            <p class="metric-value">{{ lowStockProducts.length }}</p>
            <p class="metric-change" :class="lowStockProducts.length ? 'danger' : 'positive'">
              {{ lowStockProducts.length ? 'Requires action' : 'All good' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Top Selling & Low Stock -->
      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <span class="material-symbols-outlined card-icon gold">bar_chart</span>
              <h2>Top 5 Best-Selling</h2>
            </div>
            <span class="badge gold">{{ topProducts.length }}</span>
          </div>
          <div class="products-list">
            <div v-if="topProducts.length === 0" class="empty-state">
              <span class="material-symbols-outlined">bar_chart</span>
              <p>No sales data yet</p>
            </div>
            <div v-for="(product, i) in topProducts" :key="product.pdID" class="product-row">
              <div class="rank" :class="['r' + (i + 1)]">{{ i + 1 }}</div>
              <div class="product-info">
                <p class="product-name">{{ product.pdName }}</p>
                <p class="product-category">{{ product.pdCategory }}</p>
              </div>
              <div class="product-stats">
                <span class="sold-count">{{ product.totalSold }} sold</span>
                <span class="revenue-val">฿{{ Number(product.revenue).toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <span class="material-symbols-outlined card-icon danger">priority_high</span>
              <h2>Stock Alerts</h2>
            </div>
            <span class="badge" :class="lowStockProducts.length ? 'danger' : 'success'">
              {{ lowStockProducts.length }}
            </span>
          </div>
          <div v-if="lowStockProducts.length === 0" class="empty-state success-empty">
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
                <p class="alert-stock">{{ product.stock_qty }} units remaining</p>
              </div>
              <span class="stock-badge" :class="product.stock_qty < 10 ? 'critical' : 'low'">
                {{ product.stock_qty < 10 ? 'Critical' : 'Low' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span class="material-symbols-outlined card-icon primary">receipt_long</span>
            <h2>Recent Orders</h2>
          </div>
          <router-link to="/admin/orders" class="view-all">
            View All <span class="material-symbols-outlined">arrow_forward</span>
          </router-link>
        </div>
        <div class="orders-table">
          <div class="table-header">
            <div>Order ID</div>
            <div>Customer</div>
            <div>Date</div>
            <div>Total</div>
            <div>Status</div>
          </div>
          <div v-if="recentOrders.length === 0" class="empty-state">
            <p>No orders yet</p>
          </div>
          <div v-for="order in recentOrders" :key="order.orderId" class="table-row">
            <div class="col-order">#{{ order.orderId }}</div>
            <div>{{ order.name || order.email }}</div>
            <div>{{ formatDate(order.date) }}</div>
            <div class="col-total">฿{{ Number(order.total).toLocaleString() }}</div>
            <div>
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
.dashboard { display: flex; flex-direction: column; gap: 24px; }

/* Loading */
.loading-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px; gap: 16px; color: var(--text-muted);
}
.spinner-ring {
  width: 40px; height: 40px; border: 3px solid var(--border);
  border-top-color: var(--primary); border-radius: 50%;
  animation: spin 0.8s linear infinite; display: block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Metrics */
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }

.metric-card {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius-xl); padding: 24px;
  display: flex; align-items: flex-start; gap: 16px;
  position: relative; overflow: hidden; transition: transform 0.2s;
}
.metric-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
}
.metric-card.revenue::before { background: linear-gradient(90deg, #4caf50, #81c784); }
.metric-card.sold::before    { background: linear-gradient(90deg, #ffc107, #ffe082); }
.metric-card.alert::before   { background: linear-gradient(90deg, var(--primary), #ff6b8a); }
.metric-card:hover { transform: translateY(-2px); }

.metric-icon {
  width: 52px; height: 52px; border-radius: var(--radius-lg);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.metric-card.revenue .metric-icon { background: rgba(76,175,80,.15); color: #4caf50; }
.metric-card.sold    .metric-icon { background: rgba(255,193,7,.15);  color: #ffc107; }
.metric-card.alert   .metric-icon { background: rgba(212,17,50,.12);  color: var(--primary); }
.metric-icon .material-symbols-outlined { font-size: 26px; }

.metric-content { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.metric-label { margin: 0; font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .08em; }
.metric-value { margin: 0; font-size: 26px; font-weight: 900; color: var(--text-white); line-height: 1.2; }
.metric-change { margin: 0; font-size: 12px; font-weight: 600; }
.metric-change.positive { color: #4caf50; }
.metric-change.neutral  { color: var(--text-muted); }
.metric-change.danger   { color: var(--primary); }

/* Grid cards */
.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 16px; }

.card {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius-xl); padding: 20px;
}
.card-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
}
.card-title { display: flex; align-items: center; gap: 10px; }
.card-title h2 { margin: 0; font-size: 15px; font-weight: 700; color: var(--text-white); }
.card-icon { font-size: 20px; }
.card-icon.gold    { color: var(--accent-gold); }
.card-icon.danger  { color: #f44336; }
.card-icon.primary { color: var(--primary); }

.badge {
  font-size: 11px; font-weight: 700; padding: 3px 10px;
  border-radius: var(--radius-full);
}
.badge.gold    { background: rgba(201,168,76,.15); color: var(--accent-gold); }
.badge.danger  { background: rgba(244,67,54,.15);  color: #f44336; }
.badge.success { background: rgba(76,175,80,.15);  color: #4caf50; }

.view-all {
  display: flex; align-items: center; gap: 4px;
  color: var(--primary); font-size: 12px; font-weight: 600;
  text-decoration: none; transition: gap 0.2s;
}
.view-all:hover { gap: 8px; }
.view-all .material-symbols-outlined { font-size: 14px; }

/* Top Products */
.products-list { display: flex; flex-direction: column; gap: 10px; }
.product-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; background: var(--bg-dark);
  border-radius: var(--radius); transition: background 0.2s;
}
.product-row:hover { background: var(--primary-05); }

.rank {
  width: 30px; height: 30px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 13px; flex-shrink: 0;
}
.rank.r1 { background: linear-gradient(135deg, #ffd700, #ff8c00); color: #1a1000; }
.rank.r2 { background: linear-gradient(135deg, #c0c0c0, #9e9e9e); color: #1a1a1a; }
.rank.r3 { background: linear-gradient(135deg, #cd7f32, #8b4513); color: white; }
.rank.r4, .rank.r5 { background: var(--primary-10); color: var(--primary); }

.product-info { flex: 1; }
.product-name { margin: 0; font-weight: 700; font-size: 13px; color: var(--text-white); }
.product-category { margin: 2px 0 0 0; font-size: 11px; color: var(--text-muted); }
.product-stats { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
.sold-count { font-size: 11px; color: var(--text-muted); }
.revenue-val { font-weight: 700; font-size: 13px; color: var(--accent-gold); }

/* Stock Alerts */
.alert-list { display: flex; flex-direction: column; gap: 10px; }
.alert-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 12px;
  background: rgba(244,67,54,.05); border-left: 3px solid #f44336;
  border-radius: var(--radius);
}
.alert-icon { color: #f44336; flex-shrink: 0; }
.alert-icon .material-symbols-outlined { font-size: 18px; }
.alert-info { flex: 1; }
.alert-name { margin: 0; font-weight: 700; font-size: 13px; color: var(--text-white); }
.alert-stock { margin: 2px 0 0 0; font-size: 11px; color: var(--text-muted); }
.stock-badge {
  font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px;
}
.stock-badge.critical { background: rgba(244,67,54,.2); color: #f44336; }
.stock-badge.low      { background: rgba(255,193,7,.15); color: #ffc107; }

/* Empty States */
.empty-state { text-align: center; padding: 32px; color: var(--text-dim); }
.empty-state .material-symbols-outlined { font-size: 40px; display: block; margin-bottom: 10px; opacity: .4; }
.success-empty .material-symbols-outlined { color: #4caf50; opacity: .6; }

/* Orders Table */
.orders-table { overflow-x: auto; }
.table-header {
  display: grid; grid-template-columns: 0.7fr 1.5fr 1.2fr 1fr 1fr;
  gap: 12px; padding: 10px 12px; border-bottom: 1px solid var(--border);
  font-size: 11px; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: .07em;
}
.table-row {
  display: grid; grid-template-columns: 0.7fr 1.5fr 1.2fr 1fr 1fr;
  gap: 12px; align-items: center; padding: 12px;
  border-bottom: 1px solid var(--border);
  font-size: 13px; color: var(--text-light); transition: background 0.15s;
}
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: var(--primary-05); }
.col-order { font-weight: 700; color: var(--text-white); }
.col-total { font-weight: 700; color: var(--accent-gold); }
.status-badge {
  display: inline-block; font-size: 10px; font-weight: 700;
  padding: 3px 8px; border-radius: 4px; text-transform: uppercase;
}
.status-badge.paid      { background: rgba(76,175,80,.15);  color: #4caf50; }
.status-badge.delivered { background: rgba(33,150,243,.15); color: #42a5f5; }

@media (max-width: 768px) {
  .metrics-grid, .dashboard-grid { grid-template-columns: 1fr; }
  .table-header, .table-row { grid-template-columns: 1fr 1fr; }
}
</style>
