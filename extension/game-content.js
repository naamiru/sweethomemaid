chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('receive message', message)
  if (message?.type !== 'getGameArea') return false

  sendResponse({
    rect: document.querySelector('#game_frame').getBoundingClientRect(),
    devicePixelRatio: window.devicePixelRatio
  })
  return true
})
