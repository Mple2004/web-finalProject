<template>
  <main class="page">
    <!-- Hero Banner -->
    <div class="hero">
      <div class="hero-overlay" />
      <div class="hero-bg" :style="{ backgroundImage: `url('${heroImage}')` }" />
      <div class="hero-content">
        <h2 class="hero-title">Masterpiece Spirits</h2>
        <p class="hero-desc">Explore our curated selection of world-class distillations, from rare single malts to artisanal agave spirits.</p>
        <div class="hero-actions">
          <button class="btn-primary">Shop Best Sellers</button>
          <button class="btn-outline">Member Exclusives</button>
        </div>
      </div>
    </div>

    <!-- Layout -->
    <div class="layout">
      <SidebarFilter
        class="desktop-sidebar"
        :subcategories="subcategories"
        :regions="allRegions"
        :total-count="allProducts.length"
        v-model:model-subcategory="activeSubcategory"
        v-model:model-min-price="minPrice"
        v-model:model-max-price="maxPrice"
        v-model:model-regions="selectedRegions"
      />

      <div class="content">
        <!-- Toolbar -->
        <div class="toolbar">
          <div>
            <h2 class="collection-title">{{ collectionTitle }}</h2>
            <p class="collection-count">Showing {{ filteredProducts.length }} products</p>
          </div>
          <div class="toolbar-right">
            <div class="view-toggle">
              <button :class="['toggle-btn', { active: viewMode === 'grid' }]" @click="viewMode = 'grid'">
                <span class="material-symbols-outlined">grid_view</span>
              </button>
              <button :class="['toggle-btn', { active: viewMode === 'list' }]" @click="viewMode = 'list'">
                <span class="material-symbols-outlined">view_list</span>
              </button>
            </div>
            <select v-model="sortBy" class="sort-select">
              <option value="popular">Sort by: Popularity</option>
              <option value="bestseller">Sort by: Best Sellers</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading"><div class="spinner" /></div>

        <!-- Grid View -->
        <div v-else-if="viewMode === 'grid'" class="product-grid">
          <ProductCard
            v-for="(p, i) in paginatedProducts" :key="p.id"
            :product="p" :delay="i * 60"
            :is-wishlisted="wishlist.has(p.id)"
            @add-to-cart="handleAdd"
            @toggle-wishlist="toggleWish"
          />
        </div>

        <!-- List View -->
        <div v-else class="product-list">
          <div v-for="(p, i) in paginatedProducts" :key="p.id"
               class="list-card"
               :style="{ animationDelay: `${i * 40}ms` }"
               @click="$router.push(`/product/${p.id}`)">
            <div class="list-thumb">
              <div v-if="p.tag" :class="['list-tag', `tag-${p.tag}`]">{{ p.tag }}</div>
              <img :src="p.image" />
            </div>
            <div class="list-info">
              <p class="list-region">{{ p.region }}</p>
              <h3 class="list-name line-clamp-1">{{ p.name }}</h3>
              <p class="list-desc line-clamp-2">{{ p.description }}</p>
              <div class="list-bottom">
                <div>
                  <span class="list-price">${{ p.price.toFixed(2) }}</span>
                  <span v-if="p.oldPrice" class="list-old">${{ p.oldPrice.toFixed(2) }}</span>
                  <p class="list-meta">{{ p.volume }} | {{ p.abv }}</p>
                </div>
                <button class="list-cart-btn" @click.stop="handleAdd(p)">
                  <span class="material-symbols-outlined">add_shopping_cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-if="!loading && filteredProducts.length === 0" class="empty-state">
          <span class="material-symbols-outlined">search_off</span>
          <p>No products found</p>
          <p class="empty-sub">Try adjusting your filters.</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button class="page-btn" :disabled="page === 1" @click="page = Math.max(1, page - 1)">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <template v-for="pg in displayPages" :key="pg">
            <span v-if="pg === '...'" class="page-dots">...</span>
            <button v-else :class="['page-btn', 'page-num', { active: page === pg }]" @click="page = pg">
              {{ pg }}
            </button>
          </template>
          <button class="page-btn" :disabled="page === totalPages" @click="page = Math.min(totalPages, page + 1)">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'
