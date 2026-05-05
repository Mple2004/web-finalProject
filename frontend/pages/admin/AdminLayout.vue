<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <!-- Brand -->
      <div class="sidebar-brand">
        <router-link to="/" class="brand-logo">
          <span class="brand-icon">🍷</span>
          <div class="brand-text">
            <span class="brand-name">SPIRIT <span class="gold">&</span> VINE</span>
            <span class="brand-sub">Admin Panel</span>
          </div>
        </router-link>
        <button class="sidebar-close" @click="sidebarOpen = false">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="sidebar-divider" />

      <!-- Nav -->
      <nav class="sidebar-nav">
        <router-link to="/admin/dashboard" class="nav-item" :class="{ active: activeNav === 'dashboard' }">
          <span class="nav-icon material-symbols-outlined">dashboard</span>
          <span class="nav-label">Dashboard</span>
        </router-link>
        <router-link to="/admin/products" class="nav-item" :class="{ active: activeNav === 'products' }">
          <span class="nav-icon material-symbols-outlined">inventory_2</span>
          <span class="nav-label">Products</span>
        </router-link>
        <router-link to="/admin/members" class="nav-item" :class="{ active: activeNav === 'members' }">
          <span class="nav-icon material-symbols-outlined">people</span>
          <span class="nav-label">Members</span>
        </router-link>
        <router-link to="/admin/orders" class="nav-item" :class="{ active: activeNav === 'orders' }">
          <span class="nav-icon material-symbols-outlined">receipt_long</span>
          <span class="nav-label">Orders</span>
        </router-link>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <div class="sidebar-divider" />
        <div class="sidebar-user">
          <div class="sidebar-avatar-wrap">
            <img
              :src="`http://localhost:5000/img_mem/${encodeURIComponent(auth.user.value?.email)}.jpg?t=${imageTimestamp}`"
              :alt="auth.user.value?.name"
              class="sidebar-avatar"
              @error="e => e.target.style.visibility = 'hidden'"
            />
            <span class="sidebar-avatar-initials">{{ initials }}</span>
          </div>
          <div class="sidebar-user-info">
            <p class="sidebar-user-name">{{ auth.user.value?.name }}</p>
            <p class="sidebar-user-role">Administrator</p>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout">
          <span class="material-symbols-outlined">logout</span>
          Sign Out
        </button>
      </div>
    </aside>

    <!-- Main -->
    <main class="admin-main">
      <header class="admin-header">
        <div class="header-left">
          <button class="toggle-sidebar" @click="sidebarOpen = !sidebarOpen">
            <span class="material-symbols-outlined">menu</span>
          </button>
          <div class="page-title">
            <h1 class="header-title">{{ pageTitle }}</h1>
            <p class="header-sub">{{ pageSub }}</p>
          </div>
        </div>
      </header>

      <section class="admin-content">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../../stores/auth'
import { getInitials } from '../../utils/string'

const router = useRouter()
const route = useRoute()
const auth = useAuth()
const sidebarOpen = ref(true)
const imageTimestamp = ref(Date.now())

const activeNav = computed(() => {
  if (route.path.startsWith('/admin/orders')) return 'orders'
  if (route.path.startsWith('/admin/products')) return 'products'
  if (route.path.startsWith('/admin/members')) return 'members'
  return 'dashboard'
})

const PAGE_META = {
  dashboard: { title: 'Dashboard', sub: 'Monitor your store performance' },
  orders:    { title: 'Orders',    sub: 'View and manage all customer orders' },
  products:  { title: 'Products',  sub: 'Manage your product catalog' },
  members:   { title: 'Members',   sub: 'View and manage members' },
}
const pageTitle = computed(() => PAGE_META[activeNav.value]?.title ?? 'Admin')
const pageSub   = computed(() => PAGE_META[activeNav.value]?.sub   ?? '')

const initials = computed(() => getInitials(auth.user.value?.name))

onMounted(() => {
  if (!auth.isLoggedIn.value || auth.user.value?.status !== 'admin') {
    router.push('/login')
  }
})

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
/* ── Layout ──────────────────────────────────────── */
.admin-layout { display: flex; min-height: 100vh; background: var(--bg-dark); }

/* ── Sidebar ─────────────────────────────────────── */
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #1e0c10 0%, #2a1417 100%);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 0;
  position: fixed;
  left: 0; top: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 1000;
  transition: transform 0.3s ease;
}

