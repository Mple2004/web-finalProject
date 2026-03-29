<template>
  <div class="products-management">
    <div class="page-header">
      <div>
        <h1>Product Management</h1>
        <p class="text-muted">Add, edit, or remove products from your catalog</p>
      </div>
      <button class="btn-add" @click="openAddProduct">
        <span class="material-symbols-outlined">add</span>
        Add Product
      </button>
    </div>

    <!-- Add/Edit Form Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="resetForm">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h2>
          <button type="button" class="modal-close" @click="resetForm">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <form @submit.prevent="saveProduct" class="product-form">
          <div class="form-row">
            <div class="form-group">
              <label>Product ID *</label>
              <input v-model.number="formData.pdID" type="number" required :disabled="!!editingProduct">
            </div>
            <div class="form-group">
              <label>Product Name *</label>
              <input v-model="formData.pdName" type="text" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Category *</label>
              <input v-model="formData.pdCategory" type="text" required>
            </div>
            <div class="form-group">
              <label>Sub Category</label>
              <input v-model="formData.pdSubCategory" type="text">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Brand *</label>
              <input v-model="formData.pdBrand" type="text" required>
            </div>
            <div class="form-group">
              <label>Country *</label>
              <input v-model="formData.pdCountry" type="text" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Size (ml) *</label>
              <input v-model.number="formData.pdSize" type="number" required>
            </div>
            <div class="form-group">
              <label>Price (฿) *</label>
              <input v-model.number="formData.pdPrice" type="number" step="0.01" required>
            </div>
            <div class="form-group">
              <label>Stock Qty *</label>
              <input v-model.number="formData.stock_qty" type="number" required>
            </div>
          </div>

          <!-- 3 Image Slots -->
          <div class="images-section">
            <label class="section-label">Product Images (max 3)</label>
            <div class="image-slots">
              <div v-for="(slot, i) in imageSlots" :key="i" class="image-slot">
                <span class="slot-label">{{ i === 0 ? 'Main' : `Image ${i + 1}` }}</span>
                <div class="slot-preview" :class="{ empty: !slot.preview }">
                  <img v-if="slot.preview" :src="slot.preview" :alt="`Image ${i+1}`" class="slot-img">
                  <span v-else class="material-symbols-outlined slot-icon">add_photo_alternate</span>
                </div>
                <div class="slot-actions">
                  <label :for="`img-input-${i}`" class="slot-btn upload">
                    <span class="material-symbols-outlined">upload</span>
                    {{ slot.preview ? 'Change' : 'Upload' }}
                  </label>
                  <button v-if="slot.preview" type="button" class="slot-btn remove" @click="removeSlot(i)">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
                <input
                  :id="`img-input-${i}`"
                  type="file"
                  accept="image/*"
                  style="display:none"
                  @change="onSlotFile($event, i)"
                >
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product') }}
            </button>
            <button type="button" class="btn btn-secondary" @click="resetForm">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="controls">
      <input v-model="searchQuery" type="text" placeholder="Search products..." class="search-input">
      <select v-model="filterCategory" class="filter-select">
        <option value="">All Categories</option>
        <option value="Beer">Beer</option>
        <option value="Whisky">Whisky</option>
        <option value="Wine">Wine</option>
        <option value="Vodka">Vodka</option>
        <option value="Rum">Rum</option>
        <option value="Cocktail">Cocktail</option>
      </select>
    </div>

    <!-- Products Table -->
    <div class="card">
      <div v-if="loadingProducts" class="empty-state"><p>Loading products...</p></div>
      <div v-else class="table-container">
        <table class="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Images</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Size</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.pdID">
              <td>{{ product.pdID }}</td>
              <td class="img-cell">
                <div class="thumb-group">
                  <img v-for="(url, i) in getImages(product)" :key="i"
                    :src="url" :alt="product.pdName" class="table-thumb"
                    :title="`Image ${i+1}`">
                  <span v-if="!product.pdImage" class="no-img">—</span>
                </div>
              </td>
              <td class="product-name">{{ product.pdName }}</td>
              <td>{{ product.pdCategory }}</td>
              <td>{{ product.pdBrand }}</td>
              <td>{{ product.pdSize }}ml</td>
              <td class="price">฿{{ Number(product.pdPrice).toLocaleString() }}</td>
              <td class="stock" :class="{ 'low-stock': product.stock_qty < 20 }">{{ product.stock_qty }}</td>
              <td class="actions">
                <button @click="editProduct(product)" class="action-btn edit" title="Edit">
                  <span class="material-symbols-outlined">edit</span>
                </button>
                <button @click="deleteProduct(product.pdID)" class="action-btn delete" title="Delete">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!loadingProducts && filteredProducts.length === 0" class="empty-state">
        <span class="material-symbols-outlined">inventory_2</span>
        <p>No products found</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../services/api'