import { MOCK_PRODUCTS, HERO_IMAGE } from '../data/mockData'
import { useCart } from '../stores/cart'
import { useToast } from '../stores/toast'
import { useAuth } from '../stores/auth'
import { useLoginModal } from '../stores/loginModal'
import ProductCard from '../components/ProductCard.vue'
import SidebarFilter from '../components/SidebarFilter.vue'

const route = useRoute()
const cart = useCart()
const toast = useToast()
const auth = useAuth()
const loginModal = useLoginModal()

const loading = ref(true)
const allProducts = ref([])
const activeSubcategory = ref('')
const minPrice = ref(0)
const maxPrice = ref(2500)
const selectedRegions = ref([])
const sortBy = ref('popular')
const viewMode = ref('grid')
const page = ref(1)
const perPage = 9
const wishlist = reactive(new Set())
const heroImage = HERO_IMAGE

const subcategories = computed(() => {
  const m = {}
  allProducts.value.forEach(p => { m[p.subcategory] = (m[p.subcategory] || 0) + 1 })
  return Object.entries(m).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
})

const allRegions = computed(() => {
  const s = new Set()
  allProducts.value.forEach(p => s.add(p.region.split(',').pop().trim()))
  return [...s].sort()
})

const collectionTitle = computed(() =>
  activeSubcategory.value ? `${activeSubcategory.value} Collection` : 'All Spirits Collection'
)

const filteredProducts = computed(() => {
  let list = [...allProducts.value]
  if (activeSubcategory.value) list = list.filter(p => p.subcategory === activeSubcategory.value)
  if (minPrice.value > 0 || maxPrice.value < 2500) list = list.filter(p => p.price >= minPrice.value && p.price <= maxPrice.value)
  if (selectedRegions.value.length) list = list.filter(p => selectedRegions.value.some(r => p.region.includes(r)))
  if (sortBy.value === 'price-asc') list.sort((a, b) => a.price - b.price)
  else if (sortBy.value === 'price-desc') list.sort((a, b) => b.price - a.price)
  else if (sortBy.value === 'newest') list.sort((a, b) => b.id - a.id)
  else if (sortBy.value === 'bestseller') list.sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
  else list.sort((a, b) => b.reviews - a.reviews)
  return list
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / perPage) || 1)
const paginatedProducts = computed(() => {
  const s = (page.value - 1) * perPage
  return filteredProducts.value.slice(s, s + perPage)
})
const displayPages = computed(() => {
  const tp = totalPages.value
  if (tp <= 5) return Array.from({ length: tp }, (_, i) => i + 1)
  const p = [1]
  if (page.value > 3) p.push('...')
  for (let i = Math.max(2, page.value - 1); i <= Math.min(tp - 1, page.value + 1); i++) p.push(i)
  if (page.value < tp - 2) p.push('...')
  p.push(tp)
  return p
})

watch([activeSubcategory, minPrice, maxPrice, selectedRegions, sortBy], () => { page.value = 1 })

// Watch for slug changes and auto-set category
watch(() => route.params.slug, (slug) => {
  page.value = 1
  selectedRegions.value = []
  minPrice.value = 0
  maxPrice.value = 2500
  
  // Convert slug to category format (beer -> Beer, spirits -> Spirits, etc.)
  if (slug) {
    activeSubcategory.value = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase()
  } else {
    activeSubcategory.value = ''
  }
}, { immediate: true })

function handleAdd(p) {
  if (!auth.isLoggedIn.value) {
    loginModal.show()
    return
  }
  cart.add(p)
  toast.show(`✓ Added "${p.name}"`)
}
function toggleWish(id) { wishlist.has(id) ? wishlist.delete(id) : wishlist.add(id) }

onMounted(async () => {
  loading.value = true
  allProducts.value = MOCK_PRODUCTS
  loading.value = false
})
</script>

<style scoped>
.page { max-width: 1280px; margin: 0 auto; padding: 32px 40px; }

