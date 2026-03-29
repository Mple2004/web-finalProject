<template>
  <div class="profile-page">
    <nav class="breadcrumbs">
      <router-link to="/" class="crumb-link">Home</router-link>
      <span class="material-symbols-outlined crumb-sep">chevron_right</span>
      <span class="crumb-current">Profile</span>
    </nav>

    <div class="container">

      <div class="stats-bar">
        <div class="avatar-wrap">
          <img v-if="avatarUrl" :src="avatarUrl" class="avatar avatar-img" />
          <div v-else class="avatar">{{ user?.name?.charAt(0).toUpperCase() }}</div>
          <span class="role-badge" :class="user?.status">{{ user?.status }}</span>
        </div>
        <div class="user-info">
          <h2 class="user-name">{{ user?.name }}</h2>
          <p class="user-meta">{{ user?.email }}</p>
          <p class="user-meta">Member since {{ memberSince }}</p>
        </div>
        <div class="stats">
          <div class="stat">
            <span class="stat-num">{{ userOrders.length }}</span>
            <span class="stat-label">Orders</span>
          </div>
          <div class="divider" />
          <div class="stat">
            <span class="stat-num">฿{{ totalSpent.toLocaleString() }}</span>
            <span class="stat-label">Total Spent</span>
          </div>
          <div class="divider" />
          <div class="stat">
            <span class="stat-num">{{ wishlistItems.length }}</span>
            <span class="stat-label">Wishlist</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <span class="material-symbols-outlined">manage_accounts</span>
            Account Information
          </h3>
          <button v-if="!editing" class="edit-btn" @click="startEdit">
            <span class="material-symbols-outlined">edit</span>
            Edit Profile
          </button>
          <div v-else class="action-btns">
            <button class="cancel-btn" @click="cancelEdit" :disabled="saving">Cancel</button>
            <button class="save-btn" @click="saveProfile" :disabled="saving">
              <span class="material-symbols-outlined" v-if="!saving">check</span>
              <span class="material-symbols-outlined" v-else>sync</span>
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>

        <div v-if="editing" class="field">
          <label class="field-label">Profile Picture</label>
          <div class="avatar-upload">
            <img v-if="previewUrl" :src="previewUrl" class="avatar-preview" />
            <div v-else class="avatar-preview initials">{{ user?.name?.charAt(0).toUpperCase() }}</div>
            <div class="upload-side">
              <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
              <button class="upload-btn" type="button" @click="fileInput.click()" :disabled="saving">
                <span class="material-symbols-outlined">upload</span>
                Choose Photo
              </button>
              <button v-if="previewUrl" class="remove-btn" type="button" @click="removePhoto" :disabled="saving">
                <span class="material-symbols-outlined">delete</span>
                Remove
              </button>
              <p class="upload-hint">JPG, PNG — max 2MB</p>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Name</label>
          <input v-if="editing" v-model="form.name" class="input" placeholder="Your name" :disabled="saving" />
          <span v-else class="input readonly">{{ user?.name }}</span>
        </div>

        <div class="field">
          <label class="field-label">Email</label>
          <input v-if="editing" v-model="form.email" class="input" placeholder="Email address" :disabled="saving" />
          <span v-else class="input readonly muted">{{ user?.email }}</span>
        </div>

        <div class="field">
          <label class="field-label">Current Password</label>
          <div v-if="editing" class="pw-wrap">
            <input v-model="form.currentPassword"
              :type="showPw.current ? 'text' : 'password'"
              class="input" placeholder="Enter current password (required for password change)" :disabled="saving" />
            <button class="pw-eye" @click="showPw.current = !showPw.current" type="button">
              <span class="material-symbols-outlined">{{ showPw.current ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
          <span v-else class="input readonly muted">••••••••</span>
        </div>

        <div v-if="editing" class="field">
          <label class="field-label">
            New Password
            <span class="field-hint">(leave blank to keep current)</span>
          </label>
          <div class="pw-wrap">
            <input v-model="form.newPassword"
              :type="showPw.new ? 'text' : 'password'"
              class="input" placeholder="New password (min. 6 characters)" :disabled="saving" />
            <button class="pw-eye" @click="showPw.new = !showPw.new" type="button">
              <span class="material-symbols-outlined">{{ showPw.new ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Status</label>
          <span class="status-chip" :class="user?.status">{{ user?.status }}</span>
        </div>

        <p v-if="formError" class="form-error">{{ formError }}</p>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <span class="material-symbols-outlined">receipt_long</span>
            Order History
          </h3>
        </div>

        <div v-if="loadingOrders" class="loading-orders">Loading orders...</div>

        <div v-else-if="userOrders.length === 0" class="empty-orders">
          <span class="material-symbols-outlined">inbox</span>
          <p>No orders yet</p>
        </div>

        <div v-else class="order-list">
          <div v-for="order in userOrders" :key="order.cartId || order.id" class="order-row">
            <div class="order-left">
              <div>
                <p class="order-id">#{{ order.cartId || order.id }}</p>
                <p class="order-meta">
                  {{ order.date ? new Date(order.date).toLocaleDateString('en-US') : '-' }}
                  · {{ order.items?.length || 0 }} item{{ (order.items?.length || 0) !== 1 ? 's' : '' }}
                </p>
              </div>
            </div>
            <div class="order-right">
              <span class="order-status" :class="(order.status || 'processing').toLowerCase()">
                {{ order.status || 'Processing' }}
              </span>
              <span class="order-total">฿{{ Number(order.total_price || 0).toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="logout-row">
        <button class="logout-btn" @click="handleLogout">
          <span class="material-symbols-outlined">logout</span>
          Sign Out
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api' // <-- อย่าลืม import api
import { useAuth } from '../stores/auth'
import { useToast } from '../stores/toast'
import { useOrders } from '../stores/orders'

const router = useRouter()
const auth = useAuth()
const toast = useToast()
const orders = useOrders()
const user = computed(() => auth.user.value) // ใช้ computed เพื่อให้ชัวร์ว่าอัปเดตตาม store ทันที

// ── Orders ────────────────────────────────────────
const userOrders = ref([])
const loadingOrders = ref(false)
const wishlistItems = ref([]) 
const memberSince = ref('March 2026')

// ── Avatar ────────────────────────────────────────
const avatarKey = () => `avatar_${user.value?.email}`
const avatarUrl = ref('')
const previewUrl = ref('')
const fileInput = ref(null)
const selectedFile = ref(null) // เก็บไฟล์จริงที่เลือกเพื่อส่งไป Backend

// ── Edit ──────────────────────────────────────────
const editing = ref(false)
const saving = ref(false) // สถานะกำลังบันทึกข้อมูล
const showPw = ref({ current: false, new: false })
const formError = ref('')
const form = ref({ name: '', email: '', currentPassword: '', newPassword: '' })

// ── Computed ──────────────────────────────────────
const totalSpent = computed(() =>
  (Array.isArray(userOrders.value) ? userOrders.value : [])
    .reduce((s, o) => s + Number(o.total_price || 0), 0)
)

onMounted(async () => {
  if (!auth.isLoggedIn.value) { router.push('/login'); return }

  // Try loading avatar from server first, fall back to localStorage
  const email = user.value?.email
  if (email) {
    const serverUrl = `http://localhost:5000/img_mem/${encodeURIComponent(email)}.jpg`
    const testImg = new Image()
    testImg.onload = () => { avatarUrl.value = serverUrl }
    testImg.onerror = () => { avatarUrl.value = localStorage.getItem(avatarKey()) || '' }
    testImg.src = `${serverUrl}?t=${Date.now()}`
  }

  loadingOrders.value = true
  try {
    const res = await orders.getUserOrders()
    userOrders.value = Array.isArray(res) ? res : (res?.history ?? res?.data ?? [])
  } catch (err) {
    console.error('Failed to load orders:', err.message)
    userOrders.value = []
  } finally {
    loadingOrders.value = false
  }
// 3. โหลด Wishlist (เพิ่มเข้ามาเพื่อให้นับจำนวนได้ถูกต้อง)
  try {
    const wishlistData = await api.getWishlist()
    // เช็คว่าข้อมูลที่ได้มาเป็น Array หรือซ้อนอยู่ใน .data
    wishlistItems.value = Array.isArray(wishlistData) ? wishlistData : (wishlistData?.data ?? [])
  } catch (err) {
    console.error('Failed to load wishlist:', err.message)
    wishlistItems.value = []
  }
})

// ── Avatar upload ─────────────────────────────────
function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) { formError.value = 'Image must be under 2MB.'; return }
  
  selectedFile.value = file // เก็บไฟล์ไว้ส่ง API
  const reader = new FileReader()
  reader.onload = (ev) => { previewUrl.value = ev.target.result }
  reader.readAsDataURL(file)
}

function removePhoto() {
  previewUrl.value = ''
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

// ── Edit Profile ──────────────────────────────────
function startEdit() {
  form.value = { name: user.value?.name, email: user.value?.email, currentPassword: '', newPassword: '' }
  previewUrl.value = avatarUrl.value  // show current server photo as preview
  selectedFile.value = null
  formError.value = ''
  editing.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  editing.value = false
  saving.value = false
  showPw.value = { current: false, new: false }
  previewUrl.value = ''
  selectedFile.value = null
  formError.value = ''
}

async function saveProfile() {
  formError.value = ''
  const name = form.value.name.trim()
  const email = form.value.email.trim()

  if (!name) { formError.value = 'Name cannot be empty.'; return }
  if (!email) { formError.value = 'Email cannot be empty.'; return }

  if (form.value.newPassword) {
    if (!form.value.currentPassword) { formError.value = 'Please enter your current password.'; return }
    if (form.value.newPassword.length < 6) { formError.value = 'New password must be at least 6 characters.'; return }
  }

  saving.value = true // เปิดสถานะกำลังโหลด
  
  try {
    // ใช้ FormData ในการส่งข้อมูลเพราะอาจจะมีรูปภาพด้วย
    const formData = new FormData()
    formData.append('name', name)
    formData.append('email', email) // ส่งอีเมลไปเพื่ออัปเดต หรือใช้เป็นตัวอ้างอิง

    if (form.value.newPassword) {
      formData.append('currentPassword', form.value.currentPassword)
      formData.append('newPassword', form.value.newPassword)
    }

    if (selectedFile.value) {
      formData.append('file', selectedFile.value) // ไฟล์รูปภาพ
    }

    // 🔴 เรียก API: เปลี่ยนชื่อฟังก์ชันเป็นชื่อ API สำหรับอัปเดตโปรไฟล์ของคุณ
    // สมมติว่าใน api.js คุณสร้างฟังก์ชัน updateProfile() ไว้
    const res = await api.updateMemberWithFile(user.value.email, formData) // <-- ปรับชื่อฟังก์ชันให้ตรงกับ API ของคุณ

    if (res.updated || res.success) {
      // ✅ 1. อัปเดตข้อมูลใน Store เมื่อ API ตอบกลับว่าสำเร็จ
      auth.user.value = { ...auth.user.value, name, email }
      
      // ✅ 2. จัดการรูปภาพ (ถ้า Backend คืน URL รูปมาให้เอามาใส่ตรงนี้ได้เลย)
      if (previewUrl.value) {
        auth.updateAvatar(previewUrl.value)
        avatarUrl.value = previewUrl.value
      } else if (previewUrl.value === '' && avatarUrl.value !== '') {
        auth.removeAvatar()
        avatarUrl.value = ''
      }

      // ปิดโหมดแก้ไข และเคลียร์รหัสผ่าน
      editing.value = false
      showPw.value  = { current: false, new: false }
      form.value.currentPassword = ''
      form.value.newPassword = ''
      
      toast.show('✓ Profile updated successfully')
    } else {
      formError.value = res.message || 'Failed to update profile.'
    }
  } catch (err) {
    console.error(err)
    formError.value = err.response?.data?.message || err.message || 'Error updating profile.'
  } finally {
    saving.value = false // ปิดสถานะกำลังโหลด
  }
}

function handleLogout() {
  auth.logout()
  toast.show('Signed out successfully')
  router.push('/')
}
</script>

<style scoped>
.profile-page { min-height: 100vh; background: var(--bg-dark); padding: 40px 24px; }

.breadcrumbs { max-width: 760px; margin: 0 auto 28px; font-size: 13px; display: flex; align-items: center; gap: 8px; }
.crumb-link { font-weight: 600; color: var(--primary); text-decoration: none; }
.crumb-sep { font-size: 18px; color: var(--text-muted); }
.crumb-current { font-weight: 600; color: var(--text-light); }

.container { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }

/* Stats Bar */
.stats-bar {
  display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius-xl); padding: 24px 28px;
  position: relative; overflow: hidden;
}
.stats-bar::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(212,17,50,0.12) 0%, transparent 60%);
  pointer-events: none;
}
.avatar-wrap { position: relative; flex-shrink: 0; }
.avatar {
  width: 72px; height: 72px; border-radius: 50%;
  background: rgba(212,17,50,0.2); border: 2px solid var(--primary);
  display: flex; align-items: center; justify-content: center;
  font-size: 30px; font-weight: 900; color: var(--primary);
}
.avatar-img { object-fit: cover; }
.role-badge {
  position: absolute; bottom: -2px; right: -4px;
  font-size: 9px; font-weight: 700; text-transform: uppercase;
  padding: 2px 6px; border-radius: var(--radius-full);
}
.role-badge.admin  { background: var(--primary); color: white; }
.role-badge.member { background: var(--accent-gold); color: #111; }
.user-info { flex: 1; }
.user-name { font-size: 1.3rem; font-weight: 900; margin: 0 0 4px; }
.user-meta { font-size: 0.8rem; color: var(--text-muted); margin: 2px 0; }
.stats {
  display: flex; align-items: center; gap: 20px; margin-left: auto;
  background: rgba(255,255,255,0.04); border: 1px solid var(--border);
  border-radius: var(--radius-xl); padding: 12px 20px;
}
.stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.stat-num { font-size: 1.1rem; font-weight: 900; color: var(--primary); }
.stat-label { font-size: 0.6rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.08em; }
.divider { width: 1px; height: 28px; background: var(--border); }

/* Card */
.card {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius-xl); padding: 28px;
  display: flex; flex-direction: column; gap: 18px;
}
.card-header { display: flex; align-items: center; justify-content: space-between; }
.card-title {
  display: flex; align-items: center; gap: 8px; margin: 0;
  font-size: 0.8rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.12em; color: var(--text-white);
}
.card-title .material-symbols-outlined { font-size: 18px; color: var(--primary); }

.edit-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 16px; border-radius: var(--radius);
  border: 1px solid var(--border); color: var(--text-light);
  font-size: 13px; font-weight: 600; transition: all 0.2s;
}
.edit-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-10); }
.edit-btn .material-symbols-outlined { font-size: 16px; }
.action-btns { display: flex; gap: 8px; }
.cancel-btn {
  padding: 7px 16px; border-radius: var(--radius);
  border: 1px solid var(--border); color: var(--text-muted);
  font-size: 13px; font-weight: 600; transition: all 0.2s;
}
.cancel-btn:hover { border-color: var(--text-muted); color: var(--text-light); }
.save-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 16px; border-radius: var(--radius);
  background: var(--primary); color: white;
  font-size: 13px; font-weight: 700; transition: background 0.2s;
}
.save-btn:hover { background: var(--primary-hover); }
.save-btn .material-symbols-outlined { font-size: 16px; }

