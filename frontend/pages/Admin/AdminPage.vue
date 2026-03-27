<template>
  <div class="admin-wrap">
    <h1 class="text-white">Admin Dashboard</h1>
    <p style="color: var(--text-muted);">Welcome, {{ auth.user.value?.name }}</p>
  </div>
</template>

<script setup>
import { useAuth } from '../../stores/auth'
const auth = useAuth()
</script>

<style scoped>
.admin-wrap {
  min-height: 100vh;
  background: var(--bg-dark);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
