<template>
  <div class="card" :style="{ animationDelay: `${delay}ms` }">
    <div class="card-image" @click="$router.push(`/product/${product.id}`)">
      <div v-if="product.tag" :class="['tag', `tag-${product.tag}`]">{{ product.tag }}</div>
      <button class="wishlist-btn" @click.stop="$emit('toggle-wishlist', product.id)">
        <span class="material-symbols-outlined" :class="{ 'fill-icon': isWishlisted }">favorite</span>
      </button>
      <img :src="product.image" :alt="product.name" class="product-img" />
    </div>
    <div class="card-body">
      <p class="region">{{ product.region }}</p>
      <h3 class="name line-clamp-1" @click="$router.push(`/product/${product.id}`)">{{ product.name }}</h3>
      <p class="desc line-clamp-2">{{ product.description }}</p>
      <div class="price-row">
        <div>
          <p class="price">${{ product.price.toFixed(2) }}</p>
          <p v-if="product.oldPrice" class="old-price">${{ product.oldPrice.toFixed(2) }}</p>
          <p class="meta">{{ product.volume }} | {{ product.abv }}</p>
        </div>
        <button class="cart-btn" @click="$emit('add-to-cart', product)">
          <span class="material-symbols-outlined">add_shopping_cart</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  product: { type: Object, required: true },
  delay: { type: Number, default: 0 },
  isWishlisted: { type: Boolean, default: false },
})
defineEmits(['add-to-cart', 'toggle-wishlist'])
</script>

<style scoped>
.card {
  display: flex; flex-direction: column;
  background: var(--primary-05); border-radius: var(--radius-xl);
  border: 1px solid transparent; padding: 16px;
  transition: all 0.3s ease;
  animation: fadeUp 0.4s ease both;
}
.card:hover { border-color: var(--primary-20); }
.card-image {
  position: relative; aspect-ratio: 3/4;
  border-radius: var(--radius); overflow: hidden;
  background: var(--primary-10); margin-bottom: 16px; cursor: pointer;
}
.product-img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.5s ease;
}
.card:hover .product-img { transform: scale(1.05); }
.tag {
  position: absolute; top: 12px; left: 12px; z-index: 2;
  padding: 4px 10px; border-radius: var(--radius-full);
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.1em; color: white;
}
.wishlist-btn {
  position: absolute; top: 12px; right: 12px; z-index: 2;
  color: var(--text-muted); transition: color 0.2s;
}
.wishlist-btn:hover, .wishlist-btn .fill-icon { color: var(--primary); }
.card-body { flex: 1; display: flex; flex-direction: column; }
.region {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: -0.01em; color: var(--primary); margin-bottom: 4px;
}
.name {
  font-size: 18px; font-weight: 700; margin-bottom: 4px;
  transition: color 0.2s; cursor: pointer;
}
.card:hover .name { color: var(--primary); }
.desc { font-size: 14px; color: var(--text-muted); margin-bottom: 16px; flex: 1; }
.price-row {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 16px; border-top: 1px solid var(--border); margin-top: auto;
}
.price { font-size: 24px; font-weight: 700; color: var(--primary); }
.old-price { font-size: 12px; color: var(--text-muted); text-decoration: line-through; }
.meta { font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-top: 2px; }
.cart-btn {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--primary); color: white;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.2s; box-shadow: var(--shadow-primary);
}
.cart-btn:hover { transform: scale(1.1); }
.cart-btn .material-symbols-outlined { font-size: 20px; }
</style>
