<template>
  <!-- SUCCESS STATE -->
  <main v-if="orderPlaced" class="success-wrap">
    <div class="success-card">
      <div class="success-icon-wrap">
        <span class="material-symbols-outlined success-icon fill-icon">check_circle</span>
      </div>
      <h1 class="success-title">Order Confirmed!</h1>
      <p class="success-sub">Thank you for your purchase, <strong>{{ auth.user.value?.name }}</strong></p>
      <div class="success-order-id">Order {{ placedOrderId }}</div>

      <div class="success-items">
        <div v-for="item in placedItems" :key="item.id" class="success-item">
          <div class="si-img"><img :src="item.image" /></div>
          <div class="si-info">
            <span class="si-name">{{ item.name }}</span>
            <span class="si-qty">× {{ item.qty }}</span>
          </div>
          <span class="si-price">${{ (item.price * item.qty).toFixed(2) }}</span>
        </div>
      </div>

      <div class="success-totals">
        <div class="st-row"><span>Subtotal</span><span>${{ placedSubtotal.toFixed(2) }}</span></div>
        <div class="st-row"><span>Shipping</span><span class="green">Free</span></div>
        <div class="st-row total"><span>Total</span><span>${{ placedSubtotal.toFixed(2) }}</span></div>
      </div>

      <div class="success-actions">
        <router-link to="/" class="btn-primary success-btn">Continue Shopping</router-link>
        <router-link to="/profile" class="btn-outline success-btn">View Orders</router-link>
      </div>
    </div>
  </main>

  <!-- CHECKOUT FORM -->
  <main v-else class="checkout-wrap">
    <nav class="breadcrumbs">
      <router-link to="/" class="crumb-link">Home</router-link>
      <span class="material-symbols-outlined crumb-sep">chevron_right</span>
      <span class="crumb-link" @click="cart.open()" style="cursor:pointer">Cart</span>
      <span class="material-symbols-outlined crumb-sep">chevron_right</span>
      <span class="crumb-current">Checkout</span>
    </nav>

    <h1 class="page-title">Checkout</h1>

    <div v-if="cart.state.items.length === 0" class="empty-cart">
      <span class="material-symbols-outlined" style="font-size:48px;opacity:.25;display:block;margin-bottom:12px">shopping_cart</span>
      <p>Your cart is empty.</p>
      <router-link to="/category" class="btn-primary" style="margin-top:20px;display:inline-block">Browse Products</router-link>
    </div>

    <div v-else class="checkout-grid">
      <!-- LEFT: FORM -->
      <div class="form-col">

        <!-- Contact -->
        <section class="form-section">
          <h2 class="section-heading">
            <span class="section-num">1</span> Contact Information
          </h2>
          <div class="field-row">
            <div class="field-group">
              <label class="field-label">First Name</label>
              <input v-model="form.firstName" class="auth-input" placeholder="Jane" />
              <span v-if="errors.firstName" class="field-error">{{ errors.firstName }}</span>
            </div>
            <div class="field-group">
              <label class="field-label">Last Name</label>
              <input v-model="form.lastName" class="auth-input" placeholder="Doe" />
              <span v-if="errors.lastName" class="field-error">{{ errors.lastName }}</span>
            </div>
          </div>
          <div class="field-row">
            <div class="field-group">
              <label class="field-label">Email</label>
              <input v-model="form.email" type="email" class="auth-input" placeholder="your@email.com" />
              <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
            </div>
            <div class="field-group">
              <label class="field-label">Phone</label>
              <input v-model="form.phone" class="auth-input" placeholder="+1 555 000 0000" />
            </div>
          </div>
        </section>

        <!-- Shipping -->
        <section class="form-section">
          <h2 class="section-heading">
            <span class="section-num">2</span> Shipping Address
          </h2>
          <div class="field-group mb-3">
            <label class="field-label">Address Line 1</label>
            <input v-model="form.address1" class="auth-input" placeholder="123 Main Street" />
            <span v-if="errors.address1" class="field-error">{{ errors.address1 }}</span>
          </div>
          <div class="field-group mb-3">
            <label class="field-label">Address Line 2 <span class="optional">(optional)</span></label>
            <input v-model="form.address2" class="auth-input" placeholder="Apt, suite, etc." />
          </div>
          <div class="field-row">
            <div class="field-group">
              <label class="field-label">City</label>
              <input v-model="form.city" class="auth-input" placeholder="New York" />
              <span v-if="errors.city" class="field-error">{{ errors.city }}</span>
            </div>
            <div class="field-group">
              <label class="field-label">State / Province</label>
              <input v-model="form.state" class="auth-input" placeholder="NY" />
            </div>
          </div>
          <div class="field-row mt-3">
            <div class="field-group">
              <label class="field-label">ZIP / Postal Code</label>
              <input v-model="form.zip" class="auth-input" placeholder="10001" />
              <span v-if="errors.zip" class="field-error">{{ errors.zip }}</span>
            </div>
            <div class="field-group">
              <label class="field-label">Country</label>
              <input v-model="form.country" class="auth-input" placeholder="United States" />
            </div>
          </div>
        </section>

        <!-- Payment -->
        <section class="form-section">
          <h2 class="section-heading">
            <span class="section-num">3</span> Payment Method
          </h2>

          <div class="payment-options">
            <label :class="['pay-option', { active: form.payMethod === 'card' }]">
              <input type="radio" v-model="form.payMethod" value="card" />
              <span class="material-symbols-outlined pay-icon">credit_card</span>
              <span class="pay-label">Credit / Debit Card</span>
              <span class="pay-badges">
                <span class="pay-badge">VISA</span>
                <span class="pay-badge">MC</span>
                <span class="pay-badge">AMEX</span>
              </span>
            </label>
            <label :class="['pay-option', { active: form.payMethod === 'cod' }]">
              <input type="radio" v-model="form.payMethod" value="cod" />
              <span class="material-symbols-outlined pay-icon">local_shipping</span>
              <span class="pay-label">Cash on Delivery</span>
            </label>
          </div>

          <div v-if="form.payMethod === 'card'" class="card-fields">
            <div class="field-group mb-3">
              <label class="field-label">Card Number</label>
              <input v-model="form.cardNumber" class="auth-input" placeholder="1234 5678 9012 3456" maxlength="19" @input="formatCard" />
              <span v-if="errors.cardNumber" class="field-error">{{ errors.cardNumber }}</span>
            </div>
            <div class="field-row">
              <div class="field-group">
                <label class="field-label">Expiry Date</label>
                <input v-model="form.cardExpiry" class="auth-input" placeholder="MM / YY" maxlength="7" @input="formatExpiry" />
                <span v-if="errors.cardExpiry" class="field-error">{{ errors.cardExpiry }}</span>
              </div>
              <div class="field-group">
                <label class="field-label">CVV</label>
                <input v-model="form.cardCvv" class="auth-input" placeholder="•••" maxlength="4" type="password" />
                <span v-if="errors.cardCvv" class="field-error">{{ errors.cardCvv }}</span>
              </div>
            </div>
            <div class="field-group mt-3">
              <label class="field-label">Name on Card</label>
              <input v-model="form.cardName" class="auth-input" placeholder="JANE DOE" />
            </div>
          </div>

          <div v-if="form.payMethod === 'cod'" class="cod-notice">
            <span class="material-symbols-outlined" style="color:var(--accent-gold)">info</span>
            Pay in cash when your order is delivered. No prepayment required.
          </div>
        </section>

      </div>

      <!-- RIGHT: ORDER SUMMARY -->
      <aside class="summary-col">
        <div class="summary-card">
          <h2 class="summary-heading">Order Summary</h2>

          <div class="summary-items">
            <div v-for="item in cart.state.items" :key="item.id" class="sum-item">
              <div class="sum-img">
                <img :src="item.image" :alt="item.name" />
                <span class="sum-qty-badge">{{ item.qty }}</span>
              </div>
              <div class="sum-info">
                <span class="sum-name">{{ item.name }}</span>
                <span class="sum-vol">{{ item.volume }}</span>
              </div>
              <span class="sum-price">${{ (item.price * item.qty).toFixed(2) }}</span>
            </div>
          </div>

          <div class="summary-totals">
            <div class="sum-row"><span>Subtotal</span><span>${{ cart.total.value.toFixed(2) }}</span></div>
            <div class="sum-row">
              <span>Shipping</span>
              <span :class="cart.total.value >= 100 ? 'green' : ''">
                {{ cart.total.value >= 100 ? 'Free' : '$9.99' }}
              </span>
            </div>
            <div v-if="cart.total.value < 100" class="free-ship-hint">
              Add ${{ (100 - cart.total.value).toFixed(2) }} more for free shipping
            </div>
            <div class="sum-divider"></div>
            <div class="sum-row total-row">
              <span>Total</span>
              <span class="total-price">${{ orderTotal.toFixed(2) }}</span>
            </div>
          </div>

          <button class="place-order-btn" @click="handlePlaceOrder" :disabled="placing">
            <span v-if="placing" class="btn-spinner"></span>
            <span v-else class="material-symbols-outlined">lock</span>
            {{ placing ? 'Processing...' : 'Place Order' }}
          </button>

          <p class="secure-note">
            <span class="material-symbols-outlined" style="font-size:14px">shield</span>
            Secured with 256-bit SSL encryption
          </p>
        </div>
      </aside>
    </div>
  </main>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '../stores/cart'
