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

      <h4 class="auth-card-title mb-1">Create Account</h4>
      <p class="auth-card-sub mb-4">Join us today</p>

      <!-- Error -->
      <div v-if="error" class="auth-error-box mb-3">⚠️ {{ error }}</div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label class="field-label">Full Name</label>
          <input
            v-model="form.name"
            type="text"
            class="auth-input"
            placeholder="John Doe"
            required
            :disabled="loading"
          />
        </div>

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

        <div class="mb-3">
          <label class="field-label">Password</label>
          <input
            v-model="form.password"
            type="password"
            class="auth-input"
            placeholder="••••••••"
            minlength="6"
            required
            :disabled="loading"
          />
        </div>

        <div class="mb-4">
          <label class="field-label">Confirm Password</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            class="auth-input"
            :class="{ 'input-error': passwordMismatch }"
            placeholder="••••••••"
            required
            :disabled="loading"
          />
          <p v-if="passwordMismatch" class="field-error">Passwords do not match</p>
        </div>

        <button type="submit" class="auth-submit" :disabled="loading || passwordMismatch">
          <span v-if="loading" class="btn-spinner"></span>
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>

      <p class="text-center mt-4 mb-0 auth-card-sub" style="font-size:0.9rem;">
        Already have an account?
        <router-link to="/login" class="gold-link ms-1">Sign In</router-link>
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'
import { useToast } from '../stores/toast'

const router = useRouter()
const auth = useAuth()
const toast = useToast()

const form = reactive({ name: '', email: '', password: '', confirmPassword: '' })
const loading = ref(false)
const error = ref('')

const passwordMismatch = computed(
  () => form.confirmPassword.length > 0 && form.password !== form.confirmPassword
)

async function handleSubmit() {
  if (passwordMismatch.value) return
  error.value = ''
  loading.value = true
  const result = await auth.register(form.name, form.email, form.password)
  loading.value = false

  if (result.success) {
    toast.show('Account created! Welcome aboard 🎉')
    router.push('/')
  } else {
    error.value = result.message
  }
}
</script>
