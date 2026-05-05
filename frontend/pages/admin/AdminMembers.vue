<template>
  <div class="members-management">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="search-wrap">
        <span class="material-symbols-outlined search-icon">search</span>
        <input v-model="searchQuery" type="text" placeholder="Search by name or email…" class="search-input">
        <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <select v-model="filterStatus" class="filter-select">
        <option value="">All Members</option>
        <option value="member">Members</option>
        <option value="admin">Admins</option>
      </select>
      <button class="btn-add" @click="openAdd">
        <span class="material-symbols-outlined">person_add</span>
        Add Member
      </button>
    </div>

    <!-- Table -->
    <div class="card">
      <div v-if="loading" class="loading-state">
        <span class="spinner-ring"></span>
        <p>Loading members…</p>
      </div>
      <div v-else class="table-container">
        <table class="members-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredMembers.length === 0">
              <td colspan="4" class="empty-cell">
                <span class="material-symbols-outlined">people</span>
                <p>No members found</p>
              </td>
            </tr>
            <tr v-for="member in filteredMembers" :key="member.email">
              <td>
                <div class="member-cell">
                  <div class="avatar" :style="{ backgroundColor: getColor(member.email) }">
                    <img
                      :src="`http://localhost:5000/img_mem/${encodeURIComponent(member.email)}.jpg?t=${imageTimestamp}`"
                      :alt="member.name" class="avatar-img"
                      @error="e => e.target.style.visibility = 'hidden'"
                    >
                    <span class="avatar-initials">{{ getInitials(member.name) }}</span>
                  </div>
                  <span class="member-name">{{ member.name }}</span>
                </div>
              </td>
              <td class="email">{{ member.email }}</td>
              <td>
                <span class="status-badge" :class="member.status">{{ member.status }}</span>
              </td>
              <td class="actions">
                <button @click="openEdit(member)" class="icon-btn edit" title="Edit">
                  <span class="material-symbols-outlined">edit</span>
                </button>
                <button @click="viewOrders(member)" class="icon-btn orders" title="View Orders">
                  <span class="material-symbols-outlined">receipt_long</span>
                </button>
                <button
                  @click="deleteMember(member.email)"
                  :disabled="member.status === 'admin' || member.email === currentUserEmail"
                  class="icon-btn delete" title="Delete"
                >
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Member Modal -->
    <div v-if="addingMember" class="modal-overlay" @click.self="closeAdd">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h2>Add New Member</h2>
            <p class="modal-sub">Create a new account</p>
          </div>
          <button type="button" class="close-btn" @click="closeAdd">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <form @submit.prevent="saveNewMember" class="edit-form" @submit.capture="validateBeforeSubmit">
          <div class="form-group">
            <label>Name *</label>
            <input v-model="addForm.name" type="text" required placeholder="Full name">
          </div>
          <div class="form-group">
            <label>Email *</label>
            <input v-model="addForm.email" type="email" required placeholder="email@example.com" 
              :style="{ borderColor: isEmailDuplicate ? '#f44336' : 'inherit' }">
            <p v-if="addForm.email && !isEmailValid" class="form-error">Invalid email format</p>
            <p v-if="isEmailDuplicate" class="form-error">This email is already registered</p>
          </div>
          <div class="form-group">
            <label>Password *</label>
            <input v-model="addForm.password" type="password" required placeholder="Password">
          </div>
          <div class="form-group">
            <label>Profile Photo</label>
            <div class="file-input-wrapper">
              <input ref="addFileInput" type="file" accept="image/*" @change="onAddFileSelected" class="file-input">
              <button type="button" class="file-btn" @click="addFileInput.click()">
                <span class="material-symbols-outlined">image</span>
                {{ addForm.photoFile ? 'Change Photo' : 'Choose Photo' }}
              </button>
              <span v-if="addForm.photoFile" class="file-name">{{ addForm.photoFile.name }}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="addForm.status" class="status-select">
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="saving || loading || !isAddFormValid || isEmailDuplicate || !isEmailValid"
              @click.prevent="!isAddFormValid && $event.preventDefault()"
            >
              {{ saving ? 'Creating…' : loading ? 'Loading...' : 'Create Member' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="closeAdd">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Member Modal -->
    <div v-if="editingMember" class="modal-overlay" @click.self="closeEdit">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-header-info">
            <div class="avatar avatar-lg" :style="{ backgroundColor: getColor(editingMember.email) }">
              <img
                :src="editForm.preview || `http://localhost:5000/img_mem/${encodeURIComponent(editingMember.email)}.jpg?t=${imageTimestamp}`"
                :alt="editingMember.name" class="avatar-img"
                @error="e => e.target.style.visibility = 'hidden'"
              >
              <span class="avatar-initials">{{ getInitials(editingMember.name) }}</span>
            </div>
            <div>
              <h2>Edit Member</h2>
              <p class="modal-sub">{{ editingMember.email }}</p>
            </div>
          </div>
          <button type="button" class="close-btn" @click="closeEdit">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <form @submit.prevent="saveMember" class="edit-form">
          <div class="form-group">
            <label>Email *</label>
            <input v-model="editForm.email" type="email" required>
          </div>
          <div class="form-group">
            <label>Name *</label>
            <input v-model="editForm.name" type="text" required>
          </div>
          <div class="form-group">
            <label>Password <span class="optional">(leave blank to keep current)</span></label>
            <input v-model="editForm.password" type="password" placeholder="New password">
          </div>
          <div class="form-group">
            <label>Profile Photo</label>
            <div class="file-input-wrapper">
              <input id="editFileInput" type="file" accept="image/*" @change="onFileSelected" class="file-input">
              <label for="editFileInput" class="file-btn">
                <span class="material-symbols-outlined">image</span>
                {{ editForm.photoFile ? 'Change Photo' : 'Choose Photo' }}
              </label>
              <span v-if="editForm.photoFile" class="file-name">{{ editForm.photoFile.name }}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Status</label>
            <div v-if="editingMember.status === 'admin'" class="status-readonly">
              <span class="status-badge admin">admin</span>
              <span class="status-note">Admin status cannot be changed</span>
            </div>
            <select v-else v-model="editForm.status" class="status-select">
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save Changes' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="closeEdit">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Order History Modal -->
    <div v-if="viewingMember" class="modal-overlay" @click.self="viewingMember = null">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h2>Order History</h2>
            <p class="modal-sub">{{ viewingMember.name }} · {{ viewingMember.email }}</p>
          </div>
          <button type="button" class="close-btn" @click="viewingMember = null">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div v-if="loadingOrders" class="loading-state padded">
          <span class="spinner-ring"></span>
          <p>Loading orders…</p>
        </div>
        <div v-else-if="memberOrders.length === 0" class="orders-empty">
          <span class="material-symbols-outlined">inbox</span>
          <p>No orders found</p>
        </div>
        <div v-else class="orders-list">
          <div v-for="order in memberOrders" :key="order.orderId" class="order-card" @click="openOrderDetail(order)">
            <div class="order-card-header">
              <span class="order-id">#{{ order.orderId }}</span>
              <span class="order-status" :class="order.status">{{ order.status }}</span>
            </div>
            <div class="order-card-meta">
              <span>{{ formatDate(order.date) }}</span>
              <span class="order-total">฿{{ Number(order.total).toLocaleString() }}</span>
            </div>
            <div class="order-products">
              <div v-for="(p, i) in order.products" :key="i" class="order-product-row">
                <span>{{ p.pdName }}</span>
                <span class="qty-price">× {{ p.qty }} · ฿{{ (p.qty * p.price).toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import { useAuth } from '../../stores/auth'
import { useToast } from '../../stores/toast'
import { getInitials } from '../../utils/string'

const auth = useAuth()
const toast = useToast()
const router = useRouter()

const members = ref([])
const loading = ref(true)
const saving = ref(false)
let isSubmitting = false // Flag to prevent multiple submissions
const searchQuery = ref('')
const filterStatus = ref('')
const editingMember = ref(null)
const editForm = ref({ email: '', name: '', status: '', password: '', photoFile: null, preview: null })
const addingMember = ref(false)
const addForm = ref({ name: '', email: '', password: '', status: 'member', photoFile: null })
const addFileInput = ref(null)
const viewingMember = ref(null)
const memberOrders = ref([])
const loadingOrders = ref(false)
const imageTimestamp = ref(Date.now())
const currentUserEmail = computed(() => auth.user.value?.email)

const filteredMembers = computed(() =>
  members.value.filter(m => {
    const matchSearch = !searchQuery.value ||
      m.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchStatus = !filterStatus.value || m.status === filterStatus.value
    return matchSearch && matchStatus
  })
)

const isEmailDuplicate = computed(() => {
  if (!addForm.value.email.trim()) return false
  return members.value.some(m => m.email.toLowerCase() === addForm.value.email.toLowerCase())
})

const isEmailValid = computed(() => {
  if (!addForm.value.email.trim()) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(addForm.value.email)
})

const isAddFormValid = computed(() => {
  return addForm.value.name.trim() && 
         addForm.value.email.trim() && 
         addForm.value.password.trim() && 
         isEmailValid.value && 
         !isEmailDuplicate.value
})

onMounted(async () => {
  try {
    members.value = await api.getAllMembers()
  } catch (err) {
    toast.show('✗ Failed to load members')
  } finally {
    loading.value = false
  }
})

const COLORS = ['#d41132','#9c27b0','#3f51b5','#0288d1','#00897b','#43a047','#f4511e','#6d4c41']
function getColor(email) {
  let hash = 0
  for (const c of email) hash = (hash << 5) - hash + c.charCodeAt(0)
  return COLORS[Math.abs(hash) % COLORS.length]
}

function openAdd() {
  addForm.value = { name: '', email: '', password: '', status: 'member', photoFile: null }
  addingMember.value = true
}

function closeAdd() {
  addingMember.value = false
  addForm.value = { name: '', email: '', password: '', status: '', photoFile: null }
}

function onAddFileSelected(event) {
  const file = event.target.files?.[0]
  if (file) addForm.value.photoFile = file
}

function validateBeforeSubmit(event) {
  // Prevent submission if members not yet loaded
  if (loading.value) {
    event.preventDefault()
    event.stopPropagation()
    toast.show('✗ Members list is still loading. Please wait.')
    return false
  }
  
  // Prevent submission if form is invalid
  if (isEmailDuplicate.value || !isEmailValid.value || !addForm.value.name.trim() || !addForm.value.password.trim()) {
    event.preventDefault()
    event.stopPropagation()
    if (isEmailDuplicate.value) {
      toast.show('✗ This email is already registered. Cannot proceed.')
    } else if (!isEmailValid.value) {
      toast.show('✗ Invalid email format. Cannot proceed.')
    } else {
      toast.show('✗ Please fill in all required fields.')
    }
    return false
  }
}

async function saveNewMember() {
  // Prevent multiple concurrent submissions
  if (isSubmitting || saving.value) {
    toast.show('✗ Please wait, submission in progress...')
    return
  }
  
  // Ensure members list is fully loaded
  if (loading.value) {
    toast.show('✗ Members list is still loading. Please wait.')
    return
  }
  
  // Final validation - STRICT CHECK
  if (!addForm.value.name.trim() || !addForm.value.email.trim() || !addForm.value.password.trim()) {
    toast.show('✗ All fields are required')
    return
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(addForm.value.email)) {
    toast.show('✗ Invalid email format')
    return
  }
  
  // CRITICAL: Check if email already exists in members list
  const emailExists = members.value.some(m => m.email.toLowerCase() === addForm.value.email.toLowerCase())
  if (emailExists) {
    toast.show('✗ Email already exists. Please use a different email.')
    return
  }
  
  if (!confirm('Create new member account?')) return
  
  // Now mark as submitting (after confirmation)
  isSubmitting = true
  saving.value = true
  try {
    // FRESH CHECK: Verify email doesn't exist (handles race condition)
    const freshEmailExists = members.value.some(m => m.email.toLowerCase() === addForm.value.email.toLowerCase())
    if (freshEmailExists) {
      toast.show('✗ Email was already registered by another user. Please try again.')
      saving.value = false
      return
    }
    
    const res = await api.register(addForm.value.name, addForm.value.email, addForm.value.password)
    if (!res.regist) {
      const errorMsg = res.message?.toLowerCase().includes('email') ? 
        '✗ This email is already registered.' : 
        `✗ ${res.message}`
      toast.show(errorMsg)
      return
    }
    if (addForm.value.status === 'admin' || addForm.value.photoFile) {
      const formData = new FormData()
      formData.append('email', addForm.value.email)
      if (addForm.value.status === 'admin') formData.append('status', 'admin')
      if (addForm.value.photoFile) formData.append('file', addForm.value.photoFile)
      await api.updateMemberWithFile(addForm.value.email, formData)
    }
    members.value = await api.getAllMembers()
    
    // Verify the new member was actually added to the list
    const newMemberExists = members.value.some(m => m.email.toLowerCase() === addForm.value.email.toLowerCase())
    if (!newMemberExists) {
      toast.show('⚠ Member created but verification failed. Refreshing...')
      members.value = await api.getAllMembers()
    }
    
    toast.show('✓ Member created successfully')
    closeAdd()
  } catch (err) {
    const errorMsg = err.response?.data?.message?.toLowerCase().includes('email') ?
      '✗ This email is already registered.' :
      `✗ Error: ${err.response?.data?.message || err.message}`
    toast.show(errorMsg)
  } finally {
    isSubmitting = false
    saving.value = false
  }
}

function openEdit(member) {
  editingMember.value = member
  editForm.value = { email: member.email, name: member.name, status: member.status, password: '', photoFile: null, preview: null }
}

function closeEdit() {
  editingMember.value = null
  editForm.value = { email: '', name: '', status: '', password: '', photoFile: null, preview: null }
}

function onFileSelected(event) {
  const file = event.target.files?.[0]
  if (file) {
    editForm.value.photoFile = file
    editForm.value.preview = URL.createObjectURL(file)
  }
}

async function saveMember() {
  if (!confirm('Update this member?')) return
  
  saving.value = true
  try {
    const formData = new FormData()
    formData.append('email', editForm.value.email)
    formData.append('name', editForm.value.name)
    if (editForm.value.password) formData.append('password', editForm.value.password)
    if (editForm.value.photoFile) formData.append('file', editForm.value.photoFile)
    if (editingMember.value.status !== 'admin') formData.append('status', editForm.value.status)

    const res = await api.updateMemberWithFile(editingMember.value.email, formData)
    if (res.updated && res.member) {
      const idx = members.value.findIndex(m => m.email === editingMember.value.email)
      if (idx !== -1) members.value[idx] = { ...members.value[idx], ...res.member }
      imageTimestamp.value = Date.now()
      toast.show('✓ Member updated successfully')
      closeEdit()
      window.location.reload()
    } else {
      toast.show(`✗ ${res.message}`)
    }
  } catch (err) {
    toast.show(`✗ Error: ${err.response?.data?.message || err.message}`)
  } finally {
    saving.value = false
  }
}

async function deleteMember(email) {
  if (!confirm('Are you sure you want to delete this member? This action cannot be undone.')) return
  try {
    await api.deleteMember(email)
    members.value = members.value.filter(m => m.email !== email)
    toast.show('✓ Member deleted successfully')
  } catch (err) {
    toast.show(`✗ Error: ${err.message}`)
  }
}

async function viewOrders(member) {
  viewingMember.value = member
  memberOrders.value = []
  loadingOrders.value = true
  try {
    const res = await api.getMemberOrders(member.email)
    memberOrders.value = res.success ? res.orders : []
  } catch {
    memberOrders.value = []
  } finally {
    loadingOrders.value = false
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function openOrderDetail(order) {
  viewingMember.value = null
  router.push({ path: '/admin/orders', query: { orderId: order.orderId } })
}
</script>

<style scoped>
.members-management { display: flex; flex-direction: column; gap: 20px; }

/* Top Bar */
.top-bar { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.search-wrap {
  position: relative; flex: 1; min-width: 240px; display: flex; align-items: center;
}
.search-icon { position: absolute; left: 12px; font-size: 18px; color: var(--text-muted); pointer-events: none; }
.search-input {
  width: 100%; padding: 10px 36px 10px 40px;
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-white); font-size: 13px;
}
.search-input:focus { outline: none; border-color: var(--primary); }
.search-clear {
  position: absolute; right: 10px; background: none; border: none;
  color: var(--text-muted); cursor: pointer; display: flex; align-items: center; padding: 4px;
}
.search-clear:hover { color: var(--text-white); }
.search-clear .material-symbols-outlined { font-size: 16px; }
.filter-select {
  padding: 10px 12px; background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-white); font-size: 13px;
}
.filter-select:focus { outline: none; border-color: var(--primary); }
.btn-add {
  display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px;
  background: var(--primary); color: white; border: none; border-radius: var(--radius);
  font-weight: 600; font-size: 13px; cursor: pointer; white-space: nowrap; transition: all .2s;
}
.btn-add:hover { background: var(--primary-hover); transform: translateY(-1px); }
.btn-add .material-symbols-outlined { font-size: 18px; }

/* Loading */
.loading-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 60px; gap: 12px; color: var(--text-muted);
}
.loading-state.padded { padding: 40px; }
.spinner-ring {
  width: 36px; height: 36px; border: 3px solid var(--border);
  border-top-color: var(--primary); border-radius: 50%;
  animation: spin 0.8s linear infinite; display: block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Table */
.card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-xl); overflow: hidden; }
.table-container { overflow-x: auto; }
.members-table { width: 100%; border-collapse: collapse; }
.members-table thead { background: var(--primary-05); border-bottom: 1px solid var(--border); }
.members-table th {
  padding: 11px 16px; text-align: left; font-size: 11px;
  font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .07em;
}
.members-table td { padding: 10px 16px; border-bottom: 1px solid var(--border); font-size: 13px; color: var(--text-light); vertical-align: middle; }
.members-table tbody tr:hover { background: var(--primary-05); }
.members-table tbody tr:last-child td { border-bottom: none; }

.member-cell { display: flex; align-items: center; gap: 10px; }
.member-name { font-weight: 600; color: var(--text-white); }
.email { color: var(--text-muted); font-size: 12px; }

.avatar {
  position: relative; width: 36px; height: 36px; border-radius: 50%;
  overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
}
.avatar.avatar-lg { width: 46px; height: 46px; }
.avatar-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; }
.avatar-initials { font-size: 13px; font-weight: 700; color: white; z-index: 0; }
.avatar.avatar-lg .avatar-initials { font-size: 16px; }

.status-badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; }
.status-badge.member { background: rgba(76,175,80,.15); color: #4caf50; }
.status-badge.admin  { background: rgba(212,17,50,.12); color: var(--primary); }

.actions { display: flex; gap: 6px; }
.icon-btn {
  width: 30px; height: 30px; border-radius: var(--radius);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; border: 1px solid transparent; background: none;
}
.icon-btn .material-symbols-outlined { font-size: 16px; }
.icon-btn { color: var(--text-muted); }
.icon-btn.edit:hover   { background: var(--primary-10); border-color: var(--primary-20); color: var(--primary); }
.icon-btn.orders:hover { background: rgba(33,150,243,.1); border-color: rgba(33,150,243,.2); color: #42a5f5; }
.icon-btn.delete:hover { background: rgba(244,67,54,.1);  border-color: rgba(244,67,54,.2);  color: #f44336; }
.icon-btn:disabled     { opacity: .3; cursor: not-allowed; pointer-events: none; }

.empty-cell { text-align: center; padding: 56px 24px; color: var(--text-dim); }
.empty-cell .material-symbols-outlined { font-size: 44px; display: block; margin-bottom: 12px; opacity: .4; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.65);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px;
}
.modal-content {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius-xl); max-width: 520px; width: 100%; max-height: 92vh; overflow-y: auto;
}
.modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid var(--border);
}
.modal-header-info { display: flex; align-items: center; gap: 12px; }
.modal-header h2 { margin: 0; font-size: 17px; font-weight: 700; color: var(--text-white); }
.modal-sub { margin: 4px 0 0 0; font-size: 12px; color: var(--text-muted); }
.close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; }
.close-btn:hover { color: var(--text-white); }
.close-btn .material-symbols-outlined { font-size: 22px; }

