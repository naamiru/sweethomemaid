import { useCallback } from 'react'
import { useApp } from '../app/use-app'
import { useDetect } from '../capture/use-detect'

const SS_URL = 'http://localhost:5174/'

export function useScreenshot(): () => Promise<void> {
  const { board } = useApp()
  const detect = useDetect()
  return useCallback(async (): Promise<void> => {
    const image = await loadImage(
      `${SS_URL}?w=${board.width}&h=${board.height}`
    )
    await detect(image, [0, 0, image.naturalWidth, image.naturalHeight])
  }, [board, detect])
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('fail to fetch image')
  const image = new Image()
  image.src = URL.createObjectURL(await res.blob())
  return await new Promise(resolve => {
    image.onload = () => {
      URL.revokeObjectURL(image.src)
      resolve(image)
    }
  })
}