/* Hero */
.hero {
  position: relative; border-radius: var(--radius-xl); overflow: hidden;
  min-height: 320px; display: flex; align-items: flex-end; margin-bottom: 48px;
}
.hero-overlay {
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(to top, var(--bg-dark), rgba(34,16,19,0.4), transparent);
}
.hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
.hero-content { position: relative; z-index: 2; padding: 32px 48px; }
.hero-title { font-size: 48px; font-weight: 700; color: white; margin-bottom: 12px; }
.hero-desc { color: #e2e8f0; max-width: 520px; font-size: 16px; margin-bottom: 24px; line-height: 1.6; }
.hero-actions { display: flex; gap: 16px; }
.btn-primary {
  padding: 12px 32px; background: var(--primary); color: white;
  border-radius: var(--radius); font-weight: 700; font-size: 14px;
  transition: background 0.2s;
}
.btn-primary:hover { background: var(--primary-hover); }

/* Layout */
.layout { display: flex; gap: 40px; }
.desktop-sidebar { display: block; }

/* Toolbar */
.toolbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
.collection-title { font-size: 24px; font-weight: 700; }
.collection-count { font-size: 14px; color: var(--text-muted); margin-top: 2px; }
.toolbar-right { display: flex; align-items: center; gap: 16px; }
.view-toggle { display: flex; background: var(--primary-10); border-radius: var(--radius); padding: 4px; }
.toggle-btn {
  padding: 8px; border-radius: 6px; color: var(--text-muted);
  transition: all 0.2s; display: flex; align-items: center; justify-content: center;
}
.toggle-btn .material-symbols-outlined { font-size: 18px; }
.toggle-btn.active { background: var(--primary); color: white; }
.toggle-btn:hover:not(.active) { color: var(--primary); }
.sort-select {
  padding: 8px 16px; background: var(--bg-dark);
  border: 1px solid var(--border); border-radius: var(--radius);
  color: var(--text-light); font-size: 14px; outline: none;
}
.sort-select:focus { border-color: var(--primary); }

.content { flex: 1; min-width: 0; }

/* Grid */
.product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }

/* List */
.product-list { display: flex; flex-direction: column; gap: 16px; }
.list-card {
  display: flex; gap: 20px; padding: 16px;
  background: var(--primary-05); border-radius: var(--radius-xl);
  border: 1px solid transparent; cursor: pointer; transition: all 0.3s;
  animation: fadeUp 0.4s ease both;
}
.list-card:hover { border-color: var(--primary-20); }
.list-thumb {
  width: 112px; height: 144px; border-radius: var(--radius);
  background: var(--primary-10); overflow: hidden; flex-shrink: 0; position: relative;
}
.list-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.list-card:hover .list-thumb img { transform: scale(1.05); }
.list-tag {
  position: absolute; top: 8px; left: 8px;
  padding: 2px 6px; border-radius: var(--radius-full);
  font-size: 8px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.1em; color: white;
}
.list-info { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; }
.list-region { font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--primary); margin-bottom: 2px; }
.list-name { font-size: 16px; font-weight: 700; transition: color 0.2s; }
.list-card:hover .list-name { color: var(--primary); }
.list-desc { font-size: 14px; color: var(--text-muted); margin-top: 4px; }
.list-bottom { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
.list-price { font-size: 20px; font-weight: 700; color: var(--primary); }
.list-old { font-size: 12px; color: var(--text-muted); text-decoration: line-through; margin-left: 8px; }
.list-meta { font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-top: 2px; }
.list-cart-btn {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--primary); color: white;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.2s;
}
.list-cart-btn:hover { transform: scale(1.1); }

/* Loading / Empty */
.loading { display: flex; justify-content: center; padding: 96px 0; }
.empty-state { text-align: center; padding: 80px 0; color: var(--text-muted); }
.empty-state .material-symbols-outlined { font-size: 48px; margin-bottom: 12px; opacity: 0.25; display: block; }
.empty-state p:first-of-type { font-weight: 600; }
.empty-sub { font-size: 14px; margin-top: 4px; }

/* Pagination */
.pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 48px; }
.page-btn {
  width: 40px; height: 40px; border-radius: var(--radius);
  border: 1px solid var(--border); color: var(--text-light);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; font-weight: 700;
}
.page-btn:hover:not(:disabled) { background: var(--primary-10); }
.page-btn:disabled { opacity: 0.3; cursor: default; }
.page-btn.active { background: var(--primary); color: white; border-color: var(--primary); box-shadow: var(--shadow-primary); }
.page-dots { padding: 0 8px; color: var(--text-dim); }
.page-num .material-symbols-outlined { font-size: 16px; }

@media (max-width: 1024px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
  .desktop-sidebar { display: none; }
}
@media (max-width: 768px) {
  .page { padding: 16px; }
  .hero-title { font-size: 32px; }
  .hero-content { padding: 24px; }
  .product-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
  .toolbar { flex-direction: column; }
}
</style>