import { useAuth } from '../stores/auth'
import { useOrders } from '../stores/orders'

const router = useRouter()
const cart = useCart()
const auth = useAuth()
const orders = useOrders()

const orderPlaced = ref(false)
const placing = ref(false)
const placedOrderId = ref('')
const placedItems = ref([])
const placedSubtotal = ref(0)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  payMethod: 'card',
  cardNumber: '',
  cardExpiry: '',
  cardCvv: '',
  cardName: '',
})

const errors = reactive({})

const orderTotal = computed(() => {
  const shipping = cart.total.value >= 100 ? 0 : 9.99
  return cart.total.value + shipping
})

function formatCard(e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 16)
  form.cardNumber = v.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 4)
  if (v.length >= 3) v = v.slice(0, 2) + ' / ' + v.slice(2)
  form.cardExpiry = v
}

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.firstName.trim()) errors.firstName = 'Required'
  if (!form.lastName.trim()) errors.lastName = 'Required'
  if (!form.email.trim()) errors.email = 'Required'
  if (!form.address1.trim()) errors.address1 = 'Required'
  if (!form.city.trim()) errors.city = 'Required'
  if (!form.zip.trim()) errors.zip = 'Required'
  if (form.payMethod === 'card') {
    const rawCard = form.cardNumber.replace(/\s/g, '')
    if (rawCard.length !== 16) errors.cardNumber = 'Enter a valid 16-digit card number'
    if (!form.cardExpiry.includes('/')) errors.cardExpiry = 'Enter MM / YY'
    if (!form.cardCvv || form.cardCvv.length < 3) errors.cardCvv = 'Enter CVV'
  }
  return Object.keys(errors).length === 0
}

