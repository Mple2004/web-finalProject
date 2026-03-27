<template>
  <main v-if="product" class="page">
    <!-- Breadcrumbs -->
    <nav class="breadcrumbs">
      <router-link to="/" class="crumb-link">Home</router-link>
      <span class="material-symbols-outlined crumb-sep">chevron_right</span>
      <router-link to="/category" class="crumb-link">Category</router-link>
      <span class="material-symbols-outlined crumb-sep">chevron_right</span>
      <router-link :to="`/category/${product.subcategory.toLowerCase()}`" class="crumb-link">{{ product.subcategory }}</router-link>

      <span class="material-symbols-outlined crumb-sep">chevron_right</span>
      <span class="crumb-current">{{ product.name }}</span>
    </nav>

    <div class="detail-grid">
      <!-- Gallery -->
      <div class="gallery">
        <div class="main-image">
          <img :src="mainImage" :alt="product.name" />
        </div>
        <div class="thumbs">
          <div v-for="(img, i) in thumbImages" :key="i"
               :class="['thumb', { active: mainImage === img }]"
               @click="mainImage = img">
            <img :src="img" />
          </div>
        </div>
      </div>

      <!-- Info -->
      <div class="info">
        <span v-if="product.tag" class="detail-tag">{{ tagLabel }}</span>
        <h1 class="detail-title">{{ product.name }}</h1>
        <div class="detail-meta">
          <span class="meta-specs">{{ product.volume }} | {{ product.abv }}</span>
          <span class="meta-divider" />
          <div class="stars">
            <span v-for="i in 5" :key="i" class="material-symbols-outlined star fill-icon">
              {{ i <= Math.floor(product.rating) ? 'star' : (i - 0.5 <= product.rating ? 'star_half' : 'star') }}
            </span>
            <span class="review-count">({{ product.reviews }})</span>
          </div>
        </div>

        <!-- Price Box -->
        <div class="price-box">
          <div class="price-row">
            <span class="big-price">${{ product.price.toFixed(2) }}</span>
            <span v-if="product.oldPrice" class="old-price">${{ product.oldPrice.toFixed(2) }}</span>
          </div>
          <div class="qty-row">
            <span class="qty-label">Quantity</span>
            <div class="qty-input">
              <button @click="qty = Math.max(1, qty - 1)" class="qty-btn">
                <span class="material-symbols-outlined">remove</span>
              </button>
              <span class="qty-val">{{ qty }}</span>
              <button @click="qty++" class="qty-btn">
                <span class="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>
          <button class="add-btn" @click="addProduct">
            <span class="material-symbols-outlined">shopping_cart</span>
            Add to Cart
          </button>
          <div class="status-row">
            <div class="status-item">
              <span class="material-symbols-outlined" style="color:var(--green);font-size:18px">check_circle</span>
              In Stock
            </div>
            <div class="status-item">
              <span class="material-symbols-outlined" style="color:var(--primary);font-size:18px">local_shipping</span>
              Express Delivery
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="desc-section">
          <h3>Description</h3>
          <p>{{ product.description }}</p>
        </div>

        <div v-if="product.nose" class="tasting-grid">
          <div class="tasting-card">
            <span class="tasting-label">Nose</span>
            <p>{{ product.nose }}</p>
          </div>
          <div class="tasting-card">
            <span class="tasting-label">Palate</span>
            <p>{{ product.palate }}</p>
          </div>
        </div>

        <!-- Accordions -->
        <div class="accordion" @click="showSpecs = !showSpecs">
          <div class="accordion-header">
            <span>Product Specifications</span>
            <span class="material-symbols-outlined">{{ showSpecs ? 'expand_less' : 'expand_more' }}</span>
          </div>
          <div v-if="showSpecs" class="accordion-body">
            <div class="spec-row"><span>Volume</span><span>{{ product.volume }}</span></div>
            <div class="spec-row"><span>ABV</span><span>{{ product.abv }}</span></div>
            <div class="spec-row"><span>Region</span><span>{{ product.region }}</span></div>
            <div class="spec-row last"><span>Type</span><span>{{ product.subcategory }}</span></div>
          </div>
        </div>
        <div class="accordion" @click="showShip = !showShip">
          <div class="accordion-header">
            <span>Shipping &amp; Returns</span>
            <span class="material-symbols-outlined">{{ showShip ? 'expand_less' : 'expand_more' }}</span>
          </div>
          <div v-if="showShip" class="accordion-body">
            <p>Free shipping on orders over $100. Standard 3-5 business days.</p>
            <p>Returns within 14 days for unopened items.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Related -->
    <section class="related">
      <div class="related-header">
        <h2>You Might Also Like</h2>
        <router-link to="/category" class="view-all">View All</router-link>
      </div>
      <div class="related-grid">
        <div v-for="rp in relatedProducts" :key="rp.id" class="related-card" @click="goTo(rp.id)">
          <div class="related-img"><img :src="rp.image" /></div>
          <h3 class="related-name">{{ rp.name }}</h3>
          <p class="related-price">${{ rp.price.toFixed(2) }}</p>
        </div>
      </div>
    </section>
  </main>
  <main v-else class="not-found"><p>Product not found</p></main>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'
