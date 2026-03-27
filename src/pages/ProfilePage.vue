<template>
  <div class="profile-page">
    <div class="profile-container">

      <!-- ── HEADER ─────────────────────────────── -->
      <div class="profile-header">
        <div class="avatar-wrap">
          <img :src="user.avatar" :alt="user.name" class="avatar" />
          <span class="role-badge" :class="user.role">{{ user.role }}</span>
        </div>
        <div class="header-info">
          <h1 class="username">{{ user.name }}</h1>
          <p class="user-email">{{ user.email }}</p>
          <p class="member-since">Member since March 2026</p>
        </div>
      </div>

      <!-- ── MAIN GRID ──────────────────────────── -->
      <div class="main-grid">

        <!-- Account Info -->
        <div class="card">
          <h2 class="card-heading">
            <span class="material-symbols-outlined">person</span>
            Account Information
          </h2>
          <div class="info-list">
            <div class="info-row">
              <span class="info-label">Full Name</span>
              <span class="info-value">{{ user.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">{{ user.email }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Role</span>
              <span class="info-value" style="text-transform:capitalize;">{{ user.role }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Account ID</span>
              <span class="info-value muted">#{{ String(user.id).padStart(5, '0') }}</span>
            </div>
          </div>

          <div class="card-stats">
            <div class="stat">
              <span class="stat-num">{{ userOrders.length }}</span>
              <span class="stat-label">Orders</span>
            </div>
            <div class="stat-divider" />
            <div class="stat">
              <span class="stat-num">${{ totalSpent.toFixed(2) }}</span>
              <span class="stat-label">Total Spent</span>
            </div>
            <div class="stat-divider" />
            <div class="stat">
              <span class="stat-num">{{ totalItems }}</span>
              <span class="stat-label">Items</span>
            </div>
          </div>
        </div>

        <!-- Order History -->
        <div class="card">
          <h2 class="card-heading">
            <span class="material-symbols-outlined">receipt_long</span>
            Order History
          </h2>

          <div class="order-list">
            <div v-for="order in userOrders" :key="order.id" class="order-row">
              <div class="order-left">
                <div class="order-imgs">
                  <img
                    v-for="(item, i) in order.items.slice(0, 3)"
                    :key="i"
                    :src="item.image"
                    class="order-img"
                  />
                </div>
                <div>
                  <p class="order-id">{{ order.id }}</p>
                  <p class="order-meta">{{ order.date }} · {{ order.items.length }} item{{ order.items.length > 1 ? 's' : '' }}</p>
                </div>
              </div>
              <div class="order-right">
                <span class="order-status" :class="order.status.toLowerCase()">
                  {{ order.status }}
                </span>
                <span class="order-total">${{ order.total.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ── LOGOUT ─────────────────────────────── -->
      <div class="logout-wrap">
        <button class="logout-btn" @click="handleLogout">
          <span class="material-symbols-outlined">logout</span>
          Sign Out
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'
import { useToast } from '../stores/toast'
import { useOrders } from '../stores/orders'

const router = useRouter()
const auth = useAuth()
const toast = useToast()
const orders = useOrders()
const user = auth.user

const userOrders = ref([])

onMounted(() => {
  if (!auth.isLoggedIn.value) { router.push('/login'); return }
  userOrders.value = orders.getUserOrders(user.value.id)
})
const totalSpent = computed(() => userOrders.value.reduce((s, o) => s + (o.total || 0), 0))
const totalItems = computed(() => userOrders.value.reduce((s, o) => s + (o.items?.length || 0), 0))

function handleLogout() {
  auth.logout()
  toast.show('Signed out successfully')
  router.push('/')
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--bg-dark);
  padding: 48px 24px;
}

.profile-container {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* ── Header ─────────────────────────── */
.profile-header {
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 32px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  position: relative;
  overflow: hidden;
}
.profile-header::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--accent-gold));
}

.avatar-wrap { position: relative; flex-shrink: 0; }
.avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border);
}
.role-badge {
  position: absolute;
  bottom: 0; right: -4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 7px;
  border-radius: var(--radius-full);
}
.role-badge.admin { background: var(--primary); color: white; }
.role-badge.user  { background: var(--accent-gold); color: #111; }

.header-info { display: flex; flex-direction: column; gap: 4px; }
.username { font-size: 1.6rem; font-weight: 900; color: var(--text-white); margin: 0; }
.user-email { color: var(--text-muted); font-size: 0.9rem; margin: 0; }
.member-since { color: var(--text-dim); font-size: 0.8rem; margin: 0; }

/* ── Main Grid ───────────────────────── */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-white);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.card-heading .material-symbols-outlined { font-size: 18px; color: var(--primary); }

/* Account info rows */
.info-list { display: flex; flex-direction: column; gap: 0; }
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.88rem;
}
.info-row:last-child { border-bottom: none; }
.info-label { color: var(--text-muted); }
.info-value { color: var(--text-white); font-weight: 600; }
.info-value.muted { color: var(--text-dim); font-weight: 400; }

/* Stats bar */
.card-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 16px;
  background: var(--primary-05);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-top: auto;
}
.stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.stat-num { font-size: 1.25rem; font-weight: 900; color: var(--primary); }
.stat-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.stat-divider { width: 1px; height: 32px; background: var(--border); }

/* Order list */
.order-list { display: flex; flex-direction: column; gap: 12px; }
.order-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--primary-05);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  gap: 12px;
}
.order-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.order-imgs { display: flex; }
.order-img {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--border);
  margin-right: -8px;
}
.order-img:last-child { margin-right: 0; }
.order-id { font-size: 0.85rem; font-weight: 700; color: var(--text-white); margin: 0; }
.order-meta { font-size: 0.75rem; color: var(--text-muted); margin: 0; }

.order-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.order-status {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 3px 8px;
  border-radius: var(--radius-full);
}
.order-status.delivered { background: rgba(34,197,94,0.15); color: var(--green); }
.order-status.processing { background: rgba(245,158,11,0.15); color: var(--amber-500); }
.order-total { font-size: 0.9rem; font-weight: 800; color: var(--accent-gold); }

/* ── Logout ──────────────────────────── */
.logout-wrap { display: flex; justify-content: flex-end; }
.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: var(--primary-10);
  border: 1px solid var(--primary-20);
  color: #ff6b8a;
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.logout-btn:hover { background: var(--primary-20); }
.logout-btn .material-symbols-outlined { font-size: 18px; }

/* ── Responsive ─────────────────────── */
@media (max-width: 680px) {
  .main-grid { grid-template-columns: 1fr; }
  .profile-header { flex-direction: column; text-align: center; }
}
</style>
