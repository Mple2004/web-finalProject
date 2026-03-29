<template>
  <div class="members-management">
    <div class="page-header">
      <div>
        <h1>Member Management</h1>
        <p class="text-muted">Add, edit, or remove members</p>
      </div>
      <button class="btn-add" @click="showForm = !showForm">
        <span class="material-symbols-outlined">person_add</span>
        Add Member
      </button>
    </div>

    <!-- Add/Edit Form Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="resetForm">
      <div class="modal-content form-card">
        <div class="modal-header">
          <h2>{{ editingMember ? 'Edit Member' : 'Add New Member' }}</h2>
          <button type="button" class="modal-close" @click="resetForm">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <form @submit.prevent="saveMember" class="member-form">
        <div class="form-row">
          <div class="form-group">
            <label>Email *</label>
            <input
              v-model="formData.email"
              type="email"
              required
            >
          </div>
          <div class="form-group">
            <label>Full Name *</label>
            <input
              v-model="formData.name"
              type="text"
              required
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Password *</label>
            <input
              v-model="formData.password"
              type="password"
              :placeholder="editingMember ? 'Leave empty to keep current' : 'Enter password'"
            >
          </div>
          <div class="form-group">
            <label>Status *</label>
            <select 
              v-model="formData.status" 
              :disabled="isEditingOtherAdmin"
              required
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Profile Image</label>
            <div class="image-upload">
              <input 
                id="member-image"
                type="file" 
                ref="imageInput"
                @change="handleImageUpload" 
                accept="image/*"
                class="image-input"
              >
              <label for="member-image" class="image-upload-label">
                <span class="material-symbols-outlined">image</span>
                <span>Choose Image</span>
              </label>
            </div>
            <div v-if="formData.image" class="image-preview">
              <img :src="formData.image" :alt="formData.name || 'Member'">
              <button type="button" class="remove-image" @click="removeImage" title="Remove image">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            {{ editingMember ? 'Update Member' : 'Create Member' }}
          </button>
          <button type="button" class="btn btn-secondary" @click="resetForm">
            Cancel
          </button>
        </div>
      </form>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="controls">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Search by name or email..."
        class="search-input"
      >
      <select v-model="filterStatus" class="filter-select">
        <option value="">All Members</option>
        <option value="member">Members</option>
        <option value="admin">Admins</option>
      </select>
    </div>

    <!-- Members Table -->
    <div class="card">
      <div class="table-container">
        <table class="members-table">
          <colgroup>
            <col style="width:64px">
            <col style="width:30%">
            <col style="width:25%">
            <col style="width:110px">
            <col style="width:130px">
          </colgroup>
          <thead>
            <tr>
              <th></th>
              <th>Email</th>
              <th>Name</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in filteredMembers" :key="member.email">
              <td class="image-cell">
                <div v-if="member.image" class="member-avatar">
                  <img :src="member.image" :alt="member.name">
                </div>
                <div v-else class="member-avatar empty">
                  <span class="material-symbols-outlined">person</span>
                </div>
              </td>
              <td class="email">{{ member.email }}</td>
              <td>{{ member.name }}</td>
              <td>
                <span class="status-badge" :class="member.status">
                  {{ member.status }}
                </span>
              </td>
              <td class="actions">
                <button
                  @click="editMember(member)"
                  class="action-btn edit"
                  title="Edit"
                >
                  <span class="material-symbols-outlined">edit</span>
                </button>
                <button
                  @click="deleteMember(member.email)"
                  :disabled="member.status === 'admin'"
                  class="action-btn delete"
                  title="Delete"
                >
                  <span class="material-symbols-outlined">delete</span>
                </button>
                <button
                  @click="viewOrders(member)"
                  class="action-btn orders"
                  title="Order History"
                >
                  <span class="material-symbols-outlined">receipt_long</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredMembers.length === 0" class="empty-state">
        <span class="material-symbols-outlined">people</span>
        <p>No members found</p>
      </div>
    </div>

    <!-- Order History Modal -->
    <div v-if="viewingMember" class="modal-overlay" @click.self="viewingMember = null">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h2>Order History</h2>
            <p class="modal-subtitle">{{ viewingMember.name }} · {{ viewingMember.email }}</p>
          </div>
          <button type="button" class="modal-close" @click="viewingMember = null">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div v-if="memberOrders.length === 0" class="orders-empty">
          <span class="material-symbols-outlined">inbox</span>
          <p>No orders found</p>
        </div>

        <div v-else class="orders-list">
          <div v-for="order in memberOrders" :key="order.historyID" class="order-card" @click="goToOrder(order.orderId)">
            <div class="order-card-header">
              <span class="order-id">{{ order.orderId }}</span>
              <span class="order-status" :class="order.status.toLowerCase()">{{ order.status }}</span>
            </div>
            <div class="order-card-meta">
              <span>{{ formatDate(order.date) }}</span>
              <span class="order-total">฿{{ order.total_price.toLocaleString() }}</span>
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
import { ref, computed } from 'vue'
import { mockUsers, MOCK_HISTORY } from '../../data/mockData'
import { useAuth } from '../../stores/auth'
import { useToast } from '../../stores/toast'
import { useRouter } from 'vue-router'

