<script lang="ts" setup>
import { ref, getCurrentInstance } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const instance = getCurrentInstance()

const props = defineProps<{
  component: any
}>()

const draggable: boolean = (instance?.attrs?.draggable as boolean) ?? false

const onMaskClick = (data?: AnyObj) => {
  if (instance?.attrs?.handleClose) {
    const attrs = instance!.attrs as any
    attrs.handleClose(() => {
      dialogVisible.value = false
    }, data)
  } else {
    dialogVisible.value = false
  }
}

const dialogVisible = ref(true)

// 设置弹窗显示
;(instance?.attrs as any).myDialogSetDialogVisible((bool: boolean) => {
  dialogVisible.value = bool
})

// 自定义弹窗关闭事件
function handleClose(done: any) {
  if (instance?.attrs?.handleClose) {
    const attrs = instance!.attrs as any
    attrs.handleClose(done)
  } else {
    done()
  }
}
</script>
<template>
  <el-dialog
    class="my-dialog"
    v-model="dialogVisible"
    :draggable="draggable"
    :close-on-press-escape="false"
    :title="($attrs.title as string) || ''"
    :before-close="handleClose"
    :width="($attrs.width as string) || '50%'"
  >
    <el-config-provider
      :locale="zhCn"
      :message="{
        max: 1,
        offset: 3,
      }"
    >
      <component :is="props.component" v-bind="$attrs" @close="onMaskClick"></component>
    </el-config-provider>
  </el-dialog>
</template>
<style>
.my-dialog {
  margin: 10px auto 10px;
}
</style>
