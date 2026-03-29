<template>
  <div class="auth-wrap">
    <div class="auth-card">

      <!-- Logo -->
      <div class="text-center mb-4">
        <router-link to="/" class="auth-brand">
          🍷 SPIRIT <span class="gold">&</span> VINE
        </router-link>
        <p class="auth-subtitle mt-2 mb-0">Premium Spirits &amp; Fine Wines</p>
      </div>

      <h4 class="auth-card-title mb-1">Sign In</h4>
      <p class="auth-card-sub mb-4">Welcome back</p>

      <!-- Error -->
      <div v-if="error" class="auth-error-box mb-3">⚠️ {{ error }}</div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label class="field-label">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="auth-input"
            placeholder="your@email.com"
            required
            :disabled="loading"
          />
        </div>

        <div class="mb-4">
          <label class="field-label">Password</label>
          <input
            v-model="form.password"
            type="password"
            class="auth-input"
            placeholder="••••••••"
            required
            :disabled="loading"
          />
        </div>

        <button type="submit" class="auth-submit" :disabled="loading">
          <span v-if="loading" class="btn-spinner"></span>
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="text-center mt-4 mb-0 auth-card-sub" style="font-size:0.9rem;">
        Don't have an account?
        <router-link to="/register" class="gold-link ms-1">Register</router-link>
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'
import { useToast } from '../stores/toast'

const router = useRouter()
const auth = useAuth()
const toast = useToast()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  loading.value = true
  console.log('Submitting...', form.email)
  const result = await auth.login(form.email, form.password)
  loading.value = false

  if (result.success) {
    toast.show('Login successful 🎉')
    // ✅ เปลี่ยน .role → .status และ path ให้ตรงกับ router
    router.push(auth.user?.value?.status === 'admin' ? '/admin/dashboard' : '/')
  } else {
    error.value = result.message
  }
}
</script>
