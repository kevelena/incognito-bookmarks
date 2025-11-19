<script lang="ts" setup>
import BookMarkService from '@/service/BookMarkService'
import { useLockStore } from '@/stores/lock'
import appConfig from '@/config/app'
const pwd = ref('')
const showError = ref(false)

useLockStore().setLock(true)

// 是否过期
chrome.storage.session.get('unLockDate').then(({ unLockDate }) => {
  if (!unLockDate || Date.now() - (unLockDate as number) > appConfig.authDuration) {
    useLockStore().setLock(true)
    return
  }
  useLockStore().setLock(false)
})

async function checkPwd() {
  // 获取密码
  const settings = await BookMarkService.getSetting()
  if (pwd.value === settings.pwd) {
    // 解锁
    useLockStore().setLock(false)
    // 缓存解锁
    chrome.storage.session.set({ unLockDate: Date.now() })
  } else {
    // 错误提示
    showError.value = true
  }
}
</script>
<template>
  <div class="lock">
    <!-- 锁屏 -->
    <div class="form-box">
      <el-input
        v-model="pwd"
        autofocus
        @keyup.enter.prevent="checkPwd"
        placeholder="请输入密码"
        type="password"
      ></el-input>
      <el-button @click="checkPwd" style="margin-left: 8px" type="primary">确认</el-button>
    </div>
    <div v-if="showError" class="error">密码错误！</div>
  </div>
</template>
<style scoped>
.lock {
  padding: 8px;
  width: 200px;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.form-box {
  display: flex;
  justify-content: center;
}

.error {
  color: red;
}
</style>
