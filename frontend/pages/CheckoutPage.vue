<template>
  <main class="checkout-page">
    <!-- Header -->
    <div class="checkout-header">
      <h1>Checkout</h1>
      <nav class="breadcrumbs">
        <router-link to="/" class="crumb-link">Home</router-link>
        <span class="material-symbols-outlined crumb-sep">chevron_right</span>
        <span class="crumb-current">Checkout</span>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="checkout-container">
      <!-- Left: Order Summary -->
      <section class="order-section">
        <h2 class="section-title">Order Summary</h2>
        <div class="cart-items">
          <div v-if="cart.state.items.length === 0" class="empty-cart">
            <span class="material-symbols-outlined empty-icon">shopping_cart</span>
            <p>Your cart is empty</p>
            <router-link to="/" class="btn-primary">Continue Shopping</router-link>
          </div>

          <div v-else>
            <div v-for="item in cart.state.items" :key="item.id" class="cart-item">
              <div class="item-image">
                <img :src="item.image" :alt="item.name" />
              </div>
              <div class="item-details">
                <h3 class="item-name">{{ item.name }}</h3>
                <p class="item-brand">{{ item.volume }}</p>
              </div>
              <div class="item-qty">
                <button @click="cart.updateQty(item.id, -1)" class="qty-btn" :disabled="item.qty <= 1">
                  <span class="material-symbols-outlined">remove</span>
                </button>
                <span class="qty-value">{{ item.qty }}</span>
                <button @click="cart.updateQty(item.id, 1)" class="qty-btn">
                  <span class="material-symbols-outlined">add</span>
                </button>
              </div>
              <div class="item-price">
                <p class="unit-price">฿{{ item.price.toFixed(2) }}</p>
                <p class="total-item-price">฿{{ (item.price * item.qty).toFixed(2) }}</p>
              </div>
              <button @click="cart.updateQty(item.id, -9999)" class="remove-btn">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Right: Form & Summary -->
      <section class="form-section">
        <!-- Shipping Address -->
        <div class="form-group">
          <h2 class="section-title">Shipping Address</h2>
          <div v-if="!user" class="login-prompt">
            <p>Please <router-link to="/login" class="link-accent">log in</router-link> to continue</p>
          </div>
          <div v-else class="address-form">
            <div class="form-field">
              <label>Full Name</label>
              <input v-model="formData.fullName" type="text" placeholder="Your full name" />
            </div>
            <div class="form-field">
              <label>Email</label>
              <input v-model="formData.email" type="email" placeholder="your@email.com" />
            </div>
            <div class="form-field">
              <label>Phone</label>
              <input v-model="formData.phone" type="tel" placeholder="+66 x-xxx-xxxx" />
            </div>
            <div class="form-field">
              <label>Address</label>
              <input v-model="formData.address" type="text" placeholder="Street address" />
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>City</label>
                <input v-model="formData.city" type="text" placeholder="Bangkok" />
              </div>
              <div class="form-field">
                <label>Postal Code</label>
                <input v-model="formData.postalCode" type="text" placeholder="10110" />
              </div>
            </div>
            <div class="form-field">
              <label>Country</label>
              <input v-model="formData.country" type="text" placeholder="Thailand" />
            </div>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="form-group">
          <h2 class="section-title">Payment Method</h2>
          <div class="payment-options">
            <label class="payment-option" :class="{ active: formData.paymentMethod === 'credit-card' }">
              <input v-model="formData.paymentMethod" type="radio" value="credit-card" />
              <span class="payment-label">
                <span class="material-symbols-outlined">credit_card</span>
                Credit Card
              </span>
            </label>
            <label class="payment-option" :class="{ active: formData.paymentMethod === 'bank-transfer' }">
              <input v-model="formData.paymentMethod" type="radio" value="bank-transfer" />
              <span class="payment-label">
                <span class="material-symbols-outlined">account_balance</span>
                Bank Transfer
              </span>
            </label>
            <label class="payment-option" :class="{ active: formData.paymentMethod === 'cash-on-delivery' }">
              <input v-model="formData.paymentMethod" type="radio" value="cash-on-delivery" />
              <span class="payment-label">
                <span class="material-symbols-outlined">local_shipping</span>
                Cash on Delivery
              </span>
            </label>
          </div>
          <div v-if="formData.paymentMethod === 'credit-card'" class="card-form">
            <div class="form-field">
              <label>Cardholder Name</label>
              <input v-model="formData.cardName" type="text" placeholder="Name on card" />
            </div>
            <div class="form-field">
              <label>Card Number</label>
              <input v-model="formData.cardNumber" type="text" placeholder="1234 5678 9012 3456" maxlength="19" @input="formatCardNumber" />
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>Expiry Date</label>
                <input v-model="formData.cardExpiry" type="text" placeholder="MM/YY" maxlength="5" @input="formatExpiry" />
              </div>
              <div class="form-field">
                <label>CVV</label>
                <input v-model="formData.cardCVV" type="text" placeholder="123" maxlength="3" />
              </div>
            </div>
          </div>
        </div>

        <!-- Order Total -->
        <div class="order-summary">
          <h3 class="summary-title">Order Total</h3>
          <div class="summary-row">
            <span>Subtotal</span>
            <span>฿{{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="summary-row small">
            <span>Shipping</span>
            <span :class="{ green: shippingFee === 0 }">
              {{ shippingFee === 0 ? 'FREE' : '฿' + shippingFee.toFixed(2) }}
            </span>
          </div>
          <div class="summary-row small">
            <span>Tax (7%)</span>
            <span>฿{{ tax.toFixed(2) }}</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row total">
            <span>Total</span>
            <span class="total-amount">฿{{ total.toFixed(2) }}</span>
          </div>
          <button
            @click="placeOrder"
            :disabled="!user || cart.state.items.length === 0 || isProcessing"
            class="btn-checkout"
          >
            <span v-if="!isProcessing" class="material-symbols-outlined">done</span>
            <span v-else class="spinner-sm"></span>
            {{ isProcessing ? 'Processing...' : 'Place Order' }}
          </button>
          <p v-if="!user" class="checkout-note">Please log in to place order</p>
        </div>
      </section>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccess" class="modal-overlay" @click.self="goHome">
      <div class="modal-content">
        <div class="success-icon">
          <span class="material-symbols-outlined">check_circle</span>
        </div>
        <h2>Order Placed Successfully!</h2>
        <p>Order ID: <strong>#{{ orderId }}</strong></p>
        <p>Confirmation sent to <strong>{{ user?.email }}</strong></p>
        <p class="delivery-info">Estimated delivery: 3-5 business days</p>
        <button @click="goHome" class="btn-primary">Continue Shopping</button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '../stores/cart'
import { useAuth } from '../stores/auth'

const router = useRouter()
const cart = useCart()
const auth = useAuth()
const { user } = auth

const isProcessing = ref(false)
const showSuccess = ref(false)
const orderId = ref('')

// ✅ Form data
const formData = ref({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
  paymentMethod: 'credit-card',
  cardName: '',
  cardNumber: '',
  cardExpiry: '',
  cardCVV: '',
})

// ✅ Computed totals จาก cart.total.value (pdPrice)
const subtotal = computed(() => cart.total.value || 0)
const shippingFee = computed(() => subtotal.value > 1000 ? 0 : 100)
const tax       = computed(() => Math.round(subtotal.value * 0.07 * 100) / 100)
const total     = computed(() => subtotal.value + shippingFee.value + tax.value)

function formatCardNumber() {
  const v = formData.value.cardNumber.replace(/\s/g, '')
  formData.value.cardNumber = v.replace(/(\d{4})/g, '$1 ').trim()
}

function formatExpiry() {
  const v = formData.value.cardExpiry.replace(/\D/g, '')
  if (v.length >= 2) formData.value.cardExpiry = v.slice(0, 2) + '/' + v.slice(2, 4)
}

function validateForm() {
  const { fullName, email, phone, address, city, postalCode, country } = formData.value
  if (!fullName || !email || !phone || !address || !city || !postalCode || !country) {
    alert('Please fill in all required fields')
    return false
  }
  if (formData.value.paymentMethod === 'credit-card') {
    const { cardName, cardNumber, cardExpiry, cardCVV } = formData.value
    if (!cardName || !cardNumber || !cardExpiry || !cardCVV) {
      alert('Please fill in all card details')
      return false
    }
  }
  return true
}

async function placeOrder() {
  if (!user?.value || cart.state.items.length === 0 || !validateForm()) return
  isProcessing.value = true
  try {
    const res = await cart.checkout()  // ✅ ไม่ต้องส่ง email แล้ว
    if (res?.success) {
      orderId.value = res.cartId || 'ORD-' + Date.now()
      showSuccess.value = true
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      alert('Checkout failed: ' + (res?.message || 'Unknown error'))
    }
  } catch (err) {
    alert('Error: ' + err.message)
  } finally {
    isProcessing.value = false
  }
}

function goHome() {
  showSuccess.value = false
  router.push('/')
}

// ✅ pre-fill form จาก user
onMounted(() => {
  if (!auth.isLoggedIn.value) { router.push('/login'); return }
  if (user.value) {
    formData.value.fullName = user.value.name  || ''
    formData.value.email    = user.value.email || ''
  }
})
</script>

<style scoped>
.checkout-page { min-height: 100vh; background: var(--bg-dark); padding: 40px 20px; }
.checkout-header { max-width: 1400px; margin: 0 auto 40px; }
.checkout-header h1 { font-size: 2.5rem; margin-bottom: 16px; color: var(--text-white); }
.breadcrumbs { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-muted); }
.crumb-link { color: var(--primary); text-decoration: none; }
.crumb-sep { font-size: 16px; }

.checkout-container { max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: 1fr 420px; gap: 40px; }
@media (max-width: 1024px) { .checkout-container { grid-template-columns: 1fr; } }

/* Order Section */
.order-section { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 30px; }
.section-title { font-size: 1.25rem; margin-bottom: 24px; color: var(--text-white); font-weight: 700; }

.empty-cart { text-align: center; padding: 60px 20px; color: var(--text-muted); }
.empty-icon { font-size: 64px; display: block; margin-bottom: 16px; opacity: 0.4; }
.empty-cart p { margin-bottom: 24px; font-size: 1.1rem; }

.cart-items { display: flex; flex-direction: column; gap: 16px; max-height: 600px; overflow-y: auto; }
.cart-item {
  display: grid; grid-template-columns: 80px 1fr auto auto auto;
  gap: 16px; align-items: center; padding: 16px;
  background: rgba(255,255,255,0.03); border: 1px solid var(--border);
  border-radius: var(--radius); transition: background 0.2s;
}
.cart-item:hover { background: rgba(255,255,255,0.06); }
.item-image { width: 80px; height: 80px; border-radius: var(--radius); overflow: hidden; background: var(--primary-10); }
.item-image img { width: 100%; height: 100%; object-fit: cover; }
.item-name { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
.item-brand { font-size: 13px; color: var(--text-muted); margin-bottom: 4px; }
.item-size { font-size: 12px; color: var(--text-dim); }
.item-qty { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); padding: 6px 10px; border-radius: var(--radius); }
.qty-btn { display: flex; align-items: center; justify-content: center; color: var(--text-muted); transition: color 0.2s; }
.qty-btn:hover:not(:disabled) { color: var(--primary); }
.qty-btn:disabled { opacity: 0.3; }
.qty-btn .material-symbols-outlined { font-size: 18px; }
.qty-value { width: 24px; text-align: center; font-weight: 700; }
.item-price { text-align: right; }
.unit-price { font-size: 13px; color: var(--text-muted); }
.total-item-price { font-size: 16px; font-weight: 700; color: var(--primary); }
.remove-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius); color: var(--text-muted); transition: all 0.2s; }
.remove-btn:hover { background: rgba(212,17,50,0.1); color: var(--primary); }

