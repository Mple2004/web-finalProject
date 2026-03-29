<template>
  <div class="products-management">
    <div class="page-header">
      <div>
        <h1>Product Management</h1>
        <p class="text-muted">Add, edit, or remove products from your catalog</p>
      </div>
      <button class="btn-add" @click="showForm = !showForm">
        <span class="material-symbols-outlined">add</span>
        Add Product
      </button>
    </div>

    <!-- Add/Edit Form Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="resetForm">
      <div class="modal-content form-card">
        <div class="modal-header">
          <h2>{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h2>
          <button type="button" class="modal-close" @click="resetForm">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <form @submit.prevent="saveProduct" class="product-form">
        <div class="form-row">
          <div class="form-group">
            <label>Product Name *</label>
            <input v-model="formData.pdName" type="text" required>
          </div>
          <div class="form-group">
            <label>Category *</label>
            <input v-model="formData.pdCategory" type="text" required>
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

        <div class="form-row">
          <div class="form-group">
            <label>Product Image</label>
            <div class="image-upload">
              <input 
                id="product-image"
                type="file" 
                ref="imageInput"
                @change="handleImageUpload" 
                accept="image/*"
                class="image-input"
              >
              <label for="product-image" class="image-upload-label">
                <span class="material-symbols-outlined">image</span>
                <span>Choose Image</span>
              </label>
            </div>
            <div v-if="formData.image" class="image-preview">
              <img :src="formData.image" :alt="formData.pdName || 'Product'">
              <button type="button" class="remove-image" @click="removeImage" title="Remove image">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            {{ editingProduct ? 'Update Product' : 'Create Product' }}
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
        placeholder="Search products..."
        class="search-input"
      >
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
      <div class="table-container">
        <table class="products-table">
          <thead>
            <tr>
              <th>Image</th>
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
              <td class="image-cell">
                <div v-if="product.image" class="product-thumbnail">
                  <img :src="product.image" :alt="product.pdName">
                </div>
                <div v-else class="product-thumbnail empty">
                  <span class="material-symbols-outlined">inventory_2</span>
                </div>
              </td>
              <td class="product-name">{{ product.pdName }}</td>
              <td>{{ product.pdCategory }}</td>
              <td>{{ product.pdBrand }}</td>
              <td>{{ product.pdSize }}ml</td>
              <td class="price">฿{{ product.pdPrice.toLocaleString() }}</td>
              <td class="stock" :class="{ 'low-stock': product.stock_qty < 20 }">
                {{ product.stock_qty }}
              </td>
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

      <div v-if="filteredProducts.length === 0" class="empty-state">
        <span class="material-symbols-outlined">inventory_2</span>
        <p>No products found</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { MOCK_PRODUCTS } from '../../data/mockData'
import { useToast } from '../../stores/toast'

const toast = useToast()
const products = ref([...MOCK_PRODUCTS])
const showForm = ref(false)
const searchQuery = ref('')
const filterCategory = ref('')
const editingProduct = ref(null)
const imageInput = ref(null)

const formData = ref({
  pdName: '',
  pdCategory: '',
  pdBrand: '',
  pdCountry: '',
  pdSize: '',
  pdPrice: '',
  stock_qty: '',
  image: ''
})

// Filter products
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchSearch = !searchQuery.value || 
      product.pdName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      product.pdBrand.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchCategory = !filterCategory.value || product.pdCategory === filterCategory.value
    return matchSearch && matchCategory
  })
})

// Reset form
function resetForm() {
  showForm.value = false
  editingProduct.value = null
  formData.value = {
    pdName: '',
    pdCategory: '',
    pdBrand: '',
    pdCountry: '',
    pdSize: '',
    pdPrice: '',
    stock_qty: '',
    image: ''
  }
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

// Edit product
function editProduct(product) {
  editingProduct.value = product
  formData.value = { ...product }
  showForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Save product
function saveProduct() {
  if (editingProduct.value) {
    // Update existing product
    const index = products.value.findIndex(p => p.pdID === editingProduct.value.pdID)
    if (index !== -1) {
      products.value[index] = { 
        ...editingProduct.value, 
        ...formData.value 
      }
      toast.show('✓ Product updated successfully')
    }
  } else {
    // Add new product
    const newProduct = {
      pdID: Math.max(...products.value.map(p => p.pdID)) + 1,
      ...formData.value,
      image: 'https://via.placeholder.com/300?text=' + formData.value.pdName
    }
    products.value.push(newProduct)
    toast.show('✓ Product added successfully')
  }
  resetForm()
}

// Delete product
function deleteProduct(pdID) {
  if (confirm('Are you sure you want to delete this product?')) {
    products.value = products.value.filter(p => p.pdID !== pdID)
    toast.show('✓ Product deleted successfully')
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
.products-management {
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

.product-form {
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

.form-group input {
  padding: 10px 12px;
  background: var(--bg-dark);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-white);
  font-size: 13px;
}

.form-group input:focus {
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

.products-table {
  width: 100%;
  border-collapse: collapse;
}

.products-table thead {
  background: var(--primary-05);
  border-bottom: 2px solid var(--border);
}

.products-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.products-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  color: var(--text-light);
}

.products-table tbody tr:hover {
  background: var(--primary-05);
}

.image-cell {
  text-align: center;
  width: 60px;
  padding: 14px 4px !important;
}

.product-thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-10);
  border: 1px solid var(--border);
}

.product-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-thumbnail.empty {
  background: var(--primary-10);
  color: var(--primary);
}

.product-thumbnail.empty .material-symbols-outlined {
  font-size: 18px;
}

.product-name {
  font-weight: 700;
  color: var(--text-white);
}

.price {
  font-weight: 700;
  color: var(--accent-gold);
}

.stock {
  font-weight: 600;
}

.stock.low-stock {
  color: #f44336;
}

.actions {
  display: flex;
  gap: 8px;
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
