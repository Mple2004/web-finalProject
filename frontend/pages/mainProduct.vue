<template>
  <main>

    <!-- ================ FEATURED SELECTIONS ================ -->
    <section class="featured">
      <div class="featured-header">
        <div class="featured-left">
          <div class="red-bar" />
          <div>
            <h2 class="section-title">Featured Selections</h2>
            <p class="section-sub">Hand-picked premium choices from our sommeliers.</p>
          </div>
        </div>
        <router-link to="/category" class="view-all">
          View All <span class="material-symbols-outlined arrow">arrow_forward</span>
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-grid">
        <div v-for="i in 4" :key="i" class="skeleton-card" />
      </div>

      <!-- ✅ ใช้ ProductCard แทน inline card -->
      <div v-else class="product-grid">
        <ProductCard
          v-for="(product, i) in products" :key="product.id"
          :product="product"
          :delay="i * 60"
          :is-wishlisted="wishlist.has(product.id)"
          @add-to-cart="addToCart"
          @toggle-wishlist="toggleWish"
        />
      </div>
    </section>

    <!-- ================ BEST SELLER ================ -->
    <section class="featured bestseller">
      <div class="featured-header">
        <div class="featured-left">
          <div class="red-bar" />
          <div>
            <h2 class="section-title">Best Sellers</h2>
            <p class="section-sub">Our most loved bottles, chosen by the crowd.</p>
          </div>
        </div>
        <router-link to="/category" class="view-all">
          View All <span class="material-symbols-outlined arrow">arrow_forward</span>
        </router-link>
      </div>

      <div v-if="loading" class="loading-grid">
        <div v-for="i in 4" :key="i" class="skeleton-card" />
      </div>

      <!-- ✅ ใช้ ProductCard แทน inline card -->
      <div v-else class="product-grid">
        <ProductCard
          v-for="(product, i) in bestSellers" :key="product.id"
          :product="product"
          :delay="i * 60"
          :is-wishlisted="wishlist.has(product.id)"
          @add-to-cart="addToCart"
          @toggle-wishlist="toggleWish"
        />
      </div>
    </section>

    <!-- ================ MEMBERSHIP CTA ================ -->
    <section v-if="!auth.isLoggedIn.value" class="membership">
      <div class="member-inner">
        <h2 class="member-title">
          Join the <em class="member-accent">Inner Circle</em>
        </h2>
        <p class="member-desc">
          Become a member today and unlock exclusive early access to
          limited edition releases, member-only pricing, and invitations
          to private tasting events.
        </p>
        <router-link to="/register" class="btn-membership">Sign Up for Membership</router-link>
        <p class="member-signin">
          Already a member? <router-link to="/login" class="signin-link">Sign in here</router-link>
        </p>
      </div>
    </section>

    <!-- ================ CATEGORY HIGHLIGHTS ================ -->
    <section class="categories">
      <div class="cat-grid">
        <div class="cat-card" v-for="cat in CATEGORY_CARDS" :key="cat.title">
          <img :src="cat.image" :alt="cat.title" class="cat-img" />
          <div class="cat-overlay">
            <h4 class="cat-title">{{ cat.title }}</h4>
            <p class="cat-sub">{{ cat.subtitle }}</p>
          </div>
        </div>
      </div>
    </section>

  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'  // เพิ่ม reactive
import { useRouter } from 'vue-router'
import api from '../services/api'
import { useCart } from '../stores/cart'
import { useToast } from '../stores/toast'
import { useAuth } from '../stores/auth'
import { useLoginModal } from '../stores/loginModal'
import ProductCard from '../components/ProductCard.vue'

const router = useRouter()
const cart = useCart()
const toast = useToast()
const auth = useAuth()
const loginModal = useLoginModal()

const products = ref([])      // Featured (top 4 by rating)
const bestSellers = ref([])   // Best Sellers (top 4 by id หรือ field อื่น)
const loading = ref(true)
const wishlist = reactive(new Set())

