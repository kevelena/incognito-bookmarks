<script setup lang="ts">
import { RouterView } from 'vue-router'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useLockStore } from '@/stores/lock'
import Lock from '@/components/Lock.vue'
</script>

<template>
  <el-config-provider
    :locale="zhCn"
    :message="{
      max: 1,
      offset: 3,
    }"
  >
    <Lock v-if="useLockStore().isLock"></Lock>
    <RouterView v-else />
  </el-config-provider>
</template>
