<template>
  <div class="app-container">
    <template v-if="!isAdminRoute">
      <NavBar />
      <RouterView />
      <CartSidebar />
      <LoginModal />
    </template>
    <RouterView v-else />
    <ToastNotification />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from './stores/auth'
import { RouterView } from 'vue-router'
import NavBar            from './components/NavBar.vue'
import CartSidebar       from './components/CartSidebar.vue'
import ToastNotification from './components/ToastNotification.vue'
import LoginModal        from './components/LoginModal.vue'

const auth = useAuth()
const route = useRoute()

const isAdminRoute = computed(() => route.path.startsWith('/admin'))

onMounted(async () => {
  await auth.restoreSession()
})
</script>

<style>
.app-container {
  background-color: var(--bg-dark);
  min-height: 100vh;
}
</style>
