export {}

declare global {
  /**
   * 对象类型
   */
  type AnyObj = {
    [key: string]: any
  }

  import type { ElMessage, ElMessageBox } from 'element-plus'

  interface Window {
    ElMessage: ElMessage
    ElMessageBox: ElMessageBox
  }
}
