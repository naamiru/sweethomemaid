import { type ReactNode } from 'react'
import { useApp } from './app/use-app'

export default function HistoryNav(): ReactNode {
  const { histories, historyIndex, dispatch } = useApp()
  return (
    <div className="history-nav">
      <button
        className="button"
        disabled={historyIndex === 0}
        onClick={() => {
          dispatch({ type: 'historyBackFirst' })
        }}
      >
        <span className="icon">
          <i className="fas fa-solid fa-backward-step" />
        </span>
      </button>

      <button
        className="button is-disabled"
        disabled={historyIndex === 0}
        onClick={() => {
          dispatch({ type: 'historyBack' })
        }}
      >
        <span className="icon">
          <i className="fas fa-solid fa-caret-left fa-lg" />
        </span>
      </button>

      <button
        className="button"
        disabled={historyIndex === histories.length - 1}
        onClick={() => {
          dispatch({ type: 'historyForward' })
        }}
      >
        <span className="icon">
          <i className="fas fa-solid fa-caret-right fa-lg" />
        </span>
      </button>

      <button
        className="button"
        disabled={historyIndex === histories.length - 1}
        onClick={() => {
          dispatch({ type: 'historyForwardLast' })
        }}
      >
        <span className="icon">
          <i className="fas fa-solid fa-forward-step" />
        </span>
      </button>
    </div>
  )
}