/* Brand */
.sidebar-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
}
.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.brand-icon { font-size: 24px; }
.brand-text { display: flex; flex-direction: column; gap: 1px; }
.brand-name { font-size: 13px; font-weight: 900; color: var(--text-white); letter-spacing: 0.08em; }
.gold { color: var(--accent-gold); }
.brand-sub {
  font-size: 10px; font-weight: 600; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.12em;
}
.sidebar-close {
  display: none; background: none; border: none;
  color: var(--text-muted); cursor: pointer;
}
.sidebar-close .material-symbols-outlined { font-size: 20px; }

.sidebar-divider { height: 1px; background: var(--border); margin: 0 20px; }

/* Nav */
.sidebar-nav {
  display: flex; flex-direction: column; gap: 4px;
  flex: 1; padding: 16px 12px;
}
.nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 14px; border-radius: var(--radius);
  color: var(--text-muted);
  text-decoration: none; font-weight: 500; font-size: 14px;
  transition: all 0.2s; position: relative;
}
.nav-item:hover { background: var(--primary-10); color: var(--text-light); }
.nav-item.active {
  background: var(--primary-10);
  color: var(--primary);
  font-weight: 700;
}
.nav-item.active::before {
  content: '';
  position: absolute; left: 0; top: 6px; bottom: 6px;
  width: 3px; border-radius: 0 2px 2px 0;
  background: var(--primary);
}
.nav-icon { font-size: 20px; flex-shrink: 0; }
.nav-label { flex: 1; }

/* Sidebar Footer */
.sidebar-footer { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.sidebar-user {
  display: flex; align-items: center; gap: 10px;
  padding: 10px; border-radius: var(--radius);
  background: rgba(255,255,255,0.03);
}
.sidebar-avatar-wrap {
  position: relative; width: 36px; height: 36px;
  border-radius: 50%; flex-shrink: 0;
  background: rgba(212,17,50,0.25);
  border: 2px solid var(--primary);
  overflow: hidden; display: flex; align-items: center; justify-content: center;
}
.sidebar-avatar {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; z-index: 1;
}
.sidebar-avatar-initials {
  font-size: 12px; font-weight: 700; color: var(--primary); z-index: 0;
}
.sidebar-user-info { flex: 1; min-width: 0; }
.sidebar-user-name {
  margin: 0; font-size: 13px; font-weight: 700;
  color: var(--text-white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.sidebar-user-role { margin: 0; font-size: 10px; color: var(--text-muted); text-transform: uppercase; }
.logout-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-radius: var(--radius);
  background: transparent; border: 1px solid rgba(212,17,50,0.2);
  color: #ff6b8a; font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.2s; width: 100%; justify-content: center;
}
.logout-btn:hover { background: rgba(212,17,50,0.1); border-color: rgba(212,17,50,0.4); }
.logout-btn .material-symbols-outlined { font-size: 18px; }

/* ── Main Content ────────────────────────────────── */
.admin-main { flex: 1; margin-left: 260px; display: flex; flex-direction: column; min-height: 100vh; }

.admin-header {
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  gap: 24px;
  position: sticky; top: 0; z-index: 100;
}
.header-left { display: flex; align-items: center; gap: 16px; }
.toggle-sidebar {
  display: none; background: none; border: none;
  color: var(--text-white); font-size: 22px; cursor: pointer;
  padding: 4px;
}
.page-title { display: flex; flex-direction: column; gap: 1px; }
.header-title { margin: 0; font-size: 18px; font-weight: 800; color: var(--text-white); }
.header-sub { margin: 0; font-size: 12px; color: var(--text-muted); }

.back-to-store {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: var(--radius);
  border: 1px solid var(--border); color: var(--text-muted);
  font-size: 13px; font-weight: 500; text-decoration: none;
  transition: all 0.2s;
}
.back-to-store:hover { border-color: var(--primary); color: var(--primary); }
.back-to-store .material-symbols-outlined { font-size: 18px; }

.admin-content { flex: 1; padding: 28px 32px; overflow-y: auto; }

/* ── Responsive ──────────────────────────────────── */
@media (max-width: 1024px) {
  .sidebar { width: 240px; }
  .admin-main { margin-left: 240px; }
}

@media (max-width: 768px) {
  .sidebar {
    width: 260px; position: fixed;
    transform: translateX(-100%);
    border-right: 1px solid var(--border);
  }
  .sidebar.open { transform: translateX(0); }
  .sidebar-close { display: block; }
  .admin-main { margin-left: 0; }
  .toggle-sidebar { display: block; }
  .admin-header { padding: 0 16px; }
  .admin-content { padding: 16px; }
  .header-sub { display: none; }
}
</style>
