chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'getGameArea') return false

  sendResponse({
    rect: document.querySelector('#game_frame').getBoundingClientRect(),
    devicePixelRatio: window.devicePixelRatio
  })
  return true
})
