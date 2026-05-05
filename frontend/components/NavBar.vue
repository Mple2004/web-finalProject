<template>
  <nav class="navbar navbar-expand-lg" style="background:#110d06; border-bottom:1px solid #3a2e1e; min-height:50px;">
    <div class="container-fluid px-4" style="min-height:50px;">
      
      <!-- Brand -->
      <router-link to="/" class="navbar-brand text-white fw-bold">
        🍷 SPIRIT <span style="color:#c9a84c">&</span> VINE
      </router-link>

      <!-- Links -->
      <div class="nav-links">
        <router-link to="/category/beer" class="nav-link">Beer</router-link>
        <router-link to="/category/wine" class="nav-link">Wine</router-link>
        <router-link to="/category/Whisky" class="nav-link">Whisky</router-link>
        <router-link to="/contact" class="nav-link">Contact Us</router-link>
      </div>

      <!-- Search + Icons -->
      <div class="d-flex align-items-center gap-3">
        
        <!-- Search -->
        <div class="search-wrapper">
          <div class="search">
            <span class="material-symbols-outlined si">search</span>
            <input
              v-model="searchQuery"
              placeholder="Search products..."
              @keyup.enter="handleSearch"
              @focus="showSuggestions = true"
              @input="debouncedFetch"
              @blur="setTimeout(() => showSuggestions = false, 150)"
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <!-- Suggestions Dropdown -->
          <div v-if="showSuggestions && searchQuery && (isSearching || filteredSuggestions.length)" class="suggestions-list">
            <div v-if="isSearching" class="suggestion-loading">
              <span class="spinner"></span> Searching...
            </div>
            <div
              v-for="product in filteredSuggestions.slice(0, 5)"
              :key="product.pdID"
              class="suggestion-item"
              @click="goToProduct(product.pdID)"
            >
              <img :src="product.pdImage || `https://placehold.co/40x48?text=${encodeURIComponent(product.pdName)}`" :alt="product.pdName" class="suggestion-img" />
              <div class="suggestion-info">
                <div class="suggestion-name">{{ product.pdName }}</div>
                <div class="suggestion-brand">{{ product.pdBrand }}</div>
              </div>
              <div class="suggestion-price">฿{{ product.pdPrice.toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <!-- Cart -->
        <button class="cart-btn" @click="cart.open()">
          <span class="material-symbols-outlined">shopping_cart</span>

          <span v-if="cart.state.items.length" class="badge">
            {{ cart.state.items.length }}
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
                :src="`http://localhost:5000/img_mem/${encodeURIComponent(auth.user.value?.email)}.jpg`" 
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
                <router-link to="/profile" class="dropdown-item" style="color:#a89880;">
                  👤 My Profile
                </router-link>
              </li>
              <li v-if="user.status === 'admin'">
                <router-link to="/admin/dashboard" class="dropdown-item" style="color:#c9a84c;">
                  ⚙️ Admin Dashboard
                </router-link>
              </li>
              <li>
                <router-link to="/orders" class="dropdown-item" style="color:#a89880;">
                  📦 My Orders
                </router-link>
              </li>
              <li>
                <router-link to="/wishlist" class="dropdown-item" style="color:#a89880;">
                  ❤️ Wishlist
                </router-link>
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
                <router-link to="/login" class="dropdown-item" style="color:#a89880;">
                  🔑 Login
                </router-link>
              </li>
              <li>
                <router-link to="/register" class="dropdown-item" style="color:#a89880;">
                  📝 Register
                </router-link>
              </li>
            </template>

          </ul>
        </div>

      </div>
    </div>
  </nav>
</template>



<script setup>
import { storeToRefs } from 'pinia'
import { ref, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCart } from '../stores/cart'
import { useAuth } from '../stores/auth'
import api from '../services/api'

const cart = useCart()
const auth = useAuth()
const router = useRouter()
const route = useRoute()

const { isLoggedIn } = storeToRefs(auth)
const { user } = storeToRefs(auth)

const searchQuery = ref('')
const showSuggestions = ref(false)
const filteredSuggestions = ref([])
const isSearching = ref(false)



// ---- Debounce helper ----
let debounceTimer = null
onUnmounted(() => clearTimeout(debounceTimer))

const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  const q = searchQuery.value.trim()
  if (!q) {
    filteredSuggestions.value = []
    if (route.name === 'category') {
      router.replace({ name: 'category', params: route.params, query: {} })
    }
    return
  }
  debounceTimer = setTimeout(() => {
    fetchSuggestions(q)
    if (route.name === 'category') {
      router.replace({ name: 'category', params: route.params, query: { search: q } })
    }
  }, 300)
}

// ---- Fetch from real API ----
const fetchSuggestions = async (query) => {
  try {
    isSearching.value = true
    const data = await api.searchProducts(query)
    filteredSuggestions.value = Array.isArray(data) ? data : (data.data ?? [])
  } catch (err) {
    console.error('Search error:', err)
    filteredSuggestions.value = []
  } finally {
    isSearching.value = false
  }
}



const clearSearch = () => {
  searchQuery.value = ''
  filteredSuggestions.value = []
  showSuggestions.value = false
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    showSuggestions.value = false
    // ไปหน้า Category พร้อมแนบ Query String (คุณต้องมั่นใจว่ามี route หน้า category รับค่านี้นะครับ)
    router.push(`/category?search=${encodeURIComponent(searchQuery.value)}`)
  }
}

