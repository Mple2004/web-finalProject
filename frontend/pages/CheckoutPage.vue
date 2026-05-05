<template>
  <main class="checkout-page fade-in">
    <div class="checkout-header">
      <h1>Checkout</h1>
      <nav class="breadcrumbs">
        <router-link to="/" class="crumb-link">Home</router-link>
        <span class="material-symbols-outlined crumb-sep">chevron_right</span>
        <span class="crumb-current">Checkout</span>
      </nav>
    </div>

    <div class="checkout-container">
      <section class="order-section slide-up">
        <div class="section-header">
          <h2 class="section-title">Order Summary</h2>
          <span class="item-count" v-if="cart.state.items.length > 0">
            {{ cart.state.items.length }} Items
          </span>
        </div>
        
        <div class="cart-items custom-scrollbar">
          <div v-if="cart.state.items.length === 0" class="empty-cart">
            <div class="empty-cart-circle">
              <span class="material-symbols-outlined empty-icon">shopping_cart_checkout</span>
            </div>
            <p>Your cart is empty</p>
            <router-link to="/" class="btn-outline">Continue Shopping</router-link>
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
              <button @click="cart.updateQty(item.id, -9999)" class="remove-btn" title="Remove item">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="form-section slide-up-delay">
        <div class="form-group glass-panel">
          <h2 class="section-title">Shipping Address</h2>
          <div v-if="!user" class="login-prompt">
            <span class="material-symbols-outlined prompt-icon">lock</span>
            <p>Please <router-link to="/login" class="link-accent">log in</router-link> to continue</p>
          </div>
          <div v-else class="address-form">
            <div class="form-field">
              <label>Full Name</label>
              <input v-model="formData.fullName" type="text" placeholder="John Doe" />
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>Email</label>
                <input v-model="formData.email" type="email" placeholder="john@example.com" />
              </div>
              <div class="form-field">
                <label>Phone</label>
                <input v-model="formData.phone" type="tel" placeholder="+66 8x-xxx-xxxx" />
              </div>
            </div>
            <div class="form-field">
              <label>Address</label>
              <input v-model="formData.address" type="text" placeholder="123 Main Street, Apartment 4B" />
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

        <div class="form-group glass-panel">
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
          
          <div class="payment-details-wrapper" :class="{ 'is-open': formData.paymentMethod === 'credit-card' }">
            <div class="payment-form-box">
              <div class="form-field">
                <label>Cardholder Name</label>
                <input v-model="formData.cardName" type="text" placeholder="Name on card" />
              </div>
              <div class="form-field">
                <label>Card Number</label>
                <div class="input-with-icon">
                  <input v-model="formData.cardNumber" type="text" placeholder="0000 0000 0000 0000" maxlength="19" @input="formatCardNumber" />
                  <span class="material-symbols-outlined input-icon">credit_score</span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label>Expiry Date</label>
                  <input v-model="formData.cardExpiry" type="text" placeholder="MM/YY" maxlength="5" @input="formatExpiry" />
                </div>
                <div class="form-field">
                  <label>CVV</label>
                  <input v-model="formData.cardCVV" type="password" placeholder="•••" maxlength="3" />
                </div>
              </div>
            </div>
          </div>

          <div class="payment-details-wrapper" :class="{ 'is-open': formData.paymentMethod === 'bank-transfer' }">
            <div class="payment-form-box qr-container">
              <div class="bank-info">
                <h4>Scan QR to Pay</h4>
                <p>Total amount: <strong>฿{{ total.toFixed(2) }}</strong></p>
              </div>
              <div class="qr-box">
                <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=MockPayment-${total}`" alt="Mock QR Code" />
              </div>
              <div class="bank-info">
                <p>Account Name: <strong>Vue Shop Co., Ltd.</strong></p>
                <p>Bank: <strong>KASIKORNBANK (KBANK)</strong></p>
                <p>Account No: <strong>123-4-56789-0</strong></p>
                <div class="slip-notice">
                  <span class="material-symbols-outlined">info</span>
                  <div>
                    <strong>Please save your payment slip.</strong>
                    <p>You will need to upload it after placing the order.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="order-summary glass-panel sticky-summary">
          <h3 class="summary-title">Order Total</h3>
          <div class="summary-row">
            <span>Subtotal</span>
            <span>฿{{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="summary-row small">
            <span>Shipping</span>
            <span :class="{ 'text-success': shippingFee === 0 }">
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
            <span v-if="!isProcessing" class="material-symbols-outlined">lock</span>
            <span v-else class="spinner-sm"></span>
            {{ isProcessing ? 'Processing...' : `Place Order` }}
          </button>
          <p v-if="!user" class="checkout-note text-danger">Please log in to place your order.</p>
          <p class="secure-note"><span class="material-symbols-outlined">gpp_good</span> Secure Checkout</p>
        </div>
      </section>
    </div>

    <div v-if="showSuccess" class="modal-overlay" @click.self="goHome">
      <div class="modal-content scale-in">
        <div class="success-icon-wrapper">
          <span class="material-symbols-outlined success-icon-anim">check</span>
        </div>
        <h2>Order Confirmed!</h2>
        <p>Your order <strong>#{{ orderId }}</strong> has been successfully placed.</p>
        <div class="receipt-box">
          <p>Confirmation email sent to:</p>
          <strong>{{ user?.email }}</strong>
        </div>
        <p class="delivery-info">
          <span class="material-symbols-outlined">local_shipping</span> 
          Estimated delivery: 3-5 business days
        </p>
        <button @click="goHome" class="btn-primary">Back to Home</button>
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
    const res = await cart.checkout()
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

onMounted(() => {
  if (!auth.isLoggedIn.value) { router.push('/login'); return }
  if (user.value) {
    formData.value.fullName = user.value.name  || ''
    formData.value.email    = user.value.email || ''
  }
})
</script>

<style scoped>
/* Base Variables & Setup */
.checkout-page {
  min-height: 100vh;
  background: var(--bg-dark, #0f172a);
  color: var(--text-white, #f8fafc);
  padding: 40px 20px 80px;
  font-family: 'Inter', system-ui, sans-serif;
}

/* Animations */
.fade-in { animation: fadeIn 0.5s ease-out; }
.slide-up { animation: slideUp 0.6s ease-out; }
.slide-up-delay { animation: slideUp 0.6s ease-out 0.2s both; }
.scale-in { animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }

/* Header */
.checkout-header { max-width: 1200px; margin: 0 auto 40px; }
.checkout-header h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px; }
.breadcrumbs { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-muted, #ffffff); }
.crumb-link { color: var(--primary, #3b82f6); text-decoration: none; transition: color 0.2s; }
.crumb-link:hover { color: var(--primary-hover, #60a5fa); }
.crumb-sep { font-size: 16px; opacity: 0.5; }
.crumb-current { color: var(--text-white, #f8fafc); font-weight: 500; }

/* Layout Grid */
.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 450px;
  gap: 32px;
  align-items: start;
}

@media (max-width: 1024px) {
  .checkout-container { grid-template-columns: 1fr; }
}

/* Reusable Glass Panel */
.glass-panel {
  background: var(--bg-surface, rgba(30, 41, 59, 0.7));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
}

/* Section Titles */
.section-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 24px; }
.section-title { font-size: 1.25rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px; margin: 0; }
.item-count { font-size: 14px; color: var(--text-muted, #94a3b8); background: rgba(255,255,255,0.05); padding: 4px 12px; border-radius: 20px; }

/* Cart Items & Scrollbar */
.order-section { padding-right: 16px; }
.cart-items {
  display: flex; flex-direction: column; gap: 16px;
  max-height: calc(100vh - 200px); overflow-y: auto;
  padding-right: 8px;
}
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

.empty-cart { text-align: center; padding: 60px 20px; color: var(--text-muted, #94a3b8); }
.empty-cart-circle { width: 80px; height: 80px; background: rgba(255,255,255,0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
.empty-icon { font-size: 40px; opacity: 0.7; }
.empty-cart p { margin-bottom: 24px; font-size: 1.1rem; }

.cart-item {
  display: grid; grid-template-columns: 80px 1fr auto auto auto;
  gap: 16px; align-items: center; padding: 16px;
  background: rgba(255,255,255,0.03); border: 1px solid transparent;
  border-radius: 16px; transition: all 0.3s ease;
}
.cart-item:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); transform: translateY(-2px); }
.item-image { width: 80px; height: 80px; border-radius: 12px; overflow: hidden; background: #fff; padding: 4px; }
.item-image img { width: 100%; height: 100%; object-fit: contain; }
.item-name { font-size: 15px; font-weight: 600; margin-bottom: 4px; color: #fff; }
.item-brand { font-size: 13px; color: var(--text-muted, #94a3b8); margin: 0; }

.item-qty { display: flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.2); padding: 6px 12px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.05); }
.qty-btn { background: none; border: none; color: var(--text-muted, #94a3b8); cursor: pointer; display: flex; align-items: center; padding: 2px; transition: color 0.2s; }
.qty-btn:hover:not(:disabled) { color: #fff; }
.qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.qty-btn .material-symbols-outlined { font-size: 16px; }
.qty-value { width: 20px; text-align: center; font-weight: 600; font-size: 14px; }

.item-price { text-align: right; min-width: 80px; }
.unit-price { font-size: 12px; color: var(--text-muted, #94a3b8); margin-bottom: 2px; }
.total-item-price { font-size: 16px; font-weight: 700; color: #fff; margin: 0; }

.remove-btn { 
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; 
  border-radius: 10px; color: var(--text-muted, #94a3b8); background: transparent; 
  border: none; cursor: pointer; transition: all 0.2s; 
}
.remove-btn:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

/* Form Section */
.form-section { display: flex; flex-direction: column; gap: 24px; }

.login-prompt { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 24px; background: rgba(59, 130, 246, 0.05); border: 1px dashed rgba(59, 130, 246, 0.3); border-radius: 12px; color: var(--text-muted, #94a3b8); }
.prompt-icon { font-size: 48px; color: var(--primary, #3b82f6); margin-bottom: 16px; opacity: 0.8; }
.link-accent { color: var(--primary, #3b82f6); font-weight: 600; text-decoration: none; }
.link-accent:hover { text-decoration: underline; }

.form-field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.form-field label { font-size: 13px; font-weight: 500; color: var(--text-muted, #94a3b8); }
.form-field input {
  width: 100%; box-sizing: border-box; padding: 14px 16px;
  background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px; color: #fff; font-size: 14px;
  outline: none; transition: all 0.3s ease;
}
.form-field input::placeholder { color: rgba(255,255,255,0.2); }
.form-field input:focus { border-color: var(--primary, #3b82f6); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); background: rgba(0,0,0,0.3); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 0; }

.input-with-icon { position: relative; display: flex; align-items: center; }
.input-with-icon input { padding-right: 40px; }
.input-icon { position: absolute; right: 16px; color: var(--text-muted, #94a3b8); pointer-events: none; }

/* Payment Options */
.payment-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
.payment-option {
  border: 1px solid rgba(255,255,255,0.1); padding: 16px 12px; 
  border-radius: 12px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(0,0,0,0.2); position: relative; overflow: hidden;
}
.payment-option:hover { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.02); }
.payment-option.active {
  border-color: var(--primary, #3b82f6); background: rgba(59, 130, 246, 0.1);
  box-shadow: inset 0 0 0 1px var(--primary, #3b82f6);
}
.payment-option input { display: none; }
.payment-label { display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: var(--text-muted, #94a3b8); text-align: center; }
.payment-option.active .payment-label { color: var(--primary, #3b82f6); font-weight: 600; }
.payment-label .material-symbols-outlined { font-size: 28px; transition: transform 0.3s; }
.payment-option.active .material-symbols-outlined { transform: scale(1.1); }

/* Payment Details Wrapper Animation */
.payment-details-wrapper { max-height: 0; overflow: hidden; transition: max-height 0.5s ease-out, opacity 0.4s; opacity: 0; }
.payment-details-wrapper.is-open { max-height: 500px; opacity: 1; margin-top: 8px; }
.payment-form-box { padding: 24px; background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; }

/* QR Code Section */
.qr-container { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 20px; }
.bank-info h4 { font-size: 18px; color: #fff; margin: 0 0 8px; font-weight: 700; }
.bank-info p { color: var(--text-muted, #94a3b8); font-size: 14px; margin: 0 0 4px; line-height: 1.5; }
.bank-info strong { color: #fff; }
.qr-box { 
  background: #fff; padding: 16px; border-radius: 16px; 
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  display: inline-block;
}
.qr-box img { width: 180px; height: 180px; display: block; object-fit: contain; }
.text-muted { color: var(--text-muted, #94a3b8); }

/* Sticky Order Summary */
.sticky-summary { position: sticky; top: 24px; }
.summary-title { font-size: 1.1rem; margin: 0 0 20px; color: #fff; font-weight: 600; }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 14px; font-size: 15px; color: var(--text-muted, #94a3b8); }
.summary-row.small { font-size: 14px; }
.summary-row.total { font-size: 20px; font-weight: 700; color: #fff; margin-top: 20px; align-items: center; }
.total-amount { color: var(--primary, #3b82f6); font-size: 24px; }
.summary-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 20px 0; border-radius: 1px; }

.text-success { color: #10b981 !important; font-weight: 600; }
.text-danger { color: #ef4444; }

.btn-checkout {
  width: 100%; padding: 16px; background: var(--primary, #3b82f6); color: white;
  border: none; border-radius: 12px; font-weight: 600; font-size: 16px; margin-top: 24px;
  display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer;
  transition: all 0.3s ease; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
}
.btn-checkout:hover:not(:disabled) { background: var(--primary-hover, #2563eb); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6); }
.btn-checkout:active:not(:disabled) { transform: translateY(0); }
.btn-checkout:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; filter: grayscale(50%); }

.btn-outline {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 12px 24px; background: transparent; color: var(--text-white);
  border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-weight: 500;
  text-decoration: none; transition: all 0.2s;
}
.btn-outline:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.4); }

.checkout-note { text-align: center; margin-top: 16px; font-size: 13px; font-weight: 500; }
.secure-note { text-align: center; margin-top: 16px; font-size: 12px; color: var(--text-muted, #94a3b8); display: flex; align-items: center; justify-content: center; gap: 6px; }
.secure-note .material-symbols-outlined { font-size: 16px; color: #10b981; }

.spinner-sm {
  width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: white; border-radius: 50%;
  animation: spin 0.8s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Success Modal */
.modal-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-content {
  background: var(--bg-surface, #1e293b); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px; padding: 48px 40px;
  max-width: 460px; width: 100%; text-align: center;
  box-shadow: 0 24px 64px rgba(0,0,0,0.4);
}
.success-icon-wrapper {
  width: 88px; height: 88px; background: rgba(16, 185, 129, 0.1); border-radius: 50%;
  display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;
}
.success-icon-anim { font-size: 48px; color: #10b981; font-weight: 800; }
.modal-content h2 { font-size: 1.75rem; font-weight: 700; color: #fff; margin: 0 0 12px; }
.modal-content p { color: var(--text-muted, #94a3b8); font-size: 15px; margin-bottom: 16px; line-height: 1.5; }
.modal-content strong { color: #fff; font-weight: 600; }
.receipt-box { background: rgba(0,0,0,0.2); border: 1px dashed rgba(255,255,255,0.1); padding: 16px; border-radius: 12px; margin: 24px 0; }
.receipt-box p { margin: 0 0 4px; font-size: 14px; }
.receipt-box strong { color: var(--primary, #3b82f6); font-size: 16px; }
.delivery-info { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 0 0 32px !important; color: #fff !important; font-size: 14px; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; }
.btn-primary {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 16px 32px; background: var(--primary, #3b82f6); color: white; border: none;
  border-radius: 12px; font-weight: 600; font-size: 16px; cursor: pointer;
  text-decoration: none; transition: all 0.2s; width: 100%;
}
.btn-primary:hover { background: var(--primary-hover, #2563eb); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3); }
/* Slip Notice Box */
.slip-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  padding: 12px 16px;
  border-radius: 10px;
  margin-top: 16px;
  text-align: left;
}
.slip-notice .material-symbols-outlined {
  color: #fbbf24; /* สีเหลืองอำพัน */
  font-size: 20px;
  margin-top: 2px;
}
.slip-notice div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.slip-notice strong {
  color: #fbbf24;
  font-size: 14px;
  font-weight: 600;
}
.slip-notice p {
  margin: 0;
  color: #fdf6e3;
  font-size: 13px;
  line-height: 1.4;
}
</style>