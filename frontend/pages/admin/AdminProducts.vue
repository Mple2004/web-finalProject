<template>
  <div class="products-management">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="search-wrap">
        <span class="material-symbols-outlined search-icon">search</span>
        <input v-model="searchQuery" type="text" placeholder="Search products…" class="search-input">
        <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <select v-model="filterCategory" class="filter-select">
        <option value="">All Categories</option>
        <option value="Beer">Beer</option>
        <option value="Whisky">Whisky</option>
        <option value="Wine">Wine</option>
        <option value="Vodka">Vodka</option>
        <option value="Rum">Rum</option>
        <option value="Cocktail">Cocktail</option>
      </select>
      <button class="btn-add" @click="openAddProduct">
        <span class="material-symbols-outlined">add</span>
        Add Product
      </button>
    </div>

    <!-- Add/Edit Form Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="resetForm">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h2>{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h2>
            <p class="modal-sub">{{ editingProduct ? `ID: ${editingProduct.pdID}` : 'Fill in the product details below' }}</p>
          </div>
          <button type="button" class="close-btn" @click="resetForm">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <form @submit.prevent="saveProduct" class="product-form">
          <div class="form-row">
            <div class="form-group">
              <label>Product ID <span v-if="!editingProduct" class="optional">(Auto-generated)</span> *</label>
              <input v-model.number="formData.pdID" type="number" :required="!!editingProduct" :disabled="!editingProduct">
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

    <!-- Products Table -->
    <div class="card">
      <div v-if="loadingProducts" class="loading-state">
        <span class="spinner-ring"></span>
        <p>Loading products…</p>
      </div>
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
            <tr v-if="filteredProducts.length === 0">
              <td colspan="9" class="empty-cell">
                <span class="material-symbols-outlined">inventory_2</span>
                <p>No products found</p>
              </td>
            </tr>
            <tr v-for="product in filteredProducts" :key="product.pdID">
              <td>{{ product.pdID }}</td>
              <td class="img-cell">
                <div class="thumb-group">
                  <img v-for="(url, i) in getImages(product)" :key="i"
                    :src="url" :alt="product.pdName" class="table-thumb">
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
                <button @click="editProduct(product)" class="icon-btn edit" title="Edit">
                  <span class="material-symbols-outlined">edit</span>
                </button>
                <button @click="deleteProduct(product.pdID)" class="icon-btn delete" title="Delete">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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
function generateProductID() {
  if (products.value.length === 0) return 1
  const maxID = Math.max(...products.value.map(p => p.pdID))
  return maxID + 1
}

function openAddProduct() {
  editingProduct.value = null
  formData.value = { pdID: generateProductID(), pdName: '', pdCategory: '', pdSubCategory: '', pdBrand: '', pdCountry: '', pdSize: '', pdPrice: '', stock_qty: 0 }
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
  const action = editingProduct.value ? 'Update this product?' : 'Add this product?'
  if (!confirm(action)) return
  
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
  if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return
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
.products-management { display: flex; flex-direction: column; gap: 20px; }

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
.spinner-ring {
  width: 36px; height: 36px; border: 3px solid var(--border);
  border-top-color: var(--primary); border-radius: 50%;
  animation: spin 0.8s linear infinite; display: block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Table */
.card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-xl); overflow: hidden; }
.table-container { overflow-x: auto; }
.products-table { width: 100%; border-collapse: collapse; }
.products-table thead { background: var(--primary-05); border-bottom: 1px solid var(--border); }
.products-table th {
  padding: 11px 16px; text-align: left; font-size: 11px;
  font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .07em;
}
.products-table td { padding: 10px 16px; border-bottom: 1px solid var(--border); font-size: 13px; color: var(--text-light); vertical-align: middle; }
.products-table tbody tr:hover { background: var(--primary-05); }
.products-table tbody tr:last-child td { border-bottom: none; }

.img-cell { width: 100px; }
.thumb-group { display: flex; gap: 4px; }
.table-thumb { width: 36px; height: 36px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border); }
.no-img { color: var(--text-dim); }
.product-name { font-weight: 700; color: var(--text-white); }
.price { font-weight: 700; color: var(--accent-gold); }
.stock { font-weight: 600; }
.stock.low-stock { color: #f44336; }

.actions { display: flex; gap: 6px; }
.icon-btn {
  width: 30px; height: 30px; border-radius: var(--radius);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; border: 1px solid transparent; background: none;
}
.icon-btn .material-symbols-outlined { font-size: 16px; }
.icon-btn { color: var(--text-muted); }
.icon-btn.edit:hover   { background: var(--primary-10); border-color: var(--primary-20); color: var(--primary); }
.icon-btn.delete:hover { background: rgba(244,67,54,.1);  border-color: rgba(244,67,54,.2);  color: #f44336; }

.empty-cell { text-align: center; padding: 56px 24px; color: var(--text-dim); }
.empty-cell .material-symbols-outlined { font-size: 44px; display: block; margin-bottom: 12px; opacity: .4; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.65);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px;
}
.modal-content {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius-xl); max-width: 640px; width: 100%; max-height: 90vh; overflow-y: auto;
}
.modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid var(--border);
}
.modal-header h2 { margin: 0; font-size: 17px; font-weight: 700; color: var(--text-white); }
.modal-sub { margin: 4px 0 0 0; font-size: 12px; color: var(--text-muted); }
.close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; }
.close-btn:hover { color: var(--text-white); }
.close-btn .material-symbols-outlined { font-size: 22px; }

