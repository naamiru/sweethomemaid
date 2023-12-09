import classNames from 'classnames'
import { useCallback, useState, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import Canvas from '../capture/Canvas'
import './ScreenshotButton.css'
import { useScreenshot } from './use-screenshot'

export default function ScreenshotButton(): ReactNode {
  const screenshot = useScreenshot()
  const [isLoading, setIsLoading] = useState(false)
  const handleClick = useCallback(() => {
    setIsLoading(true)
    screenshot()
      .catch(error => {
        console.error(error)
        toast.error('取り込みに失敗しました')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [screenshot])

  return (
    <>
      <button
        className={classNames('button screenshot-button', {
          'is-loading': isLoading
        })}
        onClick={handleClick}
      >
        <span className="icon">
          <i className="fas fa-image"></i>
        </span>
        <span>画像読取</span>
      </button>
      <Canvas />
    </>
  )
}
