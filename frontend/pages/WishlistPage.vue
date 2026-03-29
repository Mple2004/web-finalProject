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
import { useAuth } from '@/stores/auth'
import { useCart } from '@/stores/cart'
import { useToast } from '@/stores/toast'
import { useWishlist } from '@/stores/wishlist'
import api from '@/services/api'

const router = useRouter()
const auth = useAuth()
const cart = useCart()
const toast = useToast()
const wishlist = useWishlist()

const isLoggedIn = auth.isLoggedIn
const loading = ref(false)
const wishlistItems = ref([])

// ✅ fetch product details จาก API จริง โดยใช้ pdID ที่เก็บใน wishlist store
onMounted(async () => {
  if (!isLoggedIn.value) return
  loading.value = true
  try {
    const ids = [...(wishlist.state?.pdIDs ?? wishlist.ids?.value ?? [])]
    const results = await Promise.all(
      ids.map(id => api.getProductById(id).catch(() => null))
    )
    wishlistItems.value = results.filter(Boolean)
  } catch (err) {
    console.error('Failed to load wishlist:', err.message)
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

function removeFromWishlist(pdID) {
  wishlist.remove(pdID)
  wishlistItems.value = wishlistItems.value.filter(p => p.pdID !== pdID)
  toast.show('Removed from wishlist')
}

function clearWishlist() {
  if (!confirm('Are you sure you want to clear your entire wishlist?')) return
  wishlist.clear()
  wishlistItems.value = []
  toast.show('Wishlist cleared')
}
</script>