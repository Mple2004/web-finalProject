import { ref } from 'vue'

const message = ref('')
let timer = null

export function useToast() {
  function show(msg, duration = 2200) {
    message.value = msg
    clearTimeout(timer)
    timer = setTimeout(() => {
      message.value = ''
    }, duration)
  }

  return { message, show }
}
