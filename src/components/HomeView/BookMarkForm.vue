<script lang="ts" setup>
import BookMarkService from '@/service/BookMarkService'
import { getFavoriteIcon } from '@/utils/utils'

const props = defineProps<{
  form: {
    id: string
    parentId: string
    title: string
    url: string | undefined
    color: string
  }
}>()

const emits = defineEmits<{
  (e: 'insert', form: any): void
  (e: 'update', form: any): void
  (e: 'delete', form: any): void
}>()

const form = ref(props.form)

// 获取目录树
const treeData = ref<Array<any>>([])
const TreeSelectRef = ref()
function getTreeData() {
  BookMarkService.getBookMarkList().then((res) => {
    // form.value.parentId = res.id
    // 递归处理树形结构，只保留目录
    const handleTreeData = (data: chrome.bookmarks.BookmarkTreeNode) => {
      if (!data.children) {
        return null
      }
      if (typeof form.value.url === 'undefined' && data.id === form.value.id) {
        return null
      }
      const tree: any = {
        value: data.id,
        label: data.title,
        children: [],
      }
      for (const item of data.children) {
        if (!item.children) {
          continue
        }
        const child = handleTreeData(item)
        if (child) {
          tree.children.push(child)
        }
      }
      return tree
    }
    treeData.value = [handleTreeData(res)]
    if (!form.value.parentId) {
      form.value.parentId = treeData.value[0].value
    }
    nextTick(() => {
      // 展开所有节点
      for (const [_, node] of Object.entries(
        (TreeSelectRef.value!.treeRef as any).store.nodesMap,
      )) {
        ;(node as any).expanded = true
      }
    })
  })
}
getTreeData()

async function addBookMark() {
  const mark = await BookMarkService.addBookMark(
    form.value.title,
    form.value.url,
    form.value.parentId,
    form.value.color,
  )
  if (mark) {
    window.ElMessage.success('添加成功')
    emits('insert', form.value)
  } else {
    window.ElMessage.error('添加失败')
  }
}
async function updateBookMark() {
  const mark = await BookMarkService.updateBookMark(
    form.value.id,
    form.value.title,
    form.value.url,
    form.value.parentId,
    form.value.color,
  )
  if (mark) {
    window.ElMessage.success('修改成功')
    emits('update', form.value)
  } else {
    window.ElMessage.error('修改失败')
  }
}
async function deleteBookMark() {
  await BookMarkService.deleteBookMark(form.value.id)
  window.ElMessage.success('删除成功')
  emits('delete', form.value)
}

const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  'rgba(255, 69, 0, 0.68)',
  'rgb(255, 120, 0)',
  'hsv(51, 100, 98)',
  'hsva(120, 40, 94, 0.5)',
  'hsl(181, 100%, 37%)',
  'hsla(209, 100%, 56%, 0.73)',
  '#c7158577',
])
</script>
<template>
  <el-form :model="form" label-width="50px" class="add-bookmark">
    <div v-if="!form.id" style="padding: 0 8px 8px 50px">地址为空则添加为文件夹</div>
    <el-form-item label="名称">
      <el-input v-model="form.title" clearable>
        <template #suffix>
          <img :src="getFavoriteIcon(form.url)" width="16" height="16" alt="" />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item v-if="typeof form.url === 'undefined'" label="颜色">
      <el-color-picker
        v-model="form.color"
        show-alpha
        :predefine="predefineColors"
        color-format="hex"
      />
      &nbsp;文件夹生效
    </el-form-item>
    <el-form-item v-if="typeof form.url !== 'undefined'" label="地址">
      <el-input v-model="form.url" clearable />
    </el-form-item>
    <el-form-item label="目录">
      <el-tree-select
        v-model="form.parentId"
        style="max-height: 100px"
        ref="TreeSelectRef"
        @focus="getTreeData"
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
  </el-form>
</template>
