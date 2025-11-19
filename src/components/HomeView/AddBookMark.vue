<script lang="ts" setup>
import BookMarkService from '@/service/BookMarkService'
import BookMarkForm from './BookMarkForm.vue'

const form = ref({
  id: '',
  parentId: '',
  title: '',
  url: '',
  color: '',
})
const inited = ref(false)
let tabId = 0

// 获取当前页面地址和 title
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  const currentTab = tabs[0]
  const { url, title } = currentTab
  tabId = currentTab.id!
  form.value.url = url!
  form.value.title = title!
  // 查询当前书签是否存在
  const res = await BookMarkService.findBookMark(url!)
  if (res) {
    form.value.id = res.id
    form.value.title = res.title
    form.value.parentId = res.parentId!
  }
  console.log(res, form.value)

  inited.value = true
})

async function onInsert() {
  await chrome.action.setIcon({ tabId, path: 'img/star-on-32.png' })
  // 关闭当前窗口
  window.close()
}
async function onUpdate() {
  window.ElMessage.success('修改成功')
  // 关闭当前窗口
  window.close()
}
async function onDelete() {
  await chrome.action.setIcon({ tabId, path: 'img/star-off-32.png' })
  // 关闭当前窗口
  window.close()
}
</script>
<template>
  <BookMarkForm
    v-if="inited"
    :form="form"
    @insert="onInsert"
    @update="onUpdate"
    @delete="onDelete"
  ></BookMarkForm>
  <!-- <el-form :model="form" label-width="50px" class="add-bookmark">
    <el-form-item label="名称">
      <el-input v-model="form.name" clearable>
        <template #suffix>
          <img :src="favUrl" width="16" height="16" alt="" />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item label="地址">
      <el-input v-model="form.url" clearable />
    </el-form-item>
    <el-form-item label="目录">
      <el-tree-select
        v-model="form.parentId"
        ref="TreeSelectRef"
        :data="treeData"
        check-strictly
        :render-after-expand="false"
      />
    </el-form-item>
    <el-form-item>
      <template v-if="!form.id">
        <el-button v-if="!form.id" type="primary" @click="addBookMark">添加</el-button>
      </template>
      <template v-else>
        <el-button type="success" @click="updateBookMark">修改</el-button>
        <el-button type="danger" @click="deleteBookMark">删除</el-button>
      </template>
    </el-form-item>
  </el-form> -->
</template>
