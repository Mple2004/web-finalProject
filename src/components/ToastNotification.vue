<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="toast.message.value" :class="['toast', isSuccess ? 'toast-success' : 'toast-info']">
        {{ toast.message.value }}
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useToast } from '../stores/toast'
const toast = useToast()
const isSuccess = computed(() => toast.message.value.startsWith('✓'))
</script>

<style scoped>
.toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 200;
  padding: 12px 20px; border-radius: var(--radius-lg);
  font-size: 14px; font-weight: 600;
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
}
.toast-success { background: rgba(6,78,59,0.8); color: #34d399; border: 1px solid rgba(52,211,153,0.3); }
.toast-info { background: rgba(120,53,15,0.6); color: #fcd34d; border: 1px solid rgba(252,211,77,0.2); }
</style>
