document.body.addEventListener(
  'click',
  event => {
    const target = event.target
    if (!(target instanceof Element)) return
    const button = target.closest('.capture-button')
    if (button === null) return

    // 画像読み取りボタンが押された
    event.preventDefault()
    event.stopPropagation()

    capture().catch(console.error)
  },
  true
)

async function capture() {
  const res = await chrome.runtime.sendMessage({
    type: 'getScreenshot'
  })
  if (!res) return
  const { image, devicePixelRatio, rect } = res

  const event = new CustomEvent('shm-capture', {
    detail: {
      image,
      devicePixelRatio,
      rect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      }
    }
  })
  document.dispatchEvent(event)
}
