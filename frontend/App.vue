<template>
  <div class="app-container">
    <!-- ซ่อน NavBar ในหน้า admin เพราะ AdminLayout มี header ของตัวเอง -->
    <NavBar v-if="!isAdminRoute" />
    <RouterView />
    <CartSidebar v-if="!isAdminRoute" />
    <ToastNotification />
    <LoginModal />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import NavBar            from './components/NavBar.vue'
import CartSidebar       from './components/CartSidebar.vue'
import ToastNotification from './components/ToastNotification.vue'
import LoginModal        from './components/LoginModal.vue'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
</script>

<style>
.app-container {
  background-color: var(--bg-dark);
  min-height: 100vh;
}
</style>