/* Avatar upload */
.avatar-upload { display: flex; align-items: center; gap: 20px; }
.avatar-preview {
  width: 72px; height: 72px; border-radius: 50%; flex-shrink: 0;
  object-fit: cover; border: 2px solid var(--primary);
}
.avatar-preview.initials {
  background: rgba(212,17,50,0.2); display: flex; align-items: center;
  justify-content: center; font-size: 28px; font-weight: 900; color: var(--primary);
}
.upload-side { display: flex; flex-direction: column; gap: 8px; }
.upload-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border: 1px solid var(--border); border-radius: var(--radius);
  color: var(--text-light); font-size: 13px; font-weight: 600; transition: all 0.2s;
}
.upload-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-10); }
.upload-btn .material-symbols-outlined { font-size: 16px; }
.remove-btn { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #ff6b8a; }
.remove-btn .material-symbols-outlined { font-size: 14px; }
.upload-hint { font-size: 11px; color: var(--text-muted); margin: 0; }

/* Fields */
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 13px; font-weight: 600; color: var(--text-light); }
.field-hint { font-size: 11px; font-weight: 400; color: var(--text-muted); }
.input {
  padding: 10px 14px; background: var(--bg-dark); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-white);
  font-size: 14px; outline: none; transition: border-color 0.2s; width: 100%; box-sizing: border-box;
}
input.input:focus { border-color: var(--primary); }
.input.readonly { display: block; cursor: default; }
.input.muted { color: var(--text-muted); font-size: 13px; }
.pw-wrap { position: relative; }
.pw-wrap .input { padding-right: 42px; }
.pw-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
.pw-eye:hover { color: var(--primary); }
.pw-eye .material-symbols-outlined { font-size: 18px; }

