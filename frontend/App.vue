<template>
  <div class="app-container">
    <NavBar />
    <RouterView />
    <CartSidebar />
    <ToastNotification />
    <LoginModal />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuth } from './stores/auth'
import { RouterView } from 'vue-router'
import NavBar           from './components/NavBar.vue'
import CartSidebar      from './components/CartSidebar.vue'
import ToastNotification from './components/ToastNotification.vue'
import LoginModal       from './components/LoginModal.vue'

const auth = useAuth()

onMounted(async () => {
  await auth.restoreSession() // ดึงข้อมูล User จาก Cookie (httpOnly) มาใส่ Store
})

</script>

<style>
.app-container {
  background-color: var(--bg-dark);
  min-height: 100vh;
}
</style>
