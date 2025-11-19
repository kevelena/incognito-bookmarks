import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLockStore = defineStore('lock', () => {
  const isLock = ref(true)

  function setLock(lock: boolean) {
    isLock.value = lock
  }
  return { isLock, setLock }
})
