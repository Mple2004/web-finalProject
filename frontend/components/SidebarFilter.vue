<template>
  <aside class="sidebar">

    <!-- Categories -->
    <div class="filter-group">
      <h3 class="filter-title">Categories</h3>
      <ul class="cat-list">

        <!-- All Products -->
        <li>
          <a :class="['cat-item', { active: !mainCategory && modelSubcategory === '' }]"
             @click.prevent="$emit('select-main-category', '')">
            <span>All Products</span>
            <span class="cat-count">{{ totalCount }}</span>
          </a>
        </li>

        <!-- ✅ แสดงทุก category หลักตลอดเวลา -->
        <li v-for="cat in mainCategories" :key="cat.name">

          <!-- Category หลัก — คลิกเพื่อกรอง -->
          <a :class="['cat-item main-cat', { active: mainCategory === cat.name && modelSubcategory === '' }]"
             @click.prevent="selectCategory(cat.name)">
            <span class="cat-label">
              <span class="material-symbols-outlined arrow-toggle">
                {{ mainCategory === cat.name ? 'keyboard_arrow_down' : 'keyboard_arrow_right' }}
              </span>
              {{ cat.name }}
            </span>
            <span class="cat-count">{{ cat.count }}</span>
          </a>

          <!-- Subcategories — แสดงเฉพาะ category ที่ active -->
          <transition name="slide">
            <ul v-if="mainCategory === cat.name" class="sub-cat-list">
              <li v-for="sub in subcategories" :key="sub.name">
                <a :class="['cat-item sub-item', { active: modelSubcategory === sub.name }]"
                   @click.prevent="$emit('update:modelSubcategory', sub.name)">
                  <span class="cat-label">
                    <span v-if="modelSubcategory === sub.name"
                          class="material-symbols-outlined arrow">chevron_right</span>
                    {{ sub.name }}
                  </span>
                  <span class="cat-count">{{ sub.count }}</span>
                </a>
              </li>
            </ul>
          </transition>

        </li>
      </ul>
    </div>

    <!-- Price Range -->
    <div class="filter-group">
      <h3 class="filter-title">Price Range</h3>
      <input type="range" min="0" max="99999" step="50"
             :value="modelMaxPrice"
             @input="$emit('update:modelMaxPrice', Number($event.target.value))" />
      <div class="range-labels">
        <span>฿0</span>
        <span>฿{{ modelMaxPrice.toLocaleString() }}+</span>
      </div>
      <div class="price-inputs">
        <div class="price-input-group">
          <label>Min Price</label>
          <input type="number" min="0" max="99999" step="10"
                 :value="modelMinPrice"
                 @input="$emit('update:modelMinPrice', Number($event.target.value))" />
        </div>
        <div class="price-input-group">
          <label>Max Price</label>
          <input type="number" min="0" max="99999" step="10"
                 :value="modelMaxPrice"
                 @input="$emit('update:modelMaxPrice', Number($event.target.value))" />
        </div>
      </div>
    </div>

    <!-- Region -->
    <div class="filter-group">
      <h3 class="filter-title">Region</h3>
      <label v-for="r in regions" :key="r" class="checkbox-label">
        <input type="checkbox" :value="r"
               :checked="modelRegions.includes(r)"
               @change="toggleRegion(r)" />
        <span>{{ r }}</span>
      </label>
      <p v-if="!regions?.length" class="no-regions">No regions available</p>
    </div>

  </aside>
</template>

<script setup>
const props = defineProps({
  subcategories: Array,
  mainCategories: { type: Array, default: () => [] },
  regions: { type: Array, default: () => [] },
  totalCount: { type: Number, default: 0 },
  mainCategory: { type: String, default: '' },
  modelSubcategory: { type: String, default: '' },
  modelMinPrice: { type: Number, default: 0 },
  modelMaxPrice: { type: Number, default: 99999 },
  modelRegions: { type: Array, default: () => [] },
})

const emit = defineEmits([
  'update:modelSubcategory',
  'update:modelMinPrice',
  'update:modelMaxPrice',
  'update:modelRegions',
  'select-main-category',
])

// ✅ คลิก category หลัก → navigate + reset subcategory
function selectCategory(name) {
  emit('update:modelSubcategory', '')
  emit('select-main-category', name)
}

function toggleRegion(r) {
  const cur = [...props.modelRegions]
  const i = cur.indexOf(r)
  if (i >= 0) cur.splice(i, 1); else cur.push(r)
  emit('update:modelRegions', cur)
}
</script>

<style scoped>
.sidebar { width: 240px; flex-shrink: 0; }
.filter-group { margin-bottom: 32px; }
.filter-title {
  font-size: 12px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.15em; color: var(--primary); margin-bottom: 16px;
}
.cat-list { display: flex; flex-direction: column; gap: 8px; }
.cat-item {
  display: flex; justify-content: space-between; align-items: center;
  cursor: pointer; font-size: 14px; font-weight: 500;
  color: var(--text-light); transition: color 0.2s; padding: 4px 0;
}
.cat-item:hover, .cat-item.active { color: var(--primary); font-weight: 700; }
.cat-label { display: flex; align-items: center; gap: 4px; }
.arrow { font-size: 14px; }
.arrow-toggle { font-size: 18px; transition: transform 0.2s; }
.cat-count { font-size: 12px; color: var(--text-muted); }
.cat-item.active .cat-count { color: var(--primary); }

.sub-cat-list {
  margin-left: 24px; margin-top: 6px; margin-bottom: 4px;
  display: flex; flex-direction: column; gap: 6px;
  border-left: 1px solid var(--border);
  padding-left: 12px;
}
.sub-item { font-size: 13px; opacity: 0.9; }

.range-labels { display: flex; justify-content: space-between; font-size: 14px; font-weight: 500; margin-top: 12px; }
.price-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
.price-input-group { display: flex; flex-direction: column; gap: 6px; }
.price-input-group label { font-size: 12px; font-weight: 600; color: var(--text-light); }
.price-input-group input {
  padding: 8px 12px; background: var(--bg-dark); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-light); font-size: 13px; outline: none;
}
.price-input-group input:focus { border-color: var(--primary); }
.checkbox-label {
  display: flex; align-items: center; gap: 12px;
  cursor: pointer; font-size: 14px; margin-bottom: 10px;
  color: var(--text-light);
}
.no-regions { font-size: 13px; color: var(--text-muted); }

.filter-group { animation: fadeUp 0.4s ease both; }
.filter-group:nth-child(1) { animation-delay: 0.05s; }
.filter-group:nth-child(2) { animation-delay: 0.15s; }
.filter-group:nth-child(3) { animation-delay: 0.25s; }

.slide-enter-active, .slide-leave-active {
  transition: all 0.25s ease;
  max-height: 500px;
  overflow: hidden;
}
.slide-enter-from, .slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>