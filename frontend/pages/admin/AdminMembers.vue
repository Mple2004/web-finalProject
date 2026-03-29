<template>
  <div class="members-management">
    <div class="page-header">
      <div>
        <h1>Member Management</h1>
        <p class="text-muted">View and manage members</p>
      </div>
      <button class="btn-add" @click="openAdd">
        <span class="material-symbols-outlined">person_add</span>
        Add Member
      </button>
    </div>

    <div class="controls">
      <input v-model="searchQuery" type="text" placeholder="Search by name or email..." class="search-input">
      <select v-model="filterStatus" class="filter-select">
        <option value="">All Members</option>
        <option value="member">Members</option>
        <option value="admin">Admins</option>
      </select>
    </div>

    <div class="card">
      <div v-if="loading" class="empty-state"><p>Loading members...</p></div>
      <div v-else class="table-container">
        <table class="members-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Email</th>
              <th>Name</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in filteredMembers" :key="member.email">
              <td class="avatar-cell">
                <div class="avatar" :style="{ backgroundColor: getColor(member.email) }">
                  <img
                    :src="`http://localhost:5000/img_mem/${encodeURIComponent(member.email)}.jpg?t=${imageTimestamp}`"
                    :alt="member.name"
                    class="avatar-img"
                    @error="e => e.target.style.visibility = 'hidden'"
                  >
                  <span class="avatar-initials">{{ getInitials(member.name) }}</span>
                </div>
              </td>
              <td class="email">{{ member.email }}</td>
              <td>{{ member.name }}</td>
              <td>
                <span class="status-badge" :class="member.status">{{ member.status }}</span>
              </td>
              <td class="actions">
                <button
                  @click="openEdit(member)"
                  class="action-btn edit"
                  title="Edit"
                >
                  <span class="material-symbols-outlined">edit</span>
                </button>
                <button
                  @click="viewOrders(member)"
                  class="action-btn orders"
                  title="View Orders"
                >
                  <span class="material-symbols-outlined">receipt_long</span>
                </button>
                <button
                  @click="deleteMember(member.email)"
                  :disabled="member.status === 'admin' || member.email === currentUserEmail"
                  class="action-btn delete"
                  title="Delete"
                >
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!loading && filteredMembers.length === 0" class="empty-state">
        <span class="material-symbols-outlined">people</span>
        <p>No members found</p>
      </div>
    </div>

    <!-- Add Member Modal -->
    <div v-if="addingMember" class="modal-overlay" @click.self="closeAdd">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Add New Member</h2>
          <button type="button" class="modal-close" @click="closeAdd">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <form @submit.prevent="saveNewMember" class="edit-form">
          <div class="form-group">
            <label>Name *</label>
            <input v-model="addForm.name" type="text" required placeholder="Full name">
          </div>
          <div class="form-group">
            <label>Email *</label>
            <input v-model="addForm.email" type="email" required placeholder="email@example.com">
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
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Creating...' : 'Create Member' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="closeAdd">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="editingMember" class="modal-overlay" @click.self="closeEdit">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-header-info">
            <div class="avatar avatar-lg" :style="{ backgroundColor: getColor(editingMember.email) }">
              <img
                :src="editForm.preview || `http://localhost:5000/img_mem/${encodeURIComponent(editingMember.email)}.jpg?t=${imageTimestamp}`"
                :alt="editingMember.name"
                class="avatar-img"
                @error="e => e.target.style.visibility = 'hidden'"
              >
              <span class="avatar-initials">{{ getInitials(editingMember.name) }}</span>
            </div>
            <div>
              <h2>Edit Member</h2>
              <p class="modal-subtitle">{{ editingMember.email }}</p>
            </div>
          </div>
          <button type="button" class="modal-close" @click="closeEdit">
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
              <input 
                id="editFileInput"
                type="file" 
                accept="image/*" 
                @change="onFileSelected"
                class="file-input"
              >
              
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
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="closeEdit">Cancel</button>
          </div>
        </form>
      </div>
    </div>

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
        <div v-if="loadingOrders" class="orders-empty"><p>Loading...</p></div>
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

const auth = useAuth()
const toast = useToast()
const router = useRouter()

const members = ref([])
const loading = ref(true)
const saving = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const editingMember = ref(null)
const editForm = ref({ email: '', name: '', status: '', password: '', photoFile: null,preview: null })
const addingMember = ref(false)
const addForm = ref({ name: '', email: '', password: '', status: 'member', photoFile: null })
const addFileInput = ref(null)
const viewingMember = ref(null)
const memberOrders = ref([])
const loadingOrders = ref(false)
const fileInput = ref(null)
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

onMounted(async () => {
  try {
    members.value = await api.getAllMembers()
  } catch (err) {
    toast.show('✗ Failed to load members')
  } finally {
    loading.value = false
  }
})

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

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
}

function onAddFileSelected(event) {
  const file = event.target.files?.[0]
  if (file) addForm.value.photoFile = file
}