import { useToast } from '../../stores/toast'

const toast = useToast()
const products = ref([])
const loadingProducts = ref(true)
const showForm = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const filterCategory = ref('')
const editingProduct = ref(null)

const formData = ref({
  pdID: '', pdName: '', pdCategory: '', pdSubCategory: '',
  pdBrand: '', pdCountry: '', pdSize: '', pdPrice: '', stock_qty: 0,
})

// 3 image slots: { file: File|null, preview: string|null, existingUrl: string|null }
const imageSlots = ref([
  { file: null, preview: null, existingUrl: null },
  { file: null, preview: null, existingUrl: null },
  { file: null, preview: null, existingUrl: null },
])

const filteredProducts = computed(() =>
  products.value.filter(p => {
    const matchSearch = !searchQuery.value ||
      p.pdName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (p.pdBrand || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchCat = !filterCategory.value || p.pdCategory === filterCategory.value
    return matchSearch && matchCat
  })
)

function getImages(product) {
  return [product.pdImage, product.pdImage2, product.pdImage3].filter(Boolean)
}

onMounted(async () => {
  await loadProducts()
})

async function loadProducts() {
  loadingProducts.value = true
  try {
    products.value = await api.getProducts()
  } catch {
    toast.show('✗ Failed to load products')
  } finally {
    loadingProducts.value = false
  }
}

function onSlotFile(e, i) {
  const file = e.target.files[0]
  if (!file) return
  imageSlots.value[i].file = file
  imageSlots.value[i].preview = URL.createObjectURL(file)
  // New file overrides existing — clear existingUrl for this slot
  imageSlots.value[i].existingUrl = null
}

function removeSlot(i) {
  imageSlots.value[i].file = null
  imageSlots.value[i].preview = null
  imageSlots.value[i].existingUrl = null
}
function openAddProduct() {
  editingProduct.value = null
  formData.value = { pdID: '', pdName: '', pdCategory: '', pdSubCategory: '', pdBrand: '', pdCountry: '', pdSize: '', pdPrice: '', stock_qty: 0 }
  imageSlots.value = [{ file: null, preview: null, existingUrl: null }, { file: null, preview: null, existingUrl: null }, { file: null, preview: null, existingUrl: null }]
  showForm.value = true
}
function resetForm() {
  showForm.value = false
  editingProduct.value = null
  formData.value = { pdID: '', pdName: '', pdCategory: '', pdSubCategory: '', pdBrand: '', pdCountry: '', pdSize: '', pdPrice: '', stock_qty: 0 }
  imageSlots.value = [{ file: null, preview: null, existingUrl: null }, { file: null, preview: null, existingUrl: null }, { file: null, preview: null, existingUrl: null }]
}

function editProduct(product) {
  editingProduct.value = product
  formData.value = { ...product }
  imageSlots.value = [
    { file: null, preview: product.pdImage || null, existingUrl: product.pdImage || null },
    { file: null, preview: product.pdImage2 || null, existingUrl: product.pdImage2 || null },
    { file: null, preview: product.pdImage3 || null, existingUrl: product.pdImage3 || null },
  ]
  showForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function saveProduct() {
  saving.value = true
  try {
    const imageFiles = imageSlots.value.map(s => s.file)
    const keepImages = imageSlots.value.map(s => s.existingUrl ?? '')

    if (editingProduct.value) {
      const res = await api.updateProduct(editingProduct.value.pdID, formData.value, imageFiles, keepImages)
      toast.show('✓ Product updated successfully')
    } else {
      const res = await api.createProduct(formData.value, imageFiles)
      toast.show('✓ Product added successfully')
    }
    resetForm()
    await loadProducts()
  } catch (err) {
    toast.show(`✗ ${err.response?.data?.message || err.message}`)
  } finally {
    saving.value = false
  }
}

async function deleteProduct(pdID) {
  if (!confirm('Are you sure you want to delete this product?')) return
  try {
    await api.deleteProduct(pdID)
    toast.show('✓ Product deleted successfully')
    await loadProducts()
  } catch (err) {
    toast.show(`✗ ${err.response?.data?.message || err.message}`)
  }
}
</script>

<style scoped>
.products-management { display:flex; flex-direction:column; gap:24px; }
.page-header { display:flex; align-items:flex-start; justify-content:space-between; }
.page-header h1 { margin:0 0 4px; font-size:24px; font-weight:900; color:var(--text-white); }
.text-muted { margin:0; font-size:14px;  color: floralwhite;}
.btn-add { display:inline-flex; align-items:center; gap:8px; padding:10px 16px; background:var(--primary); color:white; border:none; border-radius:var(--radius); font-weight:600; cursor:pointer; transition:all .2s; }
.btn-add:hover { background:var(--primary-hover); transform:translateY(-2px); }
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; z-index:1000; padding:16px; }
.modal-content { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-xl); padding:24px; max-width:640px; width:100%; max-height:90vh; overflow-y:auto; }
.modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
.modal-header h2 { margin:0; font-size:18px; font-weight:700; color:var(--text-white); }
.modal-close { background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:20px; }
.product-form { display:flex; flex-direction:column; gap:16px; }
.form-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:16px; }
.form-group { display:flex; flex-direction:column; gap:6px; }
.form-group label { font-size:13px; font-weight:600; color:var(--text-light); }
.form-group input { padding:10px 12px; background:var(--bg-dark); border:1px solid var(--border); border-radius:var(--radius); color:var(--text-white); font-size:13px; }
.form-group input:focus { outline:none; border-color:var(--primary); }
.form-group input:disabled { opacity:.5; cursor:not-allowed; }

