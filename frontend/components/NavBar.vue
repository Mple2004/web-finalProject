<template>
  <nav class="navbar navbar-expand-lg" style="background:#110d06; border-bottom:1px solid #3a2e1e;">
    <div class="container-fluid px-4">
      
      <!-- Brand -->
      <a class="navbar-brand text-white fw-bold" href="#">
        🍷 SPIRIT <span style="color:#c9a84c">&</span> VINE
      </a>

      <!-- Links -->
      <div class="d-flex gap-4">
        <router-link to="/category/Beer" class="nav-link">Beer</router-link>
        <router-link to="/category/Wine" class="nav-link">Wine</router-link>
        <router-link to="/category/Spirits" class="nav-link">Spirits</router-link>
        <a href="#" class="text-decoration-none" style="color:#a89880">Contact Us</a>
      </div>

      <!-- Search + Icons -->
      <div class="d-flex align-items-center gap-3">
        
        <!-- Search -->
        <input 
          type="text" 
          class="form-control form-control-sm" 
          placeholder="Search premium collection..."
          style="background:#2a2010; border-color:#3a2e1e; color:#a89880; width:200px; border-radius:20px;"
        />

        <!-- Cart -->
        <button class="btn btn-sm position-relative" style="color:white; font-size:1.2rem;">
          🛒
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size:0.6rem;">
            2
          </span>
        </button>

        <!-- Profile Icon + Dropdown -->
        <div class="dropdown">
          <button 
            class="btn btn-sm dropdown-toggle d-flex align-items-center gap-2" 
            type="button" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
            style="background:#2a2010; border:1px solid #3a2e1e; color:white; border-radius:50px; padding:6px 14px;"
          >
            <!-- ถ้า login แล้วแสดงรูป, ถ้ายังไม่ login แสดง icon -->
            <span v-if="isLoggedIn">
              <img 
                :src="user.avatar" 
                style="width:28px; height:28px; border-radius:50%; object-fit:cover;"
              />
            </span>
            <span v-else style="font-size:1.1rem;">👤</span>
            
            <span style="font-size:0.85rem;">
              {{ isLoggedIn ? user.name : 'Login' }}
            </span>
          </button>

          <!-- Dropdown Menu -->
          <ul class="dropdown-menu dropdown-menu-end" 
              style="background:#221a0e; border:1px solid #3a2e1e; min-width:180px;">
            
            <!-- ถ้า Login แล้ว -->
            <template v-if="isLoggedIn">
              <li>
                <div class="px-3 py-2 border-bottom" style="border-color:#3a2e1e !important;">
                  <div class="text-white fw-semibold" style="font-size:0.9rem;">{{ user.name }}</div>
                  <div style="color:#a89880; font-size:0.75rem;">{{ user.email }}</div>
                </div>
              </li>
              <li>
                <a class="dropdown-item" href="#" style="color:#a89880;">
                  👤 My Profile
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" style="color:#a89880;">
                  📦 My Orders
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" style="color:#a89880;">
                  ❤️ Wishlist
                </a>
              </li>
              <li><hr class="dropdown-divider" style="border-color:#3a2e1e;"></li>
              <li>
                <a class="dropdown-item" href="#" style="color:#c0392b;" @click="logout">
                  🚪 Logout
                </a>
              </li>
            </template>

            <!-- ถ้ายังไม่ Login -->
            <template v-else>
              <li>
                <a class="dropdown-item" href="#" style="color:#a89880;" @click="login">
                  🔑 Login
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" style="color:#a89880;">
                  📝 Register
                </a>
              </li>
            </template>

          </ul>
        </div>

      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

// Mock state — ตอนนี้ใช้ ref จำลอง, อนาคตเชื่อมกับ Backend
const isLoggedIn = ref(false)

const user = ref({
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://i.pravatar.cc/100?img=12'
})

// Mock login/logout — อนาคตเรียก API จริง
const login = () => {
  isLoggedIn.value = true
}

const logout = () => {
  isLoggedIn.value = false
}
</script>

<style scoped>
.dropdown-item:hover {
  background: #3a2e1e !important;
  color: white !important;
}
</style>