/* Forms */
.edit-form { display: flex; flex-direction: column; gap: 14px; padding: 20px 24px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 12px; font-weight: 600; color: var(--text-light); }
.form-group input {
  padding: 10px 12px; background: var(--bg-dark); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-white); font-size: 13px;
}
.form-group input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px rgba(212,17,50,.15); }
.status-select {
  padding: 10px 12px; background: var(--bg-dark); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-white); font-size: 13px;
}
.status-select:focus { outline: none; border-color: var(--primary); }
.status-readonly { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
.status-note { font-size: 12px; color: var(--text-dim); font-style: italic; }
.form-error { margin: 0; font-size: 12px; color: #f44336; font-weight: 500; }
.optional { font-size: 11px; color: var(--text-muted); font-weight: 400; }
.file-input-wrapper { display: flex; align-items: center; gap: 8px; }
.file-input { display: none; }
.file-btn {
  padding: 8px 12px; background: var(--bg-dark); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-white); font-size: 13px;
  cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all .2s;
}
.file-btn:hover { border-color: var(--primary); color: var(--primary); }
.file-btn .material-symbols-outlined { font-size: 16px; }
.file-name { font-size: 12px; color: var(--text-muted); }
.form-actions { display: flex; gap: 10px; padding-top: 4px; }
.btn { padding: 10px 20px; border-radius: var(--radius); font-weight: 600; font-size: 13px; cursor: pointer; border: none; transition: all .2s; }
.btn-primary { background: var(--primary); color: white; }
.btn-primary:hover:not(:disabled) { background: var(--primary-hover); }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; background: var(--primary-05); color: var(--text-muted); }
.btn-secondary { background: var(--primary-10); color: var(--primary); border: 1px solid var(--primary-20); }
.btn-secondary:hover { background: var(--primary-20); }

/* Orders list */
.orders-empty { text-align: center; padding: 40px; color: var(--text-muted); }
.orders-empty .material-symbols-outlined { font-size: 40px; display: block; margin-bottom: 8px; opacity: .4; }
.orders-list { display: flex; flex-direction: column; gap: 10px; max-height: 60vh; overflow-y: auto; padding: 16px 24px; }
.order-card {
  background: var(--bg-dark); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 14px; cursor: pointer; transition: all .2s;
}
.order-card:hover { background: var(--primary-05); border-color: var(--primary); }
.order-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.order-id { font-weight: 700; font-size: 13px; color: var(--text-white); }
.order-status { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; }
.order-status.paid      { background: rgba(76,175,80,.15);  color: #4caf50; }
.order-status.delivered { background: rgba(33,150,243,.15); color: #42a5f5; }
.order-card-meta { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 10px; }
.order-total { font-weight: 700; color: var(--accent-gold); }
.order-products { display: flex; flex-direction: column; gap: 4px; border-top: 1px solid var(--border); padding-top: 10px; }
.order-product-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-light); }
.qty-price { color: var(--text-muted); }
</style>
