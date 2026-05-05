<template>
  <div class="card" :style="{ animationDelay: `${delay}ms` }">
    <div class="card-image" @click="$router.push(`/product/${product.id}`)">
      <div v-if="product.tag" :class="['tag', `tag-${product.tag}`]">{{ product.tag }}</div>
      <button class="wishlist-btn" @click.stop="handleWishlist">
        <span class="material-symbols-outlined" 
              :class="{ 'fill-icon': isWishlisted }"
              :style="{ color: isWishlisted ? 'var(--primary)' : '' }">
          favorite
        </span>
      </button>
      <img :src="product.image" :alt="product.name" class="product-img" :class="{ blurred: product.stock <= 0 }" />
      <div v-if="product.stock <= 0" class="out-of-stock-overlay">
        <span>Out of Stock</span>
      </div>
    </div>
    <div class="card-body">
      <p class="region">{{ product.region }}</p>
      <h3 class="name line-clamp-1" @click="$router.push(`/product/${product.id}`)">{{ product.name }}</h3>
      <p class="desc line-clamp-2">{{ product.description }}</p>
      <div class="price-row">
        <div>
          <p class="price">฿{{ product.price.toFixed(2) }}</p>
          <p v-if="product.oldPrice" class="old-price">฿{{ product.oldPrice.toFixed(2) }}</p>
          <p class="meta">{{ product.volume }} | {{ product.abv }}</p>
        </div>
        <button class="cart-btn" :class="{ added: justAdded, outofstock: product.stock <= 0 }" @click="handleAddToCart">
          <span class="material-symbols-outlined">{{ justAdded ? 'check' : product.stock <= 0 ? 'block' : 'add_shopping_cart' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../stores/auth'
import { useLoginModal } from '../stores/loginModal'
import { useToast } from '../stores/toast'
import { useCart } from '../stores/cart'
import api from '../services/api'

const props = defineProps({
  product: { type: Object, required: true },
  delay:   { type: Number, default: 0 },
})
const emit = defineEmits(['add-to-cart'])

const auth = useAuth()
const loginModal = useLoginModal()
const toast = useToast()
const cart = useCart()

const isWishlisted = ref(false)
const justAdded = ref(false)
const isAdding = ref(false)

async function handleAddToCart() {
  if (isAdding.value || justAdded.value) return
  if (props.product.stock <= 0) {
    toast.show('สินค้าหมดแล้ว')
    return
  }
  if (!auth.isLoggedIn.value) { loginModal.show(); return }
  isAdding.value = true
  try {
    const res = await cart.add(props.product)
    if (res?.cartDtlOK === false) {
      toast.show(`✗ ${res.messageAddCartDtl || 'สินค้าหมดแล้ว'}`)
      return
    }
    emit('add-to-cart', props.product)
    justAdded.value = true
    setTimeout(() => { justAdded.value = false }, 1200)
  } finally {
    isAdding.value = false
  }
}

// ✅ โหลดสถานะ wishlist ตอน mount
onMounted(async () => {
  if (!auth.isLoggedIn.value) return
  try {
    const wishlist = await api.getWishlist()
    const ids = (Array.isArray(wishlist) ? wishlist : []).map(p => p.pdID)
    isWishlisted.value = ids.includes(props.product.id || props.product.pdID)
  } catch { /* ไม่ต้องทำอะไร */ }
})

// ✅ toggle wishlist + ป้องกัน login
async function handleWishlist() {
  if (!auth.isLoggedIn.value) {
    loginModal.show()
    return
  }
  try {
    const pdId  = props.product.id || props.product.pdID
    const email = auth.user.value.email
    const res   = await api.toggleWishlist(pdId, email)
    isWishlisted.value = res.isLiked
    toast.show(res.isLiked ? '❤️ Added to wishlist' : 'Removed from wishlist')
  } catch (err) {
    console.error('Wishlist toggle error:', err.message)
  }
}
</script>

<style scoped>
.card {
  display: flex; flex-direction: column;
  background: var(--primary-05); border-radius: var(--radius-xl);
  border: 1px solid transparent; padding: 16px;
  transition: all 0.3s ease;
  animation: fadeUp 0.4s ease both;
}
.card:hover { border-color: var(--primary-20); }
.card-image {
  position: relative; aspect-ratio: 3/4;
  border-radius: var(--radius); overflow: hidden;
  background: var(--primary-10); margin-bottom: 16px; cursor: pointer;
}
.product-img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.5s ease;
}
.card:hover .product-img { transform: scale(1.05); }
.tag {
  position: absolute; top: 12px; left: 12px; z-index: 2;
  padding: 4px 10px; border-radius: var(--radius-full);
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.1em; color: white;
}
.wishlist-btn {
  position: absolute; top: 12px; right: 12px; z-index: 2;
  color: var(--text-muted); transition: color 0.2s;
}
.wishlist-btn:hover, .wishlist-btn .fill-icon { color: var(--primary); }
.card-body { flex: 1; display: flex; flex-direction: column; }
.region {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: -0.01em; color: var(--primary); margin-bottom: 4px;
}
.name {
  font-size: 18px; font-weight: 700; margin-bottom: 4px;
  transition: color 0.2s; cursor: pointer; 
  color: var(--text-light);
}
.card:hover .name { color: var(--primary); }
.desc { font-size: 14px; color: var(--text-muted); margin-bottom: 16px; flex: 1; }
.price-row {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 16px; border-top: 1px solid var(--border); margin-top: auto;
}
.price { font-size: 24px; font-weight: 700; color: var(--primary); }
.old-price { font-size: 12px; color: var(--text-muted); text-decoration: line-through; }
.meta { font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-top: 2px; }
.cart-btn {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--primary); color: white;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.2s, background 0.3s; box-shadow: var(--shadow-primary);
}
.cart-btn:hover { transform: scale(1.1); }
.cart-btn .material-symbols-outlined { font-size: 20px; transition: transform 0.2s; }
.cart-btn.added { background: #4caf50; animation: popIn 0.3s ease; }
.cart-btn.added .material-symbols-outlined { transform: scale(1.2); }
.cart-btn.outofstock { background: var(--text-dim); cursor: not-allowed; box-shadow: none; }
.cart-btn.outofstock:hover { transform: none; }
.product-img.blurred { filter: blur(3px); }
.out-of-stock-overlay {
  position: absolute; inset: 0; z-index: 3;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.45);
}
.out-of-stock-overlay span {
  padding: 6px 16px;
  background: rgba(0,0,0,0.7);
  color: white;
  font-size: 13px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 4px;
}

@keyframes popIn {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.35); }
  100% { transform: scale(1); }
}
</style>