/* Image Slots */
.images-section { display:flex; flex-direction:column; gap:10px; }
.section-label { font-size:13px; font-weight:600; color:var(--text-light); }
.image-slots { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
.image-slot { display:flex; flex-direction:column; gap:8px; }
.slot-label { font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.05em; }
.slot-preview { width:100%; aspect-ratio:1; background:var(--bg-dark); border:2px dashed var(--border); border-radius:var(--radius); overflow:hidden; display:flex; align-items:center; justify-content:center; transition:border-color .2s; }
.slot-preview:not(.empty) { border-style:solid; border-color:var(--border); }
.slot-img { width:100%; height:100%; object-fit:cover; }
.slot-icon { font-size:28px; color:var(--text-dim); }
.slot-actions { display:flex; gap:6px; }
.slot-btn { display:inline-flex; align-items:center; gap:4px; padding:6px 10px; border-radius:var(--radius); font-size:12px; font-weight:600; cursor:pointer; border:none; transition:all .2s; }
.slot-btn.upload { background:var(--primary-10); color:var(--primary); border:1px solid var(--primary-20); flex:1; justify-content:center; }
.slot-btn.upload:hover { background:var(--primary-20); }
.slot-btn.remove { background:rgba(244,67,54,.1); color:#f44336; border:1px solid rgba(244,67,54,.2); }
.slot-btn.remove:hover { background:rgba(244,67,54,.2); }

.form-actions { display:flex; gap:12px; margin-top:8px; }
.btn { padding:10px 20px; border-radius:var(--radius); font-weight:600; font-size:14px; cursor:pointer; border:none; transition:all .2s; }
.btn-primary { background:var(--primary); color:white; }
.btn-primary:hover:not(:disabled) { background:var(--primary-hover); }
.btn-primary:disabled { opacity:.6; cursor:not-allowed; }
.btn-secondary { background:var(--primary-10); color:var(--primary); border:1px solid var(--primary-20); }
.btn-secondary:hover { background:var(--primary-20); }

.controls { display:flex; gap:12px; flex-wrap:wrap; }
.search-input { flex:1; min-width:250px; padding:10px 12px; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius); color:var(--text-white); font-size:13px; }
.filter-select { padding:10px 12px; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius); color:var(--text-white); font-size:13px; }
.search-input:focus,.filter-select:focus { outline:none; border-color:var(--primary); }
.card { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-xl); overflow:hidden; }
.table-container { overflow-x:auto; }
.products-table { width:100%; border-collapse:collapse; }
.products-table thead { background:var(--primary-05); border-bottom:2px solid var(--border); }
.products-table th { padding:12px 16px; text-align:left; font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.05em; }
.products-table td { padding:10px 16px; border-bottom:1px solid var(--border); font-size:13px; color:var(--text-light); vertical-align:middle; }
.products-table tbody tr:hover { background:var(--primary-05); }
.img-cell { width:100px; }
.thumb-group { display:flex; gap:4px; }
.table-thumb { width:36px; height:36px; object-fit:cover; border-radius:4px; border:1px solid var(--border); }
.no-img { color:var(--text-dim); }
.product-name { font-weight:700; color:var(--text-white); }
.price { font-weight:700; color:var(--accent-gold); }
.stock { font-weight:600; }
.stock.low-stock { color:#f44336; }
.actions { display:flex; gap:8px; }
.action-btn { padding:6px; background:none; border:none; color:var(--text-light); cursor:pointer; border-radius:4px; display:inline-flex; align-items:center; transition:all .2s; }
.action-btn.edit:hover { background:var(--primary-10); color:var(--primary); }
.action-btn.delete:hover { background:rgba(244,67,54,.1); color:#f44336; }
.empty-state { text-align:center; padding:48px 24px; color:var(--text-dim); }
.empty-state .material-symbols-outlined { font-size:44px; display:block; margin-bottom:12px; opacity:.4; }
</style>
