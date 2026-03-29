<template>
  <main class="wishlist-page">
    <div class="wishlist-header">
      <h1>❤️ My Wishlist</h1>
      <nav class="breadcrumbs">
        <router-link to="/" class="crumb-link">Home</router-link>
        <span class="material-symbols-outlined crumb-sep">chevron_right</span>
        <span class="crumb-current">Wishlist</span>
      </nav>
    </div>

    <div v-if="!isLoggedIn" class="container login-required">
      <div class="empty-state">
        <span class="material-symbols-outlined empty-icon">lock</span>
        <h2>Please Log In</h2>
        <p>You need to be logged in to view your wishlist.</p>
        <router-link to="/login" class="btn-primary">Go to Login</router-link>
      </div>
    </div>

    <div v-else class="container">
      <!-- Loading -->
      <div v-if="loading" class="empty-state">
        <span class="material-symbols-outlined empty-icon">hourglass_empty</span>
        <p>Loading wishlist...</p>
      </div>

      <div v-else-if="wishlistItems.length === 0" class="empty-state">
        <span class="material-symbols-outlined empty-icon">favorite</span>
        <h2>Your Wishlist is Empty</h2>
        <p>Start adding your favorite products to your wishlist.</p>
        <router-link to="/" class="btn-primary">Continue Shopping</router-link>
      </div>

      <div v-else class="wishlist-wrapper">
        <div class="wishlist-info">
          <h2>Saved Items ({{ wishlistItems.length }})</h2>
          <button @click="clearWishlist" class="btn-clear">
            <span class="material-symbols-outlined">delete</span>
            Clear All
          </button>
        </div>

        <div class="table-container">
          <table class="wishlist-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in wishlistItems" :key="item.pdID" class="table-row">
                <td class="col-product">
                  <div class="product-cell" @click="goToProduct(item.pdID)">
                    <img :src="item.image || item.pdImage" :alt="item.pdName" class="product-img" />
                    <div class="product-info">
                      <p class="product-name">{{ item.pdName }}</p>
                      <p class="product-brand">{{ item.pdBrand }}</p>
                    </div>
                  </div>
                </td>
                <td class="col-category">
                  <span class="category-badge">{{ item.pdCategory }}</span>
                </td>
                <td class="col-price">
                  <span class="price">฿{{ Number(item.pdPrice).toFixed(2) }}</span>
                </td>
                <td class="col-action">
                  <div class="action-buttons">
                    <button @click="addToCart(item)" class="btn-add-cart" title="Add to cart">
                      <span class="material-symbols-outlined">shopping_cart</span>
                    </button>
                    <button @click="removeFromWishlist(item.pdID)" class="btn-delete" title="Remove">
                      <span class="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'
import { useCart } from '../stores/cart'
import { useToast } from '../stores/toast'
import api from '../services/api'

const router = useRouter()
const auth = useAuth()
const cart = useCart()
const toast = useToast()

const isLoggedIn = auth.isLoggedIn
const user = auth.user
const loading = ref(false)
const wishlistItems = ref([])  // ✅ เก็บ product objects จาก DB โดยตรง

// ✅ GET /wishlist — backend join products มาให้แล้ว ไม่ต้อง fetch แยก
onMounted(async () => {
  if (!isLoggedIn.value) return
  loading.value = true
  try {
    const data = await api.getWishlist()
    wishlistItems.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Failed to load wishlist:', err.response?.data || err.message)
    wishlistItems.value = []
  } finally {
    loading.value = false
  }
})

function goToProduct(pdID) {
  router.push(`/product/${pdID}`)
}

function addToCart(product) {
  if (!product) return
  cart.add(product)
  toast.show(`✓ Added "${product.pdName}" to cart`)
}

// ✅ POST /wishlist/toggle — ถ้ามีอยู่แล้วจะลบออก
async function removeFromWishlist(pdID) {
  try {
    await api.toggleWishlist(pdID, user.value.email)
    wishlistItems.value = wishlistItems.value.filter(p => p.pdID !== pdID)
    toast.show('Removed from wishlist')
  } catch (err) {
    console.error('Failed to remove from wishlist:', err.message)
  }
}

async function clearWishlist() {
  if (!confirm('Are you sure you want to clear your entire wishlist?')) return
  try {
    // ลบทีละรายการเพราะ backend ไม่มี clear all endpoint
    await Promise.all(
      wishlistItems.value.map(p => api.toggleWishlist(p.pdID, user.value.email))
    )
    wishlistItems.value = []
    toast.show('Wishlist cleared')
  } catch (err) {
    console.error('Failed to clear wishlist:', err.message)
  }
}
</script>

