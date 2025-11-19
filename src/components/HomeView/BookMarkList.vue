<script lang="ts" setup>
import BookMarkService, { type MyBookmarkTreeNode } from '@/service/BookMarkService'
import { Delete, Plus, Document, Menu, EditPen } from '@element-plus/icons-vue'
import type { FilterNodeMethodFunction } from 'element-plus'
import BookMarkForm from './BookMarkForm.vue'
import { dialog } from '@/utils/vueUtils'
import { getFavoriteIcon } from '@/utils/utils'

const tree = ref<MyBookmarkTreeNode[]>([])
const rootId = ref('0')
function getTree() {
  BookMarkService.getBookMarkList().then((res) => {
    rootId.value = res.id
    tree.value = [res]
  })
}
getTree()

const newWindowOpen = ref(false)
function onItemClick(item: MyBookmarkTreeNode) {
  if (item.url) {
    // window.open(item.url)
    chrome.tabs.create({
      url: item.url,
      active: newWindowOpen.value,
    })
  }
}

function deleteItem(item: MyBookmarkTreeNode) {
  window.ElMessageBox.confirm('确定删除 ' + item.title + '？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await BookMarkService.deleteBookMark(item.id)
    getTree()
  })
}

function editItem(item: MyBookmarkTreeNode) {
  const close = dialog(BookMarkForm, {
    title: '编辑',
    width: '350px',
    props: {
      form: {
        id: item.id,
        title: item.title!,
        url: item.url,
        parentId: item.parentId!,
        color: item.color!,
      },
    },
    emits: {
      delete() {
        close()
        getTree()
      },
      update() {
        close()
        getTree()
      },
    },
  })
}

async function addItem(item: MyBookmarkTreeNode) {
  // await BookMarkService.addBookMark('新目录', '', item.id)
  // getTree()

  const close = dialog(BookMarkForm, {
    title: '新增',
    width: '350px',
    props: {
      form: {
        id: '',
        title: '',
        url: '',
        parentId: item.id!,
        color: item.color!,
      },
    },
    emits: {
      insert() {
        close()
        getTree()
      },
    },
  })
}

function isDir(item: any) {
  return typeof item.children !== 'undefined'
}

// 过滤
const filterText = ref('')
const TreeRef = ref()
const filterNode: FilterNodeMethodFunction = (value: string, data: any) => {
  if (!value) return true
  return data.title.includes(value)
}
watch(filterText, (val) => {
  TreeRef.value!.filter(val)
})
</script>
<template>
  <div class="bookMarkList">
    <div style="display: flex; align-items: center">
      <el-input v-model="filterText" placeholder="搜索" clearable style="width: 50%" />
      <el-checkbox v-model="newWindowOpen" style="margin-left: 8px">跳转新窗口</el-checkbox>
    </div>
    <el-tree
      ref="TreeRef"
      style="max-width: 485px; margin-top: 8px"
      :data="tree"
      node-key="id"
      default-expand-all
      :filter-node-method="filterNode"
    >
      <template #default="{ data }">
        <div class="custom-tree-node">
          <div
            :title="data.title + '\n' + data.url"
            @click="onItemClick(data)"
            style="width: 330px; overflow: hidden; display: flex; align-items: center"
            :style="{ color: data.color ?? '' }"
          >
            <el-icon v-if="isDir(data)" style="padding-right: 2px">
              <Menu />
            </el-icon>
            <template v-else>
              <img
                v-if="getFavoriteIcon(data.url)"
                :src="getFavoriteIcon(data.url)"
                alt=""
                style="width: 16px; height: 16px; margin-right: 2px"
              />
              <el-icon v-else>
                <Document />
              </el-icon>
            </template>
            <div style="width: 300px; overflow: hidden; text-overflow: ellipsis">
              {{ data.title }}
            </div>
          </div>
          <div>
            <el-icon v-if="isDir(data)" color="var(--el-color-primary)" @click.stop="addItem(data)"
              ><Plus
            /></el-icon>
            <el-icon
              v-if="data.id !== rootId"
              @click.stop="editItem(data)"
              style="margin-left: 8px"
              color="var(--el-color-success)"
              ><EditPen
            /></el-icon>
            <el-icon
              v-if="data.id !== rootId"
              @click.stop="deleteItem(data)"
              style="margin-left: 8px"
              color="var(--el-color-danger)"
              ><Delete
            /></el-icon>
          </div>
        </div>
      </template>
    </el-tree>

    <!-- <div v-for="item in bookMarkList" :key="item.id" class="mark-item">
      <div @click="onItemClick(item)">{{ item.title }}</div>
    </div> -->
  </div>
</template>
<style scoped lang="scss">
.bookMarkList {
  width: 100%;
  height: 100%;
  min-height: 430px;
  max-height: 500px;
  overflow: auto;
  padding-bottom: 10px;
  user-select: none;
}
.mark-item {
  padding: 10px;
  border-bottom: 1px solid #ccc;
  word-wrap: break-word; /* 允许长单词或URL地址换行 */
  word-break: break-all; /* 允许在单词内换行 */
  white-space: normal; /* 使用默认的空白处理方式 */
  cursor: pointer;
  &:hover {
    background-color: #e0dcdc;
  }
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 18px;
  padding-right: 8px;
}
</style>
