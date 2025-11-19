import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/theme-chalk/el-message.css'
import 'element-plus/theme-chalk/el-message-box.css'

window.ElMessage = ElMessage
window.ElMessageBox = ElMessageBox

import BookMarkService from '@/service/BookMarkService'

const app = createApp(App)

app.use(createPinia())
app.use(router)

BookMarkService.init().then(() => {
  app.mount('#app')
})
