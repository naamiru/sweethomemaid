chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'getScreenshot') return false
  ;(async () => {
    const tabs = await chrome.tabs.query({
      active: true,
      url: ['https://pc-play.games.dmm.co.jp/play/sweethomemaid_r/*']
    })
    if (tabs.length === 0) {
      sendResponse(undefined)
      return
    }
    const tab = tabs[0]

    const { devicePixelRatio, rect } = await chrome.tabs.sendMessage(tab.id, {
      type: 'getGameArea'
    })
    const image = await chrome.tabs.captureVisibleTab(tab.windowId)
    sendResponse({
      image,
      rect,
      devicePixelRatio
    })
  })()
  return true
})
