<template>
  <!-- ======================== HERO ======================== -->
  <section class="hero">
    <div class="hero-bg" :style="{ backgroundImage: `linear-gradient(to right, rgba(26,11,13,0.95) 20%, rgba(26,11,13,0.4) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBUKg4EQS06RIJFCIAz2jqnSRm0HsFOXmEFED21tSb0KknFSx2JUhzH-iMjWbpHsR6QqssF6PH0l8vVcR1CZZQRI4WdzFJrnXI4l5Pa7DxEJ782gp8QWohMifr4KjByBp_EkWNBfMvkcotXmzl6TZYv7c4RkN1ryO-6RlACN3MG9cVqi6fy-xsNBwVg5NsXZfIt5BGPbmIITVZopevisoteY6bjXG3YSE94lB61rbDnDKinqWTk1wVUBhD8dMWAP6GN2l5ZKCVpoa4')` }" />
    <div class="hero-inner">
      <div class="hero-text">
        <span class="hero-badge">New arrivals coming soon!</span>
        <h1 class="hero-title">
          Exquisite Spirits for <span class="gold">Connoisseurs</span>
        </h1>
        <p class="hero-desc">
          Discover our curated collection of rare vintage wines,
          artisanal craft beers, and premium world-class spirits.
        </p>
        <div class="hero-btns">
          <button class="btn-glass" @click="navigateToSpecials">View Specials</button>
        </div>
      </div>

      <div class="hero-bottle">
        <!-- แก้: ใช้รูปจากสินค้าแรกใน DB แทน mockData -->
        <img :src="bottleImage" alt="Premium Spirit" class="bottle-img" />
        <div class="bottle-glow" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'   // ✅ ใช้ api แทน fetch ตรงๆ

const router = useRouter()
const bottleImage = ref('https://placehold.co/400x600/1a0b0d/c9a84c?text=Loading...')

onMounted(async () => {
  try {
    const data = await api.getThreeProducts()
    const raw = Array.isArray(data) ? data : (data.data ?? [])
    if (raw.length > 0 && raw[0].pdImage) {
      bottleImage.value = raw[0].pdImage
    } else {
      bottleImage.value = 'https://placehold.co/400x600/1a0b0d/c9a84c?text=Premium+Spirit'
    }
  } catch (err) {
    console.error('HeroSec: failed to load bottle image', err.message)
    bottleImage.value = 'https://placehold.co/400x600/1a0b0d/c9a84c?text=Premium+Spirit'
  }
})

const navigateToSpecials = () => {
  router.push('/category?sort=bestseller')
}
</script>

<style scoped>
.hero {
  position: relative;
  height: 600px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: -10px;
  background-size: cover;
  background-position: center;
  filter: blur(5px);
}

.hero-inner {
  position: relative;
  z-index: 2;
  height: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 80px;
  display: flex;
  align-items: center;
}

.hero-text {
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-badge {
  display: inline-block;
  align-self: flex-start;
  padding: 6px 16px;
  border-radius: 9999px;
  background: rgba(212, 17, 50, 0.2);
  border: 1px solid rgba(212, 17, 50, 0.3);
  color: var(--primary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.hero-title {
  font-size: clamp(40px, 6vw, 72px);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: white;
  margin: 0;
}

.gold { color: #c9a84c; }

.hero-desc {
  font-size: 18px;
  color: var(--text-light);
  line-height: 1.6;
  max-width: 480px;
  margin: 0;
}

.hero-btns {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.btn-glass {
  padding: 14px 32px;
  background: var(--primary);
  color: white;
  border-radius: var(--radius);
  font-weight: 700;
  font-size: 15px;
  transition: background 0.2s;
}
.btn-glass:hover { background: var(--primary-hover); }

.hero-bottle {
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 100%;
}

.bottle-img {
  height: 520px;
  width: auto;
  object-fit: contain;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 32px 48px rgba(0,0,0,0.6));
  animation: floatBottle 4s ease-in-out infinite;
}

.bottle-glow {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  height: 40px;
  background: radial-gradient(ellipse, rgba(197,160,89,0.35) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(12px);
  z-index: 1;
}

@keyframes floatBottle {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-12px); }
}

@media (max-width: 1024px) {
  .hero { height: 500px; }
  .hero-inner { padding: 0 40px; }
}

@media (max-width: 768px) {
  .hero-bottle { display: none; }
  .hero { height: 450px; }
  .hero-inner { padding: 0 20px; }
  .hero-title { font-size: clamp(28px, 5vw, 48px); }
  .hero-desc { font-size: 15px; }
  .hero-btns { flex-wrap: wrap; }
  .btn-glass { padding: 14px 24px; font-size: 14px; }
}

.hero-badge { animation: fadeUp 0.5s ease 0.1s both; }
.hero-title  { animation: fadeUp 0.6s ease 0.25s both; }
.hero-desc   { animation: fadeUp 0.5s ease 0.4s both; }
</style>