.status-chip {
  align-self: flex-start; font-size: 0.7rem; font-weight: 700;
  text-transform: uppercase; padding: 4px 12px; border-radius: var(--radius-full);
}
.status-chip.admin  { background: rgba(212,17,50,0.15); color: var(--primary); }
.status-chip.member { background: rgba(197,160,89,0.15); color: var(--accent-gold); }

.form-error { font-size: 13px; color: #ff6b8a; margin: 0; }

/* Orders */
.loading-orders { text-align: center; color: var(--text-muted); padding: 24px; font-size: 14px; }
.empty-orders { text-align: center; padding: 40px; color: var(--text-muted); }
.empty-orders .material-symbols-outlined { font-size: 40px; display: block; margin-bottom: 8px; opacity: 0.3; }
.order-list { display: flex; flex-direction: column; gap: 10px; }
.order-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px; background: var(--primary-05);
  border: 1px solid var(--border); border-radius: var(--radius); gap: 12px;
}
.order-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.order-id { font-size: 0.85rem; font-weight: 700; color: var(--text-white); margin: 0; }
.order-meta { font-size: 0.75rem; color: var(--text-muted); margin: 0; }
.order-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.order-status {
  font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.05em; padding: 3px 8px; border-radius: var(--radius-full);
}
.order-status.delivered  { background: rgba(34,197,94,0.15); color: #4ade80; }
.order-status.processing { background: rgba(245,158,11,0.15); color: #fbbf24; }
.order-status.paid       { background: rgba(34,197,94,0.15); color: #4ade80; }
.order-total { font-size: 0.9rem; font-weight: 800; color: var(--accent-gold); }

/* Logout */
.logout-row { display: flex; justify-content: flex-end; }
.logout-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 24px; background: var(--primary-10);
  border: 1px solid var(--primary-20); color: #ff6b8a;
  border-radius: var(--radius); font-size: 0.9rem; font-weight: 600; transition: background 0.2s;
}
.logout-btn:hover { background: var(--primary-20); }
.logout-btn .material-symbols-outlined { font-size: 18px; }

@media (max-width: 600px) {
  .stats-bar { flex-direction: column; text-align: center; }
  .stats { margin-left: 0; }
  .card-header { flex-direction: column; align-items: flex-start; gap: 12px; }
}

.breadcrumbs  { animation: fadeUp 0.4s ease both; }
.stats-bar    { animation: fadeUp 0.5s ease 0.1s both; }
</style>