/* Forms */
.product-form { display: flex; flex-direction: column; gap: 14px; padding: 20px 24px; }
.form-row { display: grid; grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 12px; font-weight: 600; color: var(--text-light); }
.form-group input {
  padding: 10px 12px; background: var(--bg-dark); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-white); font-size: 13px;
}
.form-group input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px rgba(212,17,50,.15); }
.form-group input:disabled { opacity: .5; cursor: not-allowed; }

/* Image Slots */
.images-section { display: flex; flex-direction: column; gap: 10px; }
.section-label { font-size: 12px; font-weight: 600; color: var(--text-light); }
.image-slots { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
.image-slot { display: flex; flex-direction: column; gap: 8px; }
.slot-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; }
.slot-preview { width: 100%; aspect-ratio: 1; background: var(--bg-dark); border: 2px dashed var(--border); border-radius: var(--radius); overflow: hidden; display: flex; align-items: center; justify-content: center; transition: border-color .2s; }
.slot-preview:not(.empty) { border-style: solid; border-color: var(--border); }
.slot-img { width: 100%; height: 100%; object-fit: cover; }
.slot-icon { font-size: 28px; color: var(--text-dim); }
.slot-actions { display: flex; gap: 6px; }
.slot-btn { display: inline-flex; align-items: center; gap: 4px; padding: 6px 10px; border-radius: var(--radius); font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: all .2s; }
.slot-btn.upload { background: var(--primary-10); color: var(--primary); border: 1px solid var(--primary-20); flex: 1; justify-content: center; }
.slot-btn.upload:hover { background: var(--primary-20); }
.slot-btn.remove { background: rgba(244,67,54,.1); color: #f44336; border: 1px solid rgba(244,67,54,.2); }
.slot-btn.remove:hover { background: rgba(244,67,54,.2); }

.form-actions { display: flex; gap: 10px; padding-top: 4px; }
.btn { padding: 10px 20px; border-radius: var(--radius); font-weight: 600; font-size: 13px; cursor: pointer; border: none; transition: all .2s; }
.btn-primary { background: var(--primary); color: white; }
.btn-primary:hover:not(:disabled) { background: var(--primary-hover); }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.btn-secondary { background: var(--primary-10); color: var(--primary); border: 1px solid var(--primary-20); }
.btn-secondary:hover { background: var(--primary-20); }.optional { font-size: 11px; color: var(--text-muted); font-weight: 400; }</style>
