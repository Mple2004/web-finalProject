<template>
  <aside class="sidebar">
    <div class="filter-group">
      <h3 class="filter-title">Categories</h3>
      <ul class="cat-list">
        <li>
          <a :class="['cat-item', { active: modelSubcategory === '' }]"
             @click.prevent="$emit('update:modelSubcategory', '')">
            <span>All Spirits</span>
            <span class="cat-count">{{ totalCount }}</span>
          </a>
        </li>
        <li v-for="sub in subcategories" :key="sub.name">
          <a :class="['cat-item', { active: modelSubcategory === sub.name }]"
             @click.prevent="$emit('update:modelSubcategory', sub.name)">
            <span class="cat-label">
              <span v-if="modelSubcategory === sub.name" class="material-symbols-outlined arrow">chevron_right</span>
              {{ sub.name }}
            </span>
            <span class="cat-count">{{ sub.count }}</span>
          </a>
        </li>
      </ul>
    </div>
    <div class="filter-group">
      <h3 class="filter-title">Price Range</h3>
      <input type="range" min="0" max="2500" step="50"
             :value="modelMaxPrice"
             @input="$emit('update:modelMaxPrice', Number($event.target.value))" />
      <div class="range-labels">
        <span>$0</span>
        <span>${{ modelMaxPrice.toLocaleString() }}+</span>
      </div>
      <div class="price-inputs">
        <div class="price-input-group">
          <label>Min Price</label>
          <input type="number" min="0" max="2500" step="10"
                 :value="modelMinPrice"
                 @input="$emit('update:modelMinPrice', Number($event.target.value))" />
        </div>
        <div class="price-input-group">
          <label>Max Price</label>
          <input type="number" min="0" max="2500" step="10"
                 :value="modelMaxPrice"
                 @input="$emit('update:modelMaxPrice', Number($event.target.value))" />
        </div>
      </div>
    </div>
    <div class="filter-group">
      <h3 class="filter-title">Region</h3>
      <label v-for="r in regions" :key="r" class="checkbox-label">
        <input type="checkbox" :value="r"
               :checked="modelRegions.includes(r)"
               @change="toggleRegion(r)" />
        <span>{{ r }}</span>
      </label>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  subcategories: Array,
  regions: Array,
  totalCount: { type: Number, default: 0 },
  modelSubcategory: { type: String, default: '' },
  modelMinPrice: { type: Number, default: 0 },
  modelMaxPrice: { type: Number, default: 2500 },
  modelRegions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelSubcategory', 'update:modelMinPrice', 'update:modelMaxPrice', 'update:modelRegions'])

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
.cat-list { display: flex; flex-direction: column; gap: 12px; }
.cat-item {
  display: flex; justify-content: space-between; align-items: center;
  cursor: pointer; font-size: 14px; font-weight: 500;
  color: var(--text-light); transition: color 0.2s;
}
.cat-item:hover, .cat-item.active { color: var(--primary); font-weight: 700; }
.cat-label { display: flex; align-items: center; gap: 2px; }
.arrow { font-size: 14px; }
.cat-count { font-size: 12px; color: var(--text-muted); }
.cat-item.active .cat-count { color: var(--primary); }
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
</style>
