<script setup lang="ts">
import BookMarkService, { type Settings } from '@/service/BookMarkService'
const setting = ref({
  id: '',
  pwd: '',
} satisfies Settings)
const showPassword = ref(true)
BookMarkService.getSetting().then((res) => {
  setting.value = res
})

function updateBookMark() {
  BookMarkService.updateSetting(setting.value).then(() => {
    ElMessage({
      message: '修改成功',
      type: 'success',
    })
  })
}
</script>
<template>
  <div class="settings">
    <el-form :model="setting" label-width="50px" class="add-bookmark">
      <el-form-item label="密码">
        <el-input
          v-model="setting.pwd"
          clearable
          type="password"
          :show-password="showPassword"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="success" @click="updateBookMark">修改</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.settings {
  width: 100%;
  height: 100%;
}
</style>