/* Form Section */
.form-section { display: flex; flex-direction: column; gap: 24px; }
.form-group { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; }
.login-prompt { text-align: center; padding: 24px; background: rgba(212,17,50,0.05); border-radius: var(--radius); color: var(--text-light); }
.link-accent { color: var(--primary); font-weight: 600; text-decoration: underline; }

.form-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.form-field label { font-size: 13px; font-weight: 600; color: var(--text-light); }
.form-field input {
  width: 100%; /* เพิ่มคำสั่งนี้เพื่อให้กล่องข้อความกว้างเต็มพอดีกับ Column */
  box-sizing: border-box; /* เพิ่มคำสั่งนี้เพื่อไม่ให้ padding ไปเพิ่มความกว้างของกล่องล้นออกไป */
  padding: 10px 14px; 
  background: var(--bg-dark); 
  border: 1px solid var(--border);
  border-radius: var(--radius); 
  color: var(--text-white); 
  font-size: 14px; 
  outline: none;
  transition: border-color 0.2s;
}
.form-field input:focus { border-color: var(--primary); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

/* Payment */
.payment-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
.payment-option { border: 1px solid var(--border); padding: 14px; border-radius: var(--radius); cursor: pointer; transition: all 0.2s; }
.payment-option.active { border-color: var(--primary); background: rgba(212,17,50,0.08); }
.payment-option input { display: none; }
.payment-label { display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--text-light); }
.payment-label .material-symbols-outlined { font-size: 24px; color: var(--primary); }
.card-form { padding: 16px; background: rgba(212,17,50,0.05); border: 1px solid var(--border); border-radius: var(--radius); }

