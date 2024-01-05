import { useCallback, type ReactNode } from 'react'
import { useApp } from '../app/use-app'

export default function DropOptions(): ReactNode {
  const { isPieceSupplied, dispatch } = useApp()

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: 'setIsPieceSupplied', value: event.target.checked })
    },
    [dispatch]
  )

  return (
    <div className="option drop-option">
      <div className="body">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={isPieceSupplied}
            onChange={handleChange}
          />
          <span className="text">ランダムなピースを降らせる</span>
        </label>
      </div>
    </div>
  )
}