const goToProduct = (pdID) => {
  searchQuery.value = ''
  filteredSuggestions.value = []
  showSuggestions.value = false
  router.push(`/product/${pdID}`)
}

// sync search query จาก route
watch(() => route.query.search, (search) => {
  if (search) {
    searchQuery.value = search
  } else {
    searchQuery.value = '' // เคลียร์ถ้าไม่มี query parameter
  }
}, { immediate: true })

const logout = async () => {
  await auth.logout()   // auth store ควร clear token + call /api/auth/logout
  router.push('/')
}
</script>

<style scoped>
.nav-links { display: flex; gap: 32px; }
.nav-link {
  color: #a89880;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  position: relative;
  padding-bottom: 2px;
  transition: color 0.2s;
}
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0; right: 0;
  height: 1px;
  background: var(--primary);
  transform: scaleX(0);
  transition: transform 0.25s ease;
  transform-origin: left;
}
.nav-link:hover, .nav-link.router-link-active { color: white; }
.nav-link:hover::after, .nav-link.router-link-active::after { transform: scaleX(1); }

.dropdown-item:hover {
  background: #3a2e1e !important;
  color: white !important;
}
.search-wrapper { position: relative; }
.search { position: relative; }
.si { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 18px; color: var(--text-muted); }
.search input {
  width: 240px; padding: 8px 36px 8px 36px;
  background: rgba(255,255,255,0.06); border: none; border-radius: 8px;
  color: white; font-size: 13px; outline: none;
}
.search input::placeholder { color: var(--text-muted); }
.search input:focus { box-shadow: 0 0 0 2px var(--primary); }
.search-clear {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: var(--text-muted);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  padding: 4px; transition: color 0.2s;
}
.search-clear:hover { color: white; }
.search-clear .material-symbols-outlined { font-size: 16px; }

.suggestions-list {
  position: absolute; top: 100%; left: 0; right: 0;
  background: #221a0e; border: 1px solid #3a2e1e;
  border-top: none; border-radius: 0 0 8px 8px;
  max-height: 400px; overflow-y: auto; z-index: 100;
  box-shadow: 0 8px 16px rgba(0,0,0,0.3);
  animation: slideDown 0.2s ease both;
}

.suggestion-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; cursor: pointer;
  transition: background 0.2s; border-bottom: 1px solid #3a2e1e;
}
.suggestion-item:hover { background: #3a2e1e; }
.suggestion-item:last-child { border-bottom: none; }

.suggestion-img { width: 40px; height: 48px; object-fit: cover; border-radius: 4px; }
.suggestion-info { flex: 1; min-width: 0; }
.suggestion-name { font-size: 13px; color: white; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.suggestion-brand { font-size: 11px; color: #a89880; margin-top: 2px; }
.suggestion-price { font-size: 13px; color: #c9a84c; font-weight: 600; white-space: nowrap; }

.suggestion-loading {
  padding: 16px; text-align: center; color: #a89880; font-size: 13px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.spinner {
  width: 14px; height: 14px; border: 2px solid #3a2e1e;
  border-top-color: #c9a84c; border-radius: 50%;
  animation: spin 0.6s linear infinite; display: inline-block;
}
.suggestion-empty { padding: 16px; text-align: center; color: #a89880; font-size: 13px; }

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
</style>