// ── CATEGORY_CARDS คงไว้เป็น static เพราะเป็นแค่รูปตกแต่ง ──
const CATEGORY_CARDS = [
  { title: 'Whisky',  subtitle: 'Single malts & blends',   image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600' },
  { title: 'Wine',    subtitle: 'Reds, whites & rosés',    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600' },
  { title: 'Beer',    subtitle: 'Craft & premium lagers',  image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600' },
]

function mapProduct(p) {
  return {
    id:          p.pdID,
    name:        p.pdName,
    price:       Number(p.pdPrice),
    image:       p.pdImage || `https://placehold.co/400x400?text=${encodeURIComponent(p.pdName)}`,
    volume:      p.pdSize ? `${p.pdSize}ml` : '',
    region:      p.pdCountry ?? '',
    rating:      Number(p.pdRating)  || 0,
    reviews:     Number(p.pdReviews) || 0,
    tag:         p.pdTag === 'LIMITED' ? 'LIMITED' : null,
    // ✅ เพิ่ม field ที่ ProductCard ใช้
    description: `${p.pdBrand ?? ''} · ${p.pdSubCategory ?? ''}`,
    abv:         '',
    oldPrice:    null,
  }
}

function toggleWish(id) {
  wishlist.has(id) ? wishlist.delete(id) : wishlist.add(id)
}

onMounted(async () => {
  try {
    const data = await api.getProducts()
    const raw = (Array.isArray(data) ? data : (data.data ?? [])).map(mapProduct)

    // Featured — top 4 by rating
    products.value = [...raw]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4)

    // Best Sellers — top 4 by reviews (ถ้า backend ไม่มี field นี้ใช้ sort by id desc แทน)
    bestSellers.value = [...raw]
      .sort((a, b) => b.reviews - a.reviews || b.id - a.id)
      .slice(0, 4)

  } catch (err) {
    console.error('HomePage: failed to load products', err.message)
  } finally {
    loading.value = false
  }
})

const goToProduct = (id) => router.push({ name: 'product-detail', params: { id } })

function addToCart(product) {
  if (!auth.isLoggedIn.value) { loginModal.show(); return }
  cart.add(product)
  toast.show(`✓ Added "${product.name}"`)
}
</script>

<style scoped>
/* =============================================
   FEATURED SELECTIONS
   ============================================= */
.featured {
  max-width: 1280px;
  margin: 0 auto;
  padding: 80px 80px;
}
.featured-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 48px;
}
.featured-left {
  display: flex;
  gap: 24px;
}
.red-bar {
  width: 4px;
  align-self: stretch;
  background: var(--primary);
  border-radius: 2px;
}
.section-title {
  font-size: 28px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.01em;
}
.section-sub {
  color: var(--text-muted);
  font-size: 14px;
  margin-top: 4px;
  margin-bottom: 0;
}
.view-all {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary);
  font-weight: 700;
  font-size: 14px;
  transition: gap 0.2s;
  text-decoration: none;
}
.view-all:hover { gap: 12px; }
.arrow { font-size: 18px; }

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}

/* Product Card */
.product-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  cursor: pointer;
  background: var(--bg-surface);
  border-radius: 16px;
  overflow: hidden;
  border: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 48px rgba(0,0,0,0.5), 0 4px 16px rgba(212,17,50,0.12);
}
.card-img-wrap {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: 0;
  overflow: hidden;
  background: var(--bg-surface);
}
.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.product-card:hover .card-img {
  transform: scale(1.08);
}
.card-tag {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 4px 12px;
  background: var(--accent-gold);
  color: white;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  border-radius: 4px;
  z-index: 2;
}
.wishlist-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 8px;
  border-radius: 50%;
  background: rgba(26, 11, 13, 0.8);
  color: white;
  backdrop-filter: blur(8px);
  z-index: 2;
  transition: color 0.2s;
  border: none;
  cursor: pointer;
}
.wishlist-btn:hover {
  color: var(--primary);
}

/* Hover action: slide-up Add to Cart */
.hover-action {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 3;
}
.product-card:hover .hover-action {
  transform: translateY(0);
}
.add-cart-btn {
  width: 100%;
  padding: 12px;
  background: var(--primary);
  color: white;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  transition: background 0.2s;
  border: none;
  cursor: pointer;
}
.add-cart-btn:hover { background: rgba(212, 17, 50, 0.8); }