<style scoped>
.wishlist-page {
  min-height: 100vh;
  background: var(--bg-dark);
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.wishlist-header {
  max-width: 1200px;
  margin: 0 auto 40px;
}

.wishlist-header h1 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: var(--text-white);
}

/* Wishlist Header Info */
.wishlist-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.wishlist-info h2 {
  font-size: 1.5rem;
  color: var(--text-white);
  margin: 0;
}

.btn-clear {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius);
  color: #ef4444;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}

/* Table Container */
.table-container {
  overflow-x: auto;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.wishlist-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.wishlist-table thead {
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 2px solid var(--border);
}

.wishlist-table th {
  padding: 16px;
  text-align: left;
  font-weight: 700;
  color: var(--text-light);
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
}

.wishlist-table tbody tr {
  border-bottom: 1px solid var(--border);
  transition: background 0.2s;
}

.wishlist-table tbody tr:hover {
  background: rgba(212, 17, 50, 0.05);
}

.wishlist-table tbody tr:last-child {
  border-bottom: none;
}

.wishlist-table td {
  padding: 16px;
  color: var(--text-light);
}

/* Product Column */
.col-product {
  width: 40%;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.product-cell:hover {
  opacity: 0.8;
}

.product-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 700;
  color: var(--text-white);
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.product-brand {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

/* Category Column */
.col-category {
  width: 15%;
}

.category-badge {
  display: inline-block;
  padding: 4px 12px;
  background: var(--primary-10);
  color: var(--primary);
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Price Column */
.col-price {
  width: 15%;
}

.price {
  font-weight: 700;
  color: var(--primary);
  font-size: 1.1rem;
}

/* Stock Column */
.col-stock {
  width: 15%;
}

.stock-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 0.8rem;
}

.stock-badge.in-stock {
  background: rgba(34, 197, 94, 0.1);
  color: var(--green);
}

.stock-badge.out-of-stock {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Action Column */
.col-action {
  width: 15%;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-add-cart,
.btn-delete {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn-add-cart {
  background: var(--primary-10);
  color: var(--primary);
}

.btn-add-cart:hover:not(:disabled) {
  background: var(--primary);
  color: white;
}

.btn-add-cart:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-delete {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.btn-delete:hover {
  background: #ef4444;
  color: white;
}

/* Responsive */
@media (max-width: 1024px) {
  .col-product {
    width: 45%;
  }

  .col-category {
    width: 12%;
  }

  .col-price {
    width: 12%;
  }

  .col-stock {
    width: 18%;
  }

  .col-action {
    width: 13%;
  }
}

@media (max-width: 768px) {
  .wishlist-header h1 {
    font-size: 2rem;
  }

  .wishlist-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .btn-clear {
    align-self: flex-start;
  }

  .wishlist-table {
    font-size: 0.85rem;
  }

  .wishlist-table th,
  .wishlist-table td {
    padding: 12px;
  }

  .product-img {
    width: 50px;
    height: 50px;
  }

  .product-name {
    font-size: 0.9rem;
  }

  .product-brand {
    font-size: 0.75rem;
  }

  .col-product {
    width: 50%;
  }

  .col-category {
    width: 15%;
  }

  .col-price {
    width: 12%;
  }

  .col-stock {
    width: 15%;
  }

  .col-action {
    width: 8%;
  }

  .btn-add-cart,
  .btn-delete {
    width: 32px;
    height: 32px;
  }

  .btn-add-cart .material-symbols-outlined,
  .btn-delete .material-symbols-outlined {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .wishlist-table {
    min-width: 600px;
    font-size: 0.8rem;
  }
}

/* Entrance animations */
.wishlist-table tbody tr { animation: fadeUp 0.35s ease both; }
.wishlist-table tbody tr:nth-child(1) { animation-delay: 0.1s; }
.wishlist-table tbody tr:nth-child(2) { animation-delay: 0.17s; }
.wishlist-table tbody tr:nth-child(3) { animation-delay: 0.24s; }
.wishlist-table tbody tr:nth-child(4) { animation-delay: 0.31s; }
.wishlist-table tbody tr:nth-child(5) { animation-delay: 0.38s; }
</style>