async function saveNewMember() {
  saving.value = true
  try {
    const res = await api.register(addForm.value.name, addForm.value.email, addForm.value.password)
    if (!res.regist) {
      toast.show(`✗ ${res.message}`)
      return
    }

    if (addForm.value.status === 'admin' || addForm.value.photoFile) {
      const formData = new FormData()
      
      // 👉 เพิ่มบรรทัดนี้: ส่ง email เข้าไปในฟอร์มด้วยเพื่อให้ Backend รู้ว่าคือของใคร
      formData.append('email', addForm.value.email) 
      
      if (addForm.value.status === 'admin') formData.append('status', 'admin')
      if (addForm.value.photoFile) formData.append('file', addForm.value.photoFile)
      await api.updateMemberWithFile(addForm.value.email, formData)
    }
    
    // รีเฟรชข้อมูลให้ตารางอัปเดตทันที
    members.value = await api.getAllMembers()
    toast.show('✓ Member created successfully')
    closeAdd()
  } catch (err) {
    toast.show(`✗ Error: ${err.response?.data?.message || err.message}`)
  } finally {
    saving.value = false
  }
}

function openEdit(member) {
  editingMember.value = member
  editForm.value = { email: member.email, name: member.name, status: member.status, password: '', photoFile: null }
}

function closeEdit() {
  editingMember.value = null
  editForm.value = { email: '', name: '', status: '', password: '', photoFile: null }
}

function onFileSelected(event) {
  const file = event.target.files?.[0]
  if (file) {
    editForm.value.photoFile = file
    editForm.value.preview = URL.createObjectURL(file)
  }
}

async function saveMember() {
  saving.value = true
  try {
    const formData = new FormData()
    formData.append('email', editForm.value.email)
    formData.append('name', editForm.value.name)

    if (editForm.value.password) {
      formData.append('password', editForm.value.password)
    }

    if (editForm.value.photoFile) {
      formData.append('file', editForm.value.photoFile)
    }

    if (editingMember.value.status !== 'admin') {
      formData.append('status', editForm.value.status)
    }

    const res = await api.updateMemberWithFile(editingMember.value.email, formData)

    if (res.updated && res.member) {
      const oldEmail = editingMember.value.email
      const idx = members.value.findIndex(m => m.email === oldEmail)

      if (idx !== -1) {
        members.value[idx] = { ...members.value[idx], ...res.member }
      }

      imageTimestamp.value = Date.now()
      toast.show('✓ Member updated successfully')
      closeEdit()

      // 👉 ใส่ตรงนี้
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
  if (!confirm('Are you sure you want to delete this member?')) return
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
  // ปิด Modal ดูประวัติออเดอร์
  viewingMember.value = null
  // ส่งไปหน้า Orders พร้อมกับ orderId บน URL
  router.push({
    path: '/admin/orders',
    query: { orderId: order.orderId }
  })
}
</script>

<style scoped>
.members-management { display:flex; flex-direction:column; gap:24px; }
.page-header { display:flex; align-items:flex-start; justify-content:space-between; }
.page-header h1 { margin:0 0 4px; font-size:24px; font-weight:900; color:var(--text-white); }
.text-muted { margin:0; font-size:14px; color: #b0b0b0; }
.btn-add { display:inline-flex; align-items:center; gap:8px; padding:10px 20px; background:var(--primary); color:white; border:none; border-radius:var(--radius); font-weight:700; font-size:14px; cursor:pointer; transition:background .2s; }
.btn-add:hover { background:var(--primary-hover); }
.btn-add .material-symbols-outlined { font-size:20px; }
.controls { display:flex; gap:12px; flex-wrap:wrap; }
.search-input { flex:1; min-width:250px; padding:10px 12px; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius); color:var(--text-white); font-size:13px; }
.filter-select,.status-select { padding:10px 12px; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius); color:var(--text-white); font-size:13px; }
.search-input:focus,.filter-select:focus,.status-select:focus { outline:none; border-color:var(--primary); }

/* Avatar */
.avatar { position:relative; width:36px; height:36px; border-radius:50%; overflow:hidden; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
.avatar.avatar-lg { width:48px; height:48px; }
.avatar-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:1; }
.avatar-initials { font-size:13px; font-weight:700; color:white; letter-spacing:.02em; z-index:0; }
.avatar.avatar-lg .avatar-initials { font-size:16px; }
.avatar-cell { width:52px; }

/* Table */
.card { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-xl); overflow:hidden; }
.table-container { overflow-x:auto; }
.members-table { width:100%; border-collapse:collapse; }
.members-table thead { background:var(--primary-05); border-bottom:2px solid var(--border); }
.members-table th { padding:12px 16px; text-align:left; font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.05em; }
.members-table td { padding:10px 16px; border-bottom:1px solid var(--border); font-size:13px; color:var(--text-light); vertical-align:middle; }
.members-table tbody tr:hover { background:var(--primary-05); }
.email { font-weight:700; color:var(--text-white); }
.status-badge { display:inline-block; font-size:11px; font-weight:700; padding:4px 8px; border-radius:4px; text-transform:uppercase; }
.status-badge.member { background:rgba(76,175,80,.15); color:#4caf50; }
.status-badge.admin { background:rgba(212,17,50,.15); color:var(--primary); }
.actions { display:flex; gap:6px; }
.action-btn { padding:6px; background:none; border:none; cursor:pointer; border-radius:4px; display:inline-flex; align-items:center; color:var(--text-light); transition:all .2s; }
.action-btn:hover:not(:disabled) { background:var(--primary-10); }
.action-btn.edit:hover:not(:disabled) { color:var(--primary); }
.action-btn.orders:hover:not(:disabled) { color:#42a5f5; }
.action-btn.delete:hover:not(:disabled) { color:#f44336; }
.action-btn:disabled { opacity:.3; cursor:not-allowed; }
.empty-state { text-align:center; padding:48px 24px; color:var(--text-dim); }
.empty-state .material-symbols-outlined { font-size:44px; display:block; margin-bottom:12px; opacity:.4; }

/* Modal */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; z-index:1000; padding:16px; }
.modal-content { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-xl); padding:24px; max-width:600px; width:100%; max-height:90vh; overflow-y:auto; }
.modal-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; }
.modal-header-info { display:flex; align-items:center; gap:12px; }
.modal-header h2 { margin:0; font-size:18px; font-weight:700; color:var(--text-white); }
.modal-subtitle { margin:4px 0 0; font-size:13px; color:var(--text-muted); }
.modal-close { background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:20px; }