/* Card Info */
.card-info { padding: 16px 18px 20px; }
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.card-name {
  font-size: 16px;
  font-weight: 700;
  transition: color 0.2s;
  line-height: 1.3;
  margin: 0;
}
.product-card:hover .card-name { color: var(--primary); }
.card-price {
  color: var(--accent-gold);
  font-weight: 800;
  font-size: 16px;
  white-space: nowrap;
}
.card-meta {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 6px;
  margin-bottom: 0;
}
.card-stars {
  display: flex;
  gap: 2px;
  margin-top: 10px;
}
.star {
  font-size: 15px;
  color: var(--text-dim);
}
.star.filled {
  color: var(--accent-gold);
  font-variation-settings: 'FILL' 1, 'wght' 400;
}
.review-count {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: 4px;
  align-self: center;
}
.bestseller {
  background: #261316;
  padding: 80px 0;
  max-width: 100%;
  margin: 0;
}
.bestseller > .featured-header,
.bestseller > .product-grid {
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 80px;
  padding-right: 80px;
}

/* =============================================
   MEMBERSHIP CTA
   ============================================= */
.membership {
  background: linear-gradient(160deg, #1a080d 0%, #2d0a14 50%, #1a080d 100%);
  padding: 96px 40px;
}
.member-inner {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.member-title {
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 900;
  letter-spacing: -0.02em;
  margin: 0;
}
.member-accent {
  color: var(--primary);
  font-style: italic;
}
.member-desc {
  color: var(--text-light);
  font-size: 18px;
  line-height: 1.7;
  max-width: 560px;
  margin: 0;
}
.btn-membership {
  margin-top: 16px;
  padding: 20px 48px;
  background: var(--primary);
  color: white;
  border-radius: 8px;
  font-weight: 700;
  font-size: 18px;
  box-shadow: 0 16px 48px rgba(212, 17, 50, 0.35);
  transition: all 0.25s;
  border: none;
  cursor: pointer;
}
.btn-membership:hover {
  background: rgba(212, 17, 50, 0.8);
  transform: scale(1.05);
}
.member-signin {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}
.signin-link {
  color: white;
  text-decoration: underline;
  transition: color 0.2s;
}
.signin-link:hover { color: var(--primary); }

/* =============================================
   CATEGORY HIGHLIGHTS
   ============================================= */
.categories {
  max-width: 1280px;
  margin: 0 auto;
  padding: 80px 80px;
}
.cat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.cat-card {
  position: relative;
  height: 320px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
}
.cat-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s ease;
}
.cat-card:hover .cat-img {
  transform: scale(1.1);
}
.cat-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.15), transparent);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 32px;
}
.cat-title {
  font-size: 24px;
  font-weight: 900;
  text-transform: uppercase;
  font-style: italic;
  letter-spacing: -0.01em;
  margin: 0;
  color: white;
}
.cat-sub {
  color: var(--text-light);
  font-size: 14px;
  margin-top: 4px;
  margin-bottom: 0;
}

/* =============================================
   RESPONSIVE
   ============================================= */
@media (max-width: 1024px) {
  .hero-inner { padding: 0 40px; }
  .featured { padding: 60px 40px; }
  .categories { padding: 60px 40px; }
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
}
@media (max-width: 768px) {
  .hero { height: 500px; }
  .hero-inner { padding: 0 20px; }
  .hero-desc { font-size: 15px; }
  .hero-btns { flex-wrap: wrap; }
  .featured { padding: 40px 20px; }
  .featured-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  .product-grid { grid-template-columns: 1fr 1fr; gap: 16px; }
  .card-name { font-size: 14px; }
  .card-price { font-size: 13px; }
  .card-meta { font-size: 12px; }
  .membership { padding: 60px 20px; }
  .categories { padding: 40px 20px; }
  .cat-grid { grid-template-columns: 1fr; gap: 16px; }
  .cat-card { height: 240px; }
}
.loading-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}
.skeleton-card {
  aspect-ratio: 3/4;
  border-radius: 16px;
  background: var(--bg-surface);
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
</style>