async function handlePlaceOrder() {
  if (!validate()) return
  placing.value = true
  await new Promise(r => setTimeout(r, 1000))

  const orderId = `ORD-${Date.now().toString().slice(-5)}`
  const snapshot = cart.state.items.map(i => ({ ...i }))
  const subtotal = cart.total.value

  const newOrder = {
    id: orderId,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'Processing',
    items: snapshot,
    total: orderTotal.value,
    shipping: {
      name: `${form.firstName} ${form.lastName}`,
      address: `${form.address1}${form.address2 ? ', ' + form.address2 : ''}, ${form.city}, ${form.state} ${form.zip}, ${form.country}`,
    },
    payMethod: form.payMethod,
  }

  orders.addOrder(auth.user.value.id, newOrder)

  placedOrderId.value = orderId
  placedItems.value = snapshot
  placedSubtotal.value = subtotal

  cart.clearCart()
  placing.value = false
  orderPlaced.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  if (!auth.isLoggedIn.value) {
    router.push('/login')
    return
  }
  if (auth.user.value) {
    form.firstName = auth.user.value.name?.split(' ')[0] || ''
    form.lastName = auth.user.value.name?.split(' ').slice(1).join(' ') || ''
    form.email = auth.user.value.email || ''
  }
})
</script>

<style scoped>
.checkout-wrap { max-width: 1100px; margin: 0 auto; padding: 32px 24px 64px; }
.success-wrap { max-width: 580px; margin: 0 auto; padding: 64px 24px; }

