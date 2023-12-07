import { useCallback, useState, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import { useCapture } from './capture'
import Canvas from './capture/Canvas'

export default function CaptureButton(): ReactNode {
  const [isLoading, setIsLoading] = useState(false)
  const capture = useCapture()
  const handleClick = useCallback(() => {
    setIsLoading(true)
    capture()
      .catch(e => {
        console.error(e)
        toast.error('キャプチャに失敗しました')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [capture])
  return (
    <button className="button" disabled={isLoading} onClick={handleClick}>
      <span className="icon">
        <i className="fas fa-camera"></i>
      </span>
      <span>キャプチャ</span>
      <Canvas />
    </button>
  )
}
