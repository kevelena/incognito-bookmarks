<script setup lang="ts">
import { ref } from 'vue'
import { Lock } from '@element-plus/icons-vue'
import { useLockStore } from '@/stores/lock'
import AddBookMark from '@/components/HomeView/AddBookMark.vue'
import BookMarkList from '@/components/HomeView/BookMarkList.vue'
import Settings from '@/components/HomeView/Settings.vue'
const activeName = ref('bookmark')

function lock() {
  useLockStore().setLock(true)
  chrome.storage.session.remove('unLockDate')
}

// 优化：当点击tab时，才加载组件，避免不必要的渲染
const loadedTab = ref<Array<string>>(['bookmark'])
function handleClick(tab: any) {
  loadedTab.value.push(tab.props.name)
}
</script>

<template>
  <div class="home-view">
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="添加书签" name="bookmark"><AddBookMark /></el-tab-pane>
      <el-tab-pane label="书签列表" name="bookmarkList"
        ><BookMarkList v-if="loadedTab.includes('bookmarkList')"
      /></el-tab-pane>
      <el-tab-pane label="设置" name="settings"
        ><Settings v-if="loadedTab.includes('settings')"
      /></el-tab-pane>
    </el-tabs>
    <div class="lock" title="锁定" @click="lock">
      <el-icon size="18">
        <Lock />
      </el-icon>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-view {
  width: 500px;
  padding: 0 8px;
}
.lock {
  position: fixed;
  cursor: pointer;
  top: 10px;
  right: 20px;
  width: 18px;
  height: 18px;
  display: flex;
  justify-content: center;
  &:hover {
    color: var(--el-color-primary);
  }
}
</style>
