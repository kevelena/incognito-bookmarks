import appConfig from '@/config/app'
import { encryptWithCTR, decryptWithCTR } from '@/utils/utils'
import { useLockStore } from '@/stores/lock'

export type Settings = {
  id: string
  pwd: string
}

export type MyBookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode & { color?: string }

function encode(str: string) {
  return encryptWithCTR(str, appConfig.key, appConfig.iv)
}
function decode(str: string) {
  return decryptWithCTR(str, appConfig.key, appConfig.iv)
}

// 获取指定文件夹的完整子项
async function getFolderChildren(folderName: string): Promise<MyBookmarkTreeNode> {
  const tree = (await chrome.bookmarks.getTree())[0].children!

  // 递归查找文件夹
  function findFolder(nodes: MyBookmarkTreeNode[]): MyBookmarkTreeNode | null {
    for (const node of nodes) {
      if (node.title === folderName && !node.url) {
        return node
      }
      if (node.children) {
        const found = findFolder(node.children)
        if (found) return found
      }
    }
    return null
  }

  const folder = findFolder(tree)
  return folder!
}

async function decodeBookMarkList(mark: MyBookmarkTreeNode): Promise<MyBookmarkTreeNode> {
  const v: MyBookmarkTreeNode = {
    ...mark,
  }

  if (mark.title) {
    const d = JSON.parse(await decode(mark.title))
    v.title = d.t
    v.color = d.c ?? ''
  }
  if (mark.url) {
    v.url = await decode(mark.url!.substring(appConfig.urlPrefix.length))
  }
  if (v.children) {
    v.children = await Promise.all(
      v.children!.map(async (item) => {
        return decodeBookMarkList(item)
      }),
    )
    // .sort((a, b) => {
    //   return typeof b.children !== 'undefined' ? 1 : -1
    // })
  }
  return v
}

export default {
  async init() {
    // 初始化配置信息
    let settings = (await chrome.bookmarks.search(await encode(appConfig.settingKey)))?.[0] ?? null
    let root = (await chrome.bookmarks.search(await encode(appConfig.rootKey)))?.[0] ?? null

    if (!settings) {
      // 是否有跟配置信息
      if (!root) {
        root = await chrome.bookmarks.create({
          title: await encode(appConfig.rootKey),
        })
      }
      settings = await chrome.bookmarks.create({
        parentId: root.id,
        title: await encode(appConfig.settingKey),
        url: appConfig.urlPrefix,
      })
    }

    if (!settings.url || settings.url === appConfig.urlPrefix) {
      await chrome.bookmarks.update(settings.id, {
        url:
          appConfig.urlPrefix +
          (await encode(
            JSON.stringify({
              id: settings.id,
              pwd: appConfig.defPwd,
            } satisfies Settings),
          )),
      })
    }

    // 初始化书签目录
    const marks = (await chrome.bookmarks.search(appConfig.marksKey))?.[0]?.id ?? null
    if (!marks) {
      await chrome.bookmarks.create({
        title: appConfig.marksKey,
        parentId: root.id,
      })
    }

    // 登录是否过期
    chrome.storage.session.get('unLockDate').then(({ unLockDate }) => {
      if (!unLockDate || Date.now() - (unLockDate as number) > appConfig.authDuration) {
        useLockStore().setLock(true)
        return
      }
      useLockStore().setLock(false)
      // 更新时间
      chrome.storage.session.set({ unLockDate: Date.now() })
    })
  },
  /**
   * 获取配置信息
   */
  async getSetting(): Promise<Settings> {
    const settingsMark = (await chrome.bookmarks.search(await encode(appConfig.settingKey)))[0]
    const url = settingsMark.url!.substring(appConfig.urlPrefix.length)
    const settings = JSON.parse(await decode(url))
    return settings
  },
  /**
   * 更新配置信息
   */
  async updateSetting(settings: Settings) {
    const url = appConfig.urlPrefix + (await encode(JSON.stringify(settings)))
    await chrome.bookmarks.update(settings.id, {
      url,
    })
  },
  /**
   * 获取书签列表
   */
  async getBookMarkList() {
    const mark = await getFolderChildren(appConfig.marksKey)
    const o = await decodeBookMarkList(mark)
    o.title = '根'
    return o
  },
  /**
   * 查找书签
   */
  async findBookMark(url: string | undefined) {
    if (!url) return null
    const marks = await this.getBookMarkList()
    function find(marks: MyBookmarkTreeNode[], url: string): MyBookmarkTreeNode | null {
      for (const mark of marks) {
        if (mark.url === url) {
          return mark
        }
        if (mark.children) {
          const found = find(mark.children, url)
          if (found) return found
        }
      }
      return null
    }

    return find(marks?.children ?? [], url)
  },
  /**
   * 添加书签
   * @param name 书签名称
   * @param url 书签地址，为空则默认为文件夹类型
   * @param parentId 父级id，为空则默认为书签文件夹根目录
   */
  async addBookMark(title: string, url: string = '', parentId: string = '', color: string = '') {
    if (!parentId) {
      const mark = (await chrome.bookmarks.search(appConfig.marksKey))[0]
      parentId = mark.id
    }
    if (url) {
      url = appConfig.urlPrefix + (await encode(url))
    }
    const obj: any = {
      t: title,
    }
    if (color) {
      obj.c = color
    }
    title = await encode(JSON.stringify(obj))
    return chrome.bookmarks.create({ title: title, url: url, parentId: parentId })
  },
  /**
   * 删除书签
   */
  async deleteBookMark(id: string, url: string = '') {
    if (!id) {
      const mark = await this.findBookMark(url)
      if (!mark) {
        return null
      }
      id = mark.id
    }
    return chrome.bookmarks.remove(id)
  },

  /**
   * 更新书签
   */
  async updateBookMark(
    id: string,
    title: string = '',
    url: string | undefined = undefined,
    parentId: string | undefined = undefined,
    color: string | undefined = undefined,
  ) {
    if (!id) {
      const mark = await this.findBookMark(url)
      if (!mark) {
        return null
      }
      id = mark.id
    }

    const titleObj: any = {
      t: title,
    }
    if (color) {
      titleObj.c = color
    }
    const obj: any = { title: await encode(JSON.stringify(titleObj)) }
    if (url) {
      obj.url = appConfig.urlPrefix + (await encode(url))
    }
    if (parentId) {
      await chrome.bookmarks.move(id, { parentId: parentId })
    }
    return chrome.bookmarks.update(id, obj)
  },
}
