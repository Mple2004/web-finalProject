<template>
  <Teleport to="body">
    <div v-if="cart.state.isOpen" class="overlay" @click.self="cart.close()">
      <div class="sidebar">
        <div class="sidebar-header">
          <h3 class="sidebar-title">
            <span class="material-symbols-outlined" style="color:var(--primary)">shopping_cart</span>
            Your Cart
          </h3>
          <button class="close-btn" @click="cart.close()">&times;</button>
        </div>

        <div class="sidebar-body">
          <div v-if="cart.state.items.length === 0" class="empty">
            <span class="material-symbols-outlined empty-icon">shopping_cart</span>
            <p>Your cart is empty</p>
          </div>

          <div v-for="item in cart.state.items" :key="item.id" class="cart-item">
            <div class="item-img">
              <img :src="item.image" :alt="item.name" />
            </div>
            <div class="item-info">
              <p class="item-name">{{ item.name }}</p>
              <p v-if="item.volume" class="item-volume">{{ item.volume }}</p>
              <p class="item-price">฿{{ item.price.toFixed(2) }}</p>
              
              <div class="qty-controls">
                <button class="qty-btn" @click="cart.updateQty(item.id, -1)">−</button>
                <span class="qty-val">{{ item.qty }}</span>
                <button class="qty-btn" @click="cart.updateQty(item.id, 1)">+</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="cart.state.items.length > 0" class="sidebar-footer">
          <div class="total-row">
            <span>Total</span>
            <span class="total-price">฿{{ cart.total.value.toFixed(2) }}</span>
          </div>
          <button class="checkout-btn" @click="handleCheckout">
            <span class="material-symbols-outlined">shopping_cart_checkout</span>
            Checkout
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useCart } from '../stores/cart.js'
import { useRouter } from 'vue-router'

const cart = useCart()
const router = useRouter()

function handleCheckout() {
  cart.close()
  router.push('/checkout')
}
</script>

<style scoped>
.item-volume {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 2px;
}
.overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.7); z-index: 1000;
}
.sidebar {
  position: absolute; top: 0; right: 0; bottom: 0;
  width: 400px; max-width: 88vw;
  background: var(--bg-dark);
  border-left: 1px solid var(--border);
  display: flex; flex-direction: column;
  animation: slideRight 0.3s ease-out;
}
.sidebar-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 24px; border-bottom: 1px solid var(--border);
}
.sidebar-title { font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.close-btn { font-size: 28px; color: var(--text-muted); line-height: 1; }
.close-btn:hover { color: white; }
.sidebar-body { flex: 1; overflow-y: auto; padding: 24px; }
.empty { text-align: center; padding: 80px 0; color: var(--text-dim); }
.empty-icon { font-size: 48px; margin-bottom: 12px; display: block; opacity: 0.25; }
.cart-item { display: flex; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--border); }
.item-img { width: 56px; height: 56px; border-radius: var(--radius); background: var(--primary-10); overflow: hidden; flex-shrink: 0; }
.item-img img { width: 100%; height: 100%; object-fit: cover; }
.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-price { font-size: 14px; font-weight: 700; color: var(--primary); }
.qty-controls { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.qty-btn {
  width: 26px; height: 26px; border-radius: 50%;
  background: var(--primary-10); border: 1px solid var(--primary-20);
  color: var(--text-light); font-size: 16px; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s, color 0.2s;
}
.qty-btn:hover { background: var(--primary); color: white; }
.qty-val { font-size: 13px; font-weight: 700; width: 20px; text-align: center; color: var(--text-white); }
.sidebar-footer { padding: 24px; border-top: 1px solid var(--border); }
.total-row { display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 16px; }
.total-price { color: var(--primary); font-size: 18px; }
.checkout-btn {
  width: 100%; padding: 12px; border-radius: var(--radius);
  background: var(--primary); color: white; font-weight: 700; font-size: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: var(--shadow-primary); transition: background 0.2s;
}
.checkout-btn:hover { background: var(--primary-hover); }
</style>