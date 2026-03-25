<!-- template → ส่วนที่แสดงผล HTML -->
<template>
  <div style="background:#1a1108; min-height:100vh;">
    <!--background:#1a1108 → สีพื้นหลังน้ำตาลเข้มทั้งหน้า-->
    <!--min-height:100vh → ให้พื้นหลังสีเข้มเต็มหน้าจอ-->

    <NavBar />
    <HeroSection />
    <FeaturedSection />
    <!-- เรียกใช้ component ทั้ง 3 ตัว เรียงจากบนลงล่าง -->
  </div>
</template>

<script setup>
// <script setup> → ส่วน JavaScript 
// import component ทั้ง 3 ตัวเข้ามาใช้
import NavBar from './components/NavBar.vue'
import HeroSection from './components/HeroSec.vue'
import FeaturedSection from './components/mainProduct.vue'
</script>

<!-- Test Git  -->