/* Order Summary */
.order-summary { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; }
.summary-title { font-size: 1.1rem; margin-bottom: 16px; color: var(--text-white); font-weight: 700; }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: var(--text-muted); }
.summary-row.total { font-size: 18px; font-weight: 800; color: var(--text-white); margin-top: 4px; }
.total-amount { color: var(--primary); }
.summary-divider { height: 1px; background: var(--border); margin: 16px 0; }
.green { color: #00ff88; }
.checkout-note { text-align: center; margin-top: 12px; font-size: 13px; color: var(--text-muted); }

.btn-checkout {
  width: 100%; padding: 14px; background: var(--primary); color: white;
  border-radius: var(--radius); font-weight: 700; font-size: 15px; margin-top: 20px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: background 0.2s; box-shadow: var(--shadow-primary);
}
.btn-checkout:hover:not(:disabled) { background: var(--primary-hover); }
.btn-checkout:disabled { opacity: 0.5; cursor: not-allowed; }

.spinner-sm {
  width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white; border-radius: 50%;
  animation: spin 0.6s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.modal-content {
  background: var(--bg-dark); border: 1px solid var(--border);
  border-radius: var(--radius-xl); padding: 48px 40px;
  max-width: 480px; width: 100%; text-align: center;
  box-shadow: 0 24px 64px rgba(0,0,0,0.5);
  animation: fadeUp 0.4s ease both;
}
.success-icon .material-symbols-outlined { font-size: 72px; color: #00cc66; }
.modal-content h2 { font-size: 1.6rem; font-weight: 800; margin: 16px 0 12px; }
.modal-content p { color: var(--text-light); font-size: 15px; margin-bottom: 8px; }
.modal-content strong { color: var(--primary); }
.delivery-info { margin: 16px 0 24px !important; color: var(--text-muted); font-size: 14px; }
.btn-primary {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 14px 32px; background: var(--primary); color: white;
  border-radius: var(--radius); font-weight: 700; font-size: 15px;
  text-decoration: none; transition: background 0.2s; width: 100%; margin-top: 8px;
}
.btn-primary:hover { background: var(--primary-hover); }
</style>