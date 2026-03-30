import { ref } from 'vue'

const visible = ref(false) 

export function useLoginModal() {
  const show = () => { 
    visible.value = true 
  }
  const hide = () => { 
    visible.value = false 
  }

  // ✅ เพิ่ม reset function
  const reset = () => {
    visible.value = false
  }

  return { visible, show, hide, reset }
}