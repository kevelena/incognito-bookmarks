import BookMarkService from '@/service/BookMarkService'

// 监听地址栏变化
chrome.tabs.onUpdated.addListener(async (tabId, _changeInfo, tab) => {
  isBookmarked(tab.url, tabId)
})
// 监听标签页切换
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId)
  isBookmarked(tab.url, activeInfo.tabId)
})
// 监听刷新
chrome.tabs.onReplaced.addListener(async (newTabId) => {
  const tab = await chrome.tabs.get(newTabId)
  isBookmarked(tab.url, newTabId)
})

// 判断是否已收藏
// let checkUrl = ''
// let checkTabId = 0
async function isBookmarked(url: string | undefined, tabId: number) {
  if (url === undefined) {
    await chrome.action.setIcon({ tabId, path: 'img/star-off-32.png' })
    return
  }

  // if (checkUrl === url && checkTabId === tabId) {
  //   return
  // }
  // checkUrl = url
  // checkTabId = tabId
  BookMarkService.findBookMark(url).then(async (res) => {
    if (res) {
      chrome.action.setIcon({ tabId, path: 'img/star-on-32.png' })
    } else {
      await chrome.action.setIcon({ tabId, path: 'img/star-off-32.png' })
    }
  })
}