/* Breadcrumbs */
.breadcrumbs { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding-bottom: 24px; font-size: 14px; font-weight: 500; }
.crumb-link { color: var(--primary); }
.crumb-link:hover { text-decoration: underline; }
.crumb-sep { font-size: 12px; color: var(--text-dim); }
.crumb-current { color: var(--text-muted); }

.page-title { font-size: 32px; font-weight: 900; margin-bottom: 32px; }

/* Empty */
.empty-cart { text-align: center; padding: 80px 0; color: var(--text-muted); }

/* Grid */
.checkout-grid { display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; }

/* Form sections */
.form-section {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 28px;
  margin-bottom: 20px;
}
.section-heading {
  font-size: 17px; font-weight: 800; margin-bottom: 20px;
  display: flex; align-items: center; gap: 12px;
}
.section-num {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--primary); color: white;
  font-size: 13px; font-weight: 900;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field-group { display: flex; flex-direction: column; }
.optional { font-size: 11px; color: var(--text-dim); font-weight: 400; margin-left: 4px; }
.mb-3 { margin-bottom: 16px; }
.mt-3 { margin-top: 16px; }

/* Payment */
.payment-options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.pay-option {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; border-radius: var(--radius-lg);
  border: 1.5px solid var(--border); cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.pay-option input[type='radio'] { display: none; }
.pay-option.active { border-color: var(--primary); background: var(--primary-05); }
.pay-icon { font-size: 22px; color: var(--text-muted); }
.pay-option.active .pay-icon { color: var(--primary); }
.pay-label { font-weight: 700; font-size: 14px; flex: 1; }
.pay-badges { display: flex; gap: 6px; }
.pay-badge {
  font-size: 9px; font-weight: 800; letter-spacing: 0.05em;
  padding: 2px 6px; border-radius: 4px;
  background: var(--primary-10); color: var(--primary);
  border: 1px solid var(--primary-20);
}
.card-fields { padding-top: 4px; }
.cod-notice {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; background: rgba(197,160,89,0.08);
  border: 1px solid rgba(197,160,89,0.25); border-radius: var(--radius);
  font-size: 14px; color: var(--text-light);
}

/* Summary card */
.summary-col { position: sticky; top: 24px; }
.summary-card {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius-xl); padding: 24px;
}
.summary-heading { font-size: 17px; font-weight: 800; margin-bottom: 20px; }
.summary-items { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.sum-item { display: flex; align-items: center; gap: 12px; }
.sum-img {
  position: relative; width: 56px; height: 56px; flex-shrink: 0;
  border-radius: var(--radius); background: var(--primary-05);
  border: 1px solid var(--border); overflow: hidden;
}
.sum-img img { width: 100%; height: 100%; object-fit: cover; }
.sum-qty-badge {
  position: absolute; top: -6px; right: -6px;
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--primary); color: white;
  font-size: 11px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--bg-surface);
}
.sum-info { flex: 1; min-width: 0; }
.sum-name { font-size: 13px; font-weight: 700; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sum-vol { font-size: 12px; color: var(--text-dim); }
.sum-price { font-size: 14px; font-weight: 700; color: var(--primary); flex-shrink: 0; }
.summary-totals { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.sum-row { display: flex; justify-content: space-between; font-size: 14px; color: var(--text-muted); }
.sum-divider { height: 1px; background: var(--border); margin: 4px 0; }
.total-row { font-size: 16px; font-weight: 800; color: var(--text-white); }
.total-price { color: var(--primary); }
.green { color: var(--green); font-weight: 700; }
.free-ship-hint { font-size: 12px; color: var(--accent-gold); margin-top: -4px; }

.place-order-btn {
  width: 100%; padding: 14px; border-radius: var(--radius);
  background: var(--primary); color: white; font-weight: 800; font-size: 16px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: var(--shadow-primary); transition: background 0.2s;
  margin-bottom: 12px;
}
.place-order-btn:hover:not(:disabled) { background: var(--primary-hover); }
.place-order-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.secure-note {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 12px; color: var(--text-dim);
}

/* Success */
.success-card {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius-xl); padding: 40px 32px; text-align: center;
}
.success-icon-wrap { margin-bottom: 16px; }
.success-icon { font-size: 64px; color: var(--green); }
.success-title { font-size: 32px; font-weight: 900; margin-bottom: 8px; }
.success-sub { color: var(--text-muted); margin-bottom: 12px; }
.success-sub strong { color: var(--text-white); }
.success-order-id {
  display: inline-block; padding: 6px 16px;
  background: var(--primary-10); border: 1px solid var(--primary-20);
  border-radius: var(--radius-full); font-size: 14px; font-weight: 700;
  color: var(--primary); margin-bottom: 28px;
}
.success-items {
  text-align: left; border: 1px solid var(--border);
  border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 20px;
}
.success-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; border-bottom: 1px solid var(--border);
}
.success-item:last-child { border-bottom: none; }
.si-img { width: 40px; height: 40px; border-radius: var(--radius); overflow: hidden; background: var(--primary-05); flex-shrink: 0; }
.si-img img { width: 100%; height: 100%; object-fit: cover; }
.si-info { flex: 1; min-width: 0; text-align: left; }
.si-name { font-size: 13px; font-weight: 700; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.si-qty { font-size: 12px; color: var(--text-dim); }
.si-price { font-size: 14px; font-weight: 700; color: var(--primary); }
.success-totals { text-align: left; display: flex; flex-direction: column; gap: 8px; margin-bottom: 28px; }
.st-row { display: flex; justify-content: space-between; font-size: 14px; color: var(--text-muted); }
.st-row.total { font-size: 16px; font-weight: 800; color: var(--text-white); border-top: 1px solid var(--border); padding-top: 10px; margin-top: 4px; }
.st-row.total span:last-child { color: var(--primary); }
.success-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.success-btn {
  padding: 12px 28px; border-radius: var(--radius);
  font-weight: 700; font-size: 15px; display: inline-flex; align-items: center;
}
.btn-primary { background: var(--primary); color: white; transition: background 0.2s; }
.btn-primary:hover { background: var(--primary-hover); }
.btn-outline {
  background: transparent; color: var(--primary);
  border: 1.5px solid var(--primary); transition: background 0.2s;
}
.btn-outline:hover { background: var(--primary-10); }

@media (max-width: 860px) {
  .checkout-grid { grid-template-columns: 1fr; }
  .summary-col { position: static; }
  .page-title { font-size: 24px; }
}
@media (max-width: 540px) {
  .field-row { grid-template-columns: 1fr; }
  .form-section { padding: 20px; }
  .success-card { padding: 28px 20px; }
}
</style>
