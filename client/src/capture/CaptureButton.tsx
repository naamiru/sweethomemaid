import { useCallback, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import './CaptureButton.css'
import { loadImage } from './load-image'
import { useCapture } from './use-capture'

export default function CaptureButton(): ReactNode {
  const { dispatch } = useCapture()
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      ;(async () => {
        const files = event.target.files
        if (files === null) return
        const image = await loadImage(files[0])
        dispatch({ type: 'setImage', image })
        event.target.value = ''
      })().catch(() => {
        toast.error('画像の読み込みに失敗しました')
      })
    },
    [dispatch]
  )

  return (
    <div
      className="file capture-button"
      aria-label={`スクリーンショットから
盤面配置を読み込みます`}
      data-microtip-position="top"
      role="tooltip"
    >
      <label className="file-label">
        <input
          className="file-input"
          type="file"
          accept="image/*"
          onChange={handleChange}
        />
        <span className="file-cta">
          <span className="file-icon">
            <i className="fas fa-image"></i>
          </span>
          <span className="file-label">画像で配置</span>
        </span>
      </label>
    </div>
  )
}