/* Edit Form */
.edit-form { display:flex; flex-direction:column; gap:16px; }
.form-group { display:flex; flex-direction:column; gap:6px; }
.form-group label { font-size:13px; font-weight:600; color:var(--text-light); }
.form-group input { padding:10px 12px; background:var(--bg-dark); border:1px solid var(--border); border-radius:var(--radius); color:var(--text-white); font-size:13px; }
.form-group input:focus { outline:none; border-color:var(--primary); }
.form-group input:disabled { opacity:.5; cursor:not-allowed; }
.status-readonly { display:flex; align-items:center; gap:10px; padding:8px 0; }
.status-note { font-size:12px; color:var(--text-dim); font-style:italic; }
.optional { font-size:12px; color:var(--text-muted); font-weight:400; }
.file-input-wrapper { display:flex; align-items:center; gap:8px; }
.file-input { display:none; }
.file-btn { padding:8px 12px; background:var(--bg-dark); border:1px solid var(--border); border-radius:var(--radius); color:var(--text-white); font-size:13px; cursor:pointer; display:inline-flex; align-items:center; gap:6px; transition:all .2s; }
.file-btn:hover { border-color:var(--primary); color:var(--primary); }
.file-name { font-size:12px; color:var(--text-muted); }
.form-actions { display:flex; gap:12px; margin-top:8px; }
.btn { padding:10px 20px; border-radius:var(--radius); font-weight:600; font-size:14px; cursor:pointer; border:none; transition:all .2s; }
.btn-primary { background:var(--primary); color:white; }
.btn-primary:hover:not(:disabled) { background:var(--primary-hover); }
.btn-primary:disabled { opacity:.6; cursor:not-allowed; }
.btn-secondary { background:var(--primary-10); color:var(--primary); border:1px solid var(--primary-20); }
.btn-secondary:hover { background:var(--primary-20); }

/* Orders modal */
.orders-empty { text-align:center; padding:40px; color:var(--text-muted); }
.orders-empty .material-symbols-outlined { font-size:40px; display:block; margin-bottom:8px; opacity:.4; }
.orders-list { display:flex; flex-direction:column; gap:12px; max-height:60vh; overflow-y:auto; }
.order-card { background:var(--bg-dark); border:1px solid var(--border); border-radius:var(--radius); padding:14px 16px; cursor:pointer; transition:all .2s; }
.order-card:hover { background:var(--primary-05); border-color:var(--primary); }
.order-card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
.order-id { font-weight:700; font-size:13px; color:var(--text-white); }
.order-status { font-size:11px; font-weight:700; padding:3px 8px; border-radius:4px; text-transform:uppercase; }
.order-status.paid { background:rgba(76,175,80,.15); color:#4caf50; }
.order-status.delivered { background:rgba(33,150,243,.15); color:#42a5f5; }
.order-card-meta { display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:10px; }
.order-total { font-weight:700; color:var(--accent-gold); }
.order-products { display:flex; flex-direction:column; gap:4px; border-top:1px solid var(--border); padding-top:10px; }
.order-product-row { display:flex; justify-content:space-between; font-size:12px; color:var(--text-light); }
.qty-price { color:var(--text-muted); }
</style>