const auth = useAuth()
const toast = useToast()
const router = useRouter()
const members = ref([...mockUsers])
const showForm = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const editingMember = ref(null)
const imageInput = ref(null)
const viewingMember = ref(null)

const memberOrders = computed(() =>
  viewingMember.value
    ? MOCK_HISTORY.filter(o => o.email === viewingMember.value.email)
    : []
)

function viewOrders(member) {
  viewingMember.value = member
}

function goToOrder(orderId) {
  viewingMember.value = null
  router.push({ name: 'admin-orders', query: { order: orderId } })
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const currentUserEmail = computed(() => auth.user.value?.email)

const isEditingOtherAdmin = computed(() => {
  return editingMember.value && 
         editingMember.value.status === 'admin' && 
         editingMember.value.email !== currentUserEmail.value
})

const formData = ref({
  email: '',
  name: '',
  password: '',
  status: 'member',
  image: ''
})

// Filter members
const filteredMembers = computed(() => {
  return members.value.filter(member => {
    const matchSearch = !searchQuery.value || 
      member.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchStatus = !filterStatus.value || member.status === filterStatus.value
    return matchSearch && matchStatus
  })
})

// Reset form
function resetForm() {
  showForm.value = false
  editingMember.value = null
  formData.value = {
    email: '',
    name: '',
    password: '',
    status: 'member',
    image: ''
  }
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

// Edit member
function editMember(member) {
  editingMember.value = member
  formData.value = { 
    email: member.email,
    name: member.name,
    password: '',
    status: member.status,
    image: member.image || ''
  }
  showForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Save member
function saveMember() {
  if (editingMember.value) {
    // Prevent admin from removing their own admin status
    if (editingMember.value.email === currentUserEmail.value && 
        editingMember.value.status === 'admin' && 
        formData.value.status !== 'admin') {
      toast.show('✗ You cannot remove your own admin privileges')
      return
    }
    
    // Update existing member
    const index = members.value.findIndex(m => m.email === editingMember.value.email)
    if (index !== -1) {
      members.value[index] = {
        ...editingMember.value,
        email: formData.value.email,
        name: formData.value.name,
        status: isEditingOtherAdmin.value ? editingMember.value.status : formData.value.status,
        password: formData.value.password || editingMember.value.password,
        image: formData.value.image || editingMember.value.image
      }
      toast.show('✓ Member updated successfully')
    }
  } else {
    // Add new member
    if (!formData.value.password) {
      toast.show('✗ Password is required for new members')
      return
    }
    const newMember = {
      email: formData.value.email,
      name: formData.value.name,
      password: formData.value.password,
      status: formData.value.status,
      image: formData.value.image || ''
    }
    members.value.push(newMember)
    toast.show('✓ Member added successfully')
  }
  resetForm()
}

// Delete member
function deleteMember(email) {
  const member = members.value.find(m => m.email === email)
  if (member?.status === 'admin') {
    toast.show('✗ Admin accounts cannot be deleted')
    return
  }
  if (confirm('Are you sure you want to delete this member?')) {
    members.value = members.value.filter(m => m.email !== email)
    toast.show('✓ Member deleted successfully')
  }
}

// Handle image upload
function handleImageUpload(event) {
  const file = event.target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.image = e.target?.result || ''
    }
    reader.readAsDataURL(file)
  }
}

// Remove image
function removeImage() {
  formData.value.image = ''
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}
</script>

<style scoped>
.members-management {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header { display:flex; align-items:flex-start; justify-content:space-between; }

/* ── Modal Overlay ──────────────────────────────── */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:1000; padding:16px; animation:fadeIn 0.2s ease; }
.modal-content { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-xl); padding:24px; max-width:600px; width:100%; max-height:90vh; overflow-y:auto; animation:slideUp 0.3s ease; }
.modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
.modal-header h2 { margin:0; font-size:18px; font-weight:700; color:var(--text-white); }

