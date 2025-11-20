<script lang="ts" setup>
import BookMarkService, { type Settings } from '@/service/BookMarkService'
import { useLockStore } from '@/stores/lock'
import appConfig from '@/config/app'
const pwd = ref('')
// 正确密码
const setting = ref({
  id: '',
  pwd: '',
} satisfies Settings)
const status = ref<'reset' | 'lock'>('lock')

useLockStore().setLock(true)

// 是否过期
chrome.storage.session.get('unLockDate').then(({ unLockDate }) => {
  if (!unLockDate || Date.now() - (unLockDate as number) > appConfig.authDuration) {
    useLockStore().setLock(true)
    BookMarkService.getSetting().then((res) => {
      setting.value = res
      if (setting.value.pwd === '') {
        status.value = 'reset'
      }
    })
    return
  }
  useLockStore().setLock(false)
})

async function checkPwd() {
  if (pwd.value === setting.value.pwd) {
    // 解锁
    useLockStore().setLock(false)
    // 缓存解锁
    chrome.storage.session.set({ unLockDate: Date.now() })
  } else {
    // 错误提示
    window.ElMessage({
      message: '密码错误',
      type: 'error',
    })
  }
}

async function setPwd() {
  if (pwd.value === '') {
    window.ElMessage({
      message: '密码不能为空',
      type: 'error',
    })
    return
  }
  if (pwd.value.length < 6) {
    window.ElMessage({
      message: '密码不能少于6位',
      type: 'error',
    })
    return
  }
  setting.value.pwd = pwd.value
  BookMarkService.updateSetting(setting.value).then(() => {
    chrome.storage.session.remove('unLockDate')
    window.ElMessage({
      message: '设置成功',
      type: 'success',
    })
    // 解锁
    useLockStore().setLock(false)
  })
}
</script>
<template>
  <div class="lock">
    <!-- 重置密码 -->
    <div v-if="status === 'reset'">
      <div>首次运行，请设置密码</div>
      <div class="form-box" style="margin-top: 8px">
        <el-input
          v-model="pwd"
          autofocus
          @keyup.enter.prevent="setPwd"
          placeholder="请输入密码"
          type="password"
        ></el-input>
        <el-button @click="setPwd" style="margin-left: 8px" type="primary">确认</el-button>
      </div>
    </div>

    <!-- 锁屏 -->
    <div v-else class="form-box">
      <el-input
        v-model="pwd"
        autofocus
        @keyup.enter.prevent="checkPwd"
        placeholder="请输入密码"
        type="password"
      ></el-input>
      <el-button @click="checkPwd" style="margin-left: 8px" type="primary">确认</el-button>
    </div>
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
