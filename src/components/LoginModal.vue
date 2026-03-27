<template>
  <Transition name="modal">
    <div v-if="modal.visible.value" class="modal-overlay" @click.self="modal.hide()">
      <div class="auth-card modal-card" role="dialog" aria-modal="true">

        <!-- Close button -->
        <button class="modal-close" @click="modal.hide()" aria-label="Close">
          <span class="material-symbols-outlined">close</span>
        </button>

        <!-- Logo -->
        <div class="text-center mb-4">
          <router-link to="/" class="auth-brand" @click="modal.hide()">
            🍷 SPIRIT <span class="gold">&</span> VINE
          </router-link>
          <p class="auth-subtitle mt-2 mb-0">Sign in to continue shopping</p>
        </div>

        <h4 class="auth-card-title mb-1">Sign In</h4>
        <p class="auth-card-sub mb-4">Login to add items to your cart</p>

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
          <router-link to="/register" class="gold-link ms-1" @click="modal.hide()">Register</router-link>
        </p>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../stores/auth'
import { useToast } from '../stores/toast'
import { useLoginModal } from '../stores/loginModal'

const modal = useLoginModal()
const auth = useAuth()
const toast = useToast()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  loading.value = true
  const result = auth.login(form.email, form.password)
  loading.value = false

  if (result.success) {
    toast.show('Login successful 🎉')
    form.email = ''
    form.password = ''
    modal.hide()
  } else {
    error.value = result.message
  }
}

function onKeydown(e) {
  if (e.key === 'Escape') modal.hide()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
}

.modal-card {
  position: relative;
  width: 100%;
  max-width: 420px;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.2s;
  z-index: 1;
  background: none;
  border: none;
  padding: 0;
}
.modal-close:hover { color: var(--text-white); }
.modal-close .material-symbols-outlined { font-size: 20px; }

/* Modal transition */
.modal-enter-active,
.modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }
.modal-enter-active .modal-card,
.modal-leave-active .modal-card { transition: transform 0.2s ease; }
.modal-enter-from .modal-card,
.modal-leave-to .modal-card { transform: scale(0.95); }
</style>