/* ── Form Card ───────────────────────────────────– */
.form-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 24px;
}

.modal-content.form-card h2 {
  display: none;
}

.member-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-light);
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  background: var(--bg-dark);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-white);
  font-size: 13px;
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-10);
}

/* ── Image Upload ────────────────────────────────– */
.image-input {
  display: none;
}

.image-upload {
  position: relative;
}

.image-upload-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-dark);
  border: 2px dashed var(--primary);
  border-radius: var(--radius);
  color: var(--primary);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.image-upload-label:hover {
  background: var(--primary-10);
}

.image-upload-label .material-symbols-outlined {
  font-size: 20px;
}

.image-preview {
  position: relative;
  margin-top: 12px;
  border-radius: var(--radius);
  overflow: hidden;
  max-width: 200px;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-image:hover {
  background: #f44336;
}

.remove-image .material-symbols-outlined {
  font-size: 18px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.btn {
  padding: 10px 20px;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: var(--primary-10);
  color: var(--primary);
  border: 1px solid var(--primary-20);
}

.btn-secondary:hover {
  background: var(--primary-20);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary:disabled:hover {
  background: var(--primary);
}

.btn-secondary:disabled:hover {
  background: var(--primary-10);
}

.action-btn {
  padding: 8px;
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: var(--primary-10);
}

.action-btn.edit:hover:not(:disabled) {
  color: var(--primary);
}

.action-btn.delete:hover:not(:disabled) {
  color: #f44336;
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

/* ── Controls ────────────────────────────────────– */
.controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 250px;
  padding: 10px 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-white);
  font-size: 13px;
}

.filter-select {
  padding: 10px 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-white);
  font-size: 13px;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--primary);
}

/* ── Card ────────────────────────────────────────– */
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

/* ── Table ───────────────────────────────────────– */
.table-container {
  overflow-x: auto;
}

.members-table {
  width: 100%;
  border-collapse: collapse;
}

.members-table thead {
  background: var(--primary-05);
  border-bottom: 2px solid var(--border);
}

.members-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.members-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  color: var(--text-light);
}

.members-table tbody tr:hover {
  background: var(--primary-05);
}

.email {
  font-weight: 700;
  color: var(--text-white);
}

.image-cell {
  text-align: center;
  width: 60px;
  padding: 14px 4px !important;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-10);
  border: 2px solid var(--border);
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-avatar.empty {
  background: var(--primary-10);
  color: var(--primary);
}

.member-avatar.empty .material-symbols-outlined {
  font-size: 20px;
}

.status-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

.status-badge.member {
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
}

.status-badge.admin {
  background: rgba(212, 17, 50, 0.15);
  color: var(--primary);
}

.actions {
  display: flex;
  gap: 6px;
  align-items: center;
  white-space: nowrap;
}

.action-btn.orders:hover:not(:disabled) {
  background: rgba(33, 150, 243, 0.12);
  color: #42a5f5;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-dim);
}

.empty-state .material-symbols-outlined {
  font-size: 44px;
  display: block;
  margin-bottom: 12px;
  opacity: 0.4;
}

/* ── Order History Modal ─────────────────────────– */
.modal-subtitle { margin: 4px 0 0; font-size: 13px; color: var(--text-muted); }

.orders-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
}
.orders-empty .material-symbols-outlined { font-size: 40px; display: block; margin-bottom: 8px; opacity: 0.4; }

.orders-list { display: flex; flex-direction: column; gap: 12px; max-height: 60vh; overflow-y: auto; }

.order-card {
  background: var(--bg-dark);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.order-card:hover { border-color: var(--primary); }

.order-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.order-id { font-weight: 700; font-size: 13px; color: var(--text-white); }

.order-status { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; }
.order-status.processing { background: rgba(255,193,7,0.15); color: #ffc107; }
.order-status.delivered  { background: rgba(76,175,80,0.15);  color: #4caf50; }

.order-card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.order-total { font-weight: 700; color: var(--accent-gold); }

.order-products { display: flex; flex-direction: column; gap: 4px; border-top: 1px solid var(--border); padding-top: 10px; }

.order-product-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-light);
}

.qty-price { color: var(--text-muted); }

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .controls {
    flex-direction: column;
  }

  .search-input {
    min-width: auto;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
