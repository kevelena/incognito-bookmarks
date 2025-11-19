import MyDialog from '@/components/MyDialog.vue'

/**
 * 对话窗
 * @returns 关闭方法
 */
export function dialog<P>(
  component: Component<P>,
  options: {
    /**
     * 属性列表
     */
    props?: P
    /**
     * 事件列表
     */
    emits?: Record<string, any>
    /**
     * 标题
     */
    title: string
    /**
     * 宽度
     */
    width?: string
    /**
     * 自定义关闭事件
     */
    handleClose?: (done: () => void, data?: AnyObj) => void
    /**
     * 是否可拖拽
     */
    draggable?: boolean
  },
) {
  // 创建一个 dom，作为挂载点
  let dialogDiv: any = window.document.createElement('div')
  window.document.body.appendChild(dialogDiv)
  const emits: any = {}
  if (options.emits) {
    for (const key in options.emits) {
      // 首字母大写
      const k = key.charAt(0).toUpperCase() + key.slice(1)
      emits[`on${k}`] = options.emits[key]
    }
  }

  let setDialogVisible: any = null

  let dialogApp: any = createApp(MyDialog, {
    // 作为props传递给Dialog组件
    ...options.props,
    ...emits,
    title: options.title,
    width: options.width,
    handleClose: options.handleClose,
    myDialogSetDialogVisible: (v: any) => {
      setDialogVisible = v
    },
    draggable: options.draggable ?? false,
    component,
    onClose: () => {
      // 对话窗关闭，等待动画结束后再移除 dom
      setTimeout(() => {
        dialogApp?.unmount()
        if (dialogDiv) {
          window.document.body.removeChild(dialogDiv)
        }
        dialogApp = null
        dialogDiv = null
      }, 1000)
    },
  })

  let close: any = () => {
    setDialogVisible(false)
    // 对话窗关闭，等待动画结束后再移除 dom
    setTimeout(() => {
      dialogApp?.unmount()
      if (dialogDiv) {
        window.document.body.removeChild(dialogDiv)
      }
      dialogApp = null
      dialogDiv = null
      close = null
    }, 1000)
  }
  dialogApp.mount(dialogDiv)
  return close
}
