<template>
  <section style="background:#1a1108; padding:60px 48px;">

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-end mb-4" style="border-left:3px solid #c0392b; padding-left:16px;">
      <div>
        <h2 class="fw-bold text-white mb-1" style="font-size:1.3rem; letter-spacing:1px;">FEATURED SELECTIONS</h2>
        <p style="color:#a89880; font-size:0.9rem; margin:0;">Hand-picked premium choices from our sommeliers.</p>
      </div>
      <a href="#" style="color:#c9a84c; text-decoration:none; font-size:0.9rem;">View All →</a>
    </div>

    <!-- Product Cards -->
    <div class="row g-4">
      <div class="col-md-3" v-for="product in products" :key="product.name">
        <div class="card h-100 border-0" style="background:#221a0e; border-radius:12px; overflow:hidden;">
          
          <!-- Image Area -->
          <div class="position-relative d-flex align-items-center justify-content-center p-3" 
               :style="{ background: product.bg, height: '220px' }">
            <span v-if="product.limited" 
                  class="position-absolute top-0 start-0 m-2 badge" 
                  style="background:#c9a84c; color:#111; font-size:0.65rem;">
              LIMITED
            </span>
            <span class="position-absolute top-0 end-0 m-2" style="color:#a89880; cursor:pointer;">♡</span>
            <img :src="product.img" :alt="product.name" style="height:180px; object-fit:contain;" />
          </div>

          <!-- Info -->
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-white fw-semibold" style="font-size:0.95rem;">{{ product.name }}</span>
              <span class="fw-bold" style="color:#c0392b;">${{ product.price }}</span>
            </div>
            <p style="color:#a89880; font-size:0.8rem; margin-bottom:8px;">{{ product.meta }}</p>
            <div style="color:#c9a84c; font-size:0.85rem;">
              {{ '★'.repeat(product.stars) }}{{ '☆'.repeat(5 - product.stars) }}
            </div>
          </div>

        </div>
      </div>
    </div>

  </section>
</template>

<script setup>
const products = [
  {
    name: 'Vintage Merlot 2018',
    price: '54.99',
    meta: '750ml | Bordeaux Region',
    stars: 4,
    bg: '#1a0f08',
    img: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=300'
  },
  {
    name: 'Single Malt Scotch',
    price: '120.00',
    meta: '700ml | 18 Year Aged',
    stars: 5,
    limited: true,
    bg: '#0f1a12',
    img: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=300'
  },
  {
    name: 'Craft Amber Ale',
    price: '6.50',
    meta: '330ml | Artisanal Brew',
    stars: 4,
    bg: '#1a1408',
    img: 'https://images.unsplash.com/photo-1612528443702-f6741f70a049?w=300'
  },
  {
    name: 'London Dry Gin',
    price: '45.00',
    meta: '750ml | Botanical Infused',
    stars: 5,
    bg: '#e8dfc8',
    img: 'https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=300'
  },
]
</script>