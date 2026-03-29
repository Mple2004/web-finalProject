<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modal.visible.value" class="modal-overlay" @click.self="modal.hide()">
        <div class="modal-box">
          <button class="modal-close" @click="modal.hide()">
            <span class="material-symbols-outlined">close</span>
          </button>
          <div class="modal-icon">
            <span class="material-symbols-outlined">lock</span>
          </div>
          <h2 class="modal-title">Login Required</h2>
          <p class="modal-desc">You need to be logged in to add items to your cart.</p>
          <div class="modal-actions">
            <button class="btn-login" @click="goLogin">
              <span class="material-symbols-outlined">login</span>
              Sign In
            </button>
            <button class="btn-cancel" @click="modal.hide()">Cancel</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useLoginModal } from '../stores/loginModal'

const modal = useLoginModal()
const router = useRouter()

function goLogin() {
  modal.hide()
  router.push('/login')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0, 0, 0, 0.65);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  backdrop-filter: blur(4px);
}
.modal-box {
  position: relative;
  background: var(--bg-dark);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 40px 32px 32px;
  width: 100%; max-width: 400px;
  text-align: center;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
}
.modal-close {
  position: absolute; top: 16px; right: 16px;
  color: var(--text-muted); transition: color 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.modal-close:hover { color: var(--text-light); }
.modal-close .material-symbols-outlined { font-size: 22px; }

.modal-icon {
  width: 64px; height: 64px; border-radius: 50%;
  background: var(--primary-10);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px;
}
.modal-icon .material-symbols-outlined { font-size: 32px; color: var(--primary); }

.modal-title { font-size: 22px; font-weight: 800; margin-bottom: 10px; }
.modal-desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 28px; }

.modal-actions { display: flex; flex-direction: column; gap: 10px; }
.btn-login {
  width: 100%; padding: 13px;
  background: var(--primary); color: white;
  border-radius: var(--radius); font-weight: 700; font-size: 15px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: var(--shadow-primary); transition: background 0.2s;
}
.btn-login:hover { background: var(--primary-hover); }
.btn-login .material-symbols-outlined { font-size: 20px; }
.btn-cancel {
  width: 100%; padding: 12px;
  border: 1px solid var(--border); color: var(--text-muted);
  border-radius: var(--radius); font-size: 14px; font-weight: 600;
  transition: all 0.2s;
}
.btn-cancel:hover { border-color: var(--primary); color: var(--text-light); }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-box,
.modal-fade-leave-active .modal-box { transition: transform 0.2s ease; }
.modal-fade-enter-from .modal-box,
.modal-fade-leave-to .modal-box { transform: scale(0.95) translateY(8px); }
</style>