import { useCart } from '../stores/cart'
import { useToast } from '../stores/toast'
import { useAuth } from '../stores/auth'
import { useLoginModal } from '../stores/loginModal'

const route = useRoute()
const router = useRouter()
const cart = useCart()
const toast = useToast()
const auth = useAuth()
const loginModal = useLoginModal()

const allProducts = ref([])
const product = ref(null)
const qty = ref(1)
const showSpecs = ref(false)
const showShip = ref(false)
const mainImage = ref('')

// แปลง field จาก DB ให้ตรงกับ template
function mapProduct(p) {
  return {
    id: p.pdID,
    name: p.pdName,
    category: p.pdCategory,
    subcategory: p.pdSubCategory,
    brand: p.pdBrand,
    region: p.pdCountry,
    price: Number(p.pdPrice),
    volume: p.pdSize ? `${p.pdSize}ml` : '',
    abv: '',
    description: `${p.pdBrand} — ${p.pdSubCategory} จาก ${p.pdCountry}`,
    image: p.pdImage || `https://placehold.co/600x600?text=${encodeURIComponent(p.pdName)}`,
    tag: null,
    reviews: 0,
    rating: 4,
    nose: '',
    palate: '',
    oldPrice: null,
  }
}

const thumbImages = computed(() => {
  if (!product.value) return []
  const others = allProducts.value
    .filter(p => p.id !== product.value.id)
    .slice(0, 2)
    .map(p => p.image)
  return [product.value.image, ...others]
})

const relatedProducts = computed(() => {
  if (!product.value) return []
  return allProducts.value
    .filter(p => p.subcategory === product.value.subcategory && p.id !== product.value.id)
    .slice(0, 4)
})

const tagLabel = computed(() => {
  const t = product.value?.tag
  if (t === 'rare') return 'Rare Find'
  if (t === 'new') return 'New Arrival'
  if (t === 'limited') return 'Limited Release'
  return t
})

watch(product, p => {
  if (p) { mainImage.value = p.image; qty.value = 1; showSpecs.value = false; showShip.value = false }
}, { immediate: true })

function addProduct() {
  if (!product.value) return
  if (!auth.isLoggedIn.value) { loginModal.show(); return }
  for (let i = 0; i < qty.value; i++) cart.add(product.value)
  toast.show(`✓ Added ${qty.value}x "${product.value.name}"`)
}

