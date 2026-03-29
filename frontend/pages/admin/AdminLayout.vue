<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <div class="logo">
          <span class="material-symbols-outlined">admin_panel_settings</span>
          <h2>Admin Panel</h2>
        </div>
        <button class="sidebar-close" @click="sidebarOpen = false">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link 
          to="/admin/dashboard" 
          class="nav-item"
          :class="{ active: activeNav === 'dashboard' }"
          @click="activeNav = 'dashboard'"
        >
          <span class="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </router-link>
        <router-link 
          to="/admin/orders" 
          class="nav-item"
          :class="{ active: activeNav === 'orders' }"
          @click="activeNav = 'orders'"
        >
          <span class="material-symbols-outlined">receipt_long</span>
          <span>Orders</span>
        </router-link>
        <router-link 
          to="/admin/products" 
          class="nav-item"
          :class="{ active: activeNav === 'products' }"
          @click="activeNav = 'products'"
        >
          <span class="material-symbols-outlined">inventory_2</span>
          <span>Products</span>
        </router-link>
        <router-link 
          to="/admin/members" 
          class="nav-item"
          :class="{ active: activeNav === 'members' }"
          @click="activeNav = 'members'"
        >
          <span class="material-symbols-outlined">people</span>
          <span>Members</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="handleLogout">
          <span class="material-symbols-outlined">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="admin-main">
      <header class="admin-header">
        <button class="toggle-sidebar" @click="sidebarOpen = !sidebarOpen">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <div class="header-user">
          <img :src="`http://localhost:5000/img_mem/${encodeURIComponent(auth.user.value?.email)}.jpg`" class="avatar">
          <div class="user-info">
            <p class="user-name">{{ auth.user.value?.name }}</p>
            <p class="user-role">{{ auth.user.value?.status }}</p>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth'

const router = useRouter()
const auth = useAuth()
const activeNav = ref('dashboard')
const sidebarOpen = ref(true)

onMounted(() => {
  // Check if user is admin
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
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-dark);
}

/* ── Sidebar ─────────────────────────────────────── */
.sidebar {
  width: 280px;
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 24px;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 1000;
  transition: transform 0.3s;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo .material-symbols-outlined {
  font-size: 28px;
  color: var(--primary);
}

.logo h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-white);
}

.sidebar-close {
  display: none;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 24px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  margin-bottom: 24px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius);
  color: var(--text-light);
  text-decoration: none;
  transition: all 0.2s;
  font-weight: 500;
  font-size: 14px;
}

.nav-item:hover {
  background: var(--primary-10);
  color: var(--primary);
}

.nav-item.active {
  background: var(--primary-20);
  color: var(--primary);
  font-weight: 700;
}

.nav-item .material-symbols-outlined {
  font-size: 20px;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--primary-10);
  border: 1px solid var(--primary-20);
  border-radius: var(--radius);
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.logout-btn:hover {
  background: var(--primary-20);
}

.logout-btn .material-symbols-outlined {
  font-size: 18px;
}

/* ── Main Content ────────────────────────────────── */
.admin-main {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
}

.admin-header {
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  height: 80px;
}

.toggle-sidebar {
  display: none;
  background: none;
  border: none;
  color: var(--text-white);
  font-size: 24px;
  cursor: pointer;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid var(--primary);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  margin: 0;
  font-weight: 700;
  font-size: 14px;
  color: var(--text-white);
}

.user-role {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
}

.admin-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

/* ── Responsive ──────────────────────────────────── */
@media (max-width: 1024px) {
  .sidebar {
    width: 250px;
  }

  .admin-main {
    margin-left: 250px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: absolute;
    left: -100%;
    top: 80px;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }

  .sidebar-close {
    display: block;
  }

  .sidebar.open {
    left: 0;
  }

  .admin-main {
    margin-left: 0;
  }

  .toggle-sidebar {
    display: block;
  }

  .admin-header {
    justify-content: flex-start;
  }

  .admin-content {
    padding: 16px;
  }
}
</style>