function goTo(id) {
  router.push(`/product/${id}`)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// แก้: ดึงสินค้าจาก API จริง
onMounted(async () => {
  try {
    const id = route.params.id

    // ดึงสินค้าเดี่ยวตาม ID
    const data = await api.getProductById(id)
    if (Array.isArray(data) && data.length > 0) {
      product.value = mapProduct(data[0])
      mainImage.value = product.value.image
    }

    // ดึงสินค้าทั้งหมดสำหรับ related products
    const allData = await api.getProducts()
    allProducts.value = Array.isArray(allData) ? allData.map(mapProduct) : []

  } catch (err) {
    console.error('ProductDetail load error:', err.message)
  }
})
</script>

<style scoped>
.page { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
.not-found { display: flex; align-items: center; justify-content: center; padding: 128px 0; color: var(--text-muted); font-size: 18px; }

/* Breadcrumbs */
.breadcrumbs { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding-bottom: 24px; font-size: 14px; font-weight: 500; }
.crumb-link { color: var(--primary); }
.crumb-link:hover { text-decoration: underline; }
.crumb-sep { font-size: 12px; color: var(--text-dim); }
.crumb-current { color: var(--text-muted); }

/* Grid */
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }

/* Gallery */
.gallery { display: flex; flex-direction: column; gap: 16px; }
.main-image {
  aspect-ratio: 1; border-radius: var(--radius-xl); overflow: hidden;
  border: 1px solid var(--border); background: var(--primary-05);
}
.main-image img { width: 100%; height: 100%; object-fit: cover; }
.thumbs { display: flex; gap: 12px; }
.thumb {
  width: 80px; height: 80px; border-radius: var(--radius);
  overflow: hidden; cursor: pointer; border: 2px solid var(--border);
  opacity: 0.5; transition: all 0.2s;
}
.thumb.active { border-color: var(--primary); opacity: 1; }
.thumb:hover { opacity: 1; }
.thumb img { width: 100%; height: 100%; object-fit: cover; }

/* Info */
.info { display: flex; flex-direction: column; }
.detail-tag {
  display: inline-block; align-self: flex-start;
  padding: 4px 12px; background: var(--primary); color: white;
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.1em; border-radius: 4px; margin-bottom: 12px;
}
.detail-title { font-size: 36px; font-weight: 900; line-height: 1.1; margin-bottom: 12px; }
.detail-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.meta-specs { color: var(--primary); font-size: 16px; font-weight: 700; }
.meta-divider { width: 1px; height: 16px; background: var(--text-dim); }
.stars { display: flex; align-items: center; gap: 2px; }
.star { font-size: 16px; color: var(--amber-500); }
.review-count { font-size: 14px; color: var(--text-muted); margin-left: 4px; }

/* Price Box */
.price-box {
  padding: 20px; background: var(--primary-05); border: 1px solid var(--border);
  border-radius: var(--radius-xl); margin-bottom: 24px;
}
.price-row { display: flex; align-items: baseline; gap: 12px; margin-bottom: 16px; }
.big-price { font-size: 36px; font-weight: 900; }
.old-price { font-size: 18px; color: var(--text-muted); text-decoration: line-through; }
.qty-row { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.qty-label { font-size: 13px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); }
.qty-input {
  display: flex; align-items: center;
  border: 1px solid var(--border); border-radius: var(--radius);
  background: var(--bg-dark); overflow: hidden;
}
.qty-btn { padding: 8px; color: var(--primary); transition: background 0.2s; }
.qty-btn:hover { background: var(--primary-10); }
.qty-btn .material-symbols-outlined { font-size: 20px; }
.qty-val { width: 40px; text-align: center; font-weight: 700; font-size: 14px; }
.add-btn {
  width: 100%; padding: 14px; border-radius: var(--radius);
  background: var(--primary); color: white; font-weight: 700; font-size: 16px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: var(--shadow-primary); transition: background 0.2s;
}
.add-btn:hover { background: var(--primary-hover); }
.status-row { display: flex; gap: 20px; margin-top: 12px; }
.status-item { display: flex; align-items: center; gap: 4px; font-size: 14px; color: var(--text-muted); }

/* Description */
.desc-section { margin-bottom: 20px; }
.desc-section h3 { font-weight: 700; margin-bottom: 8px; }
.desc-section p { font-size: 14px; color: var(--text-light); line-height: 1.7; }
.tasting-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
.tasting-card { padding: 14px; border-radius: var(--radius); background: var(--primary-05); border: 1px solid var(--primary-05); }
.tasting-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--primary); margin-bottom: 4px; display: block; }
.tasting-card p { font-size: 12px; color: var(--text-light); }

/* Accordions */
.accordion { border-top: 1px solid var(--border); padding-top: 16px; margin-bottom: 8px; cursor: pointer; }
.accordion-header { display: flex; justify-content: space-between; align-items: center; font-weight: 700; font-size: 14px; }
.accordion-header .material-symbols-outlined { color: var(--text-muted); transition: color 0.2s; }
.accordion:hover .accordion-header .material-symbols-outlined { color: var(--primary); }
.accordion-body { margin-top: 12px; font-size: 14px; color: var(--text-light); }
.accordion-body p { margin-bottom: 4px; }
.spec-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--primary-05); }
.spec-row.last { border-bottom: none; }
.spec-row span:first-child { color: var(--text-muted); }

/* Related */
.related { margin-top: 64px; }
.related-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.related-header h2 { font-size: 24px; font-weight: 900; }
.view-all { color: var(--primary); font-weight: 700; font-size: 14px; }
.view-all:hover { text-decoration: underline; }
.related-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.related-card { cursor: pointer; }
.related-img { aspect-ratio: 1; border-radius: var(--radius-xl); background: var(--primary-05); overflow: hidden; margin-bottom: 8px; border: 1px solid var(--primary-05); }
.related-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.related-card:hover .related-img img { transform: scale(1.05); }
.related-name { font-size: 14px; font-weight: 700; transition: color 0.2s; line-height: 1.3; }
.related-card:hover .related-name { color: var(--primary); }
.related-price { font-size: 14px; font-weight: 700; color: var(--primary); margin-top: 2px; }

@media (max-width: 768px) {
  .detail-grid { grid-template-columns: 1fr; gap: 32px; }
  .detail-title { font-size: 24px; }
  .related-grid { grid-template-columns: 1fr 1fr; }
}
</style>
