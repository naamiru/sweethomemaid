import { type ReactNode } from 'react'
import { useApp } from '../app/use-app'

export default function KillerOptions(): ReactNode {
  const { killers, dispatch } = useApp()

  function handleChange(i: 0 | 1 | 2, value: number): void {
    const values = [...killers] as [number, number, number]
    values.splice(i, 1, value)
    dispatch({ type: 'setKillers', value: values })
  }

  function reset(): void {
    dispatch({ type: 'setKillers', value: [0, 0, 0] })
  }

  return (
    <div className="option killer-option">
      <div className="head">
        キラー
        <a className="action" onClick={reset}>
          リセット
        </a>
      </div>
      <div className="body">
        <div className="field has-addons">
          <p className="control">
            <a className="button is-static is-small">ボム</a>
          </p>
          <p className="control">
            <span className="select is-small">
              <select
                value={killers[0]}
                onChange={e => {
                  handleChange(0, parseInt(e.target.value, 10))
                }}
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </span>
          </p>
        </div>
        <div className="field has-addons">
          <p className="control">
            <a className="button is-static is-small">ロケット</a>
          </p>
          <p className="control">
            <span className="select is-small">
              <select
                value={killers[1]}
                onChange={e => {
                  handleChange(1, parseInt(e.target.value, 10))
                }}
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </span>
          </p>
        </div>
        <div className="field has-addons">
          <p className="control">
            <a className="button is-static is-small">ミサイル</a>
          </p>
          <p className="control">
            <span className="select is-small">
              <select
                value={killers[2]}
                onChange={e => {
                  handleChange(2, parseInt(e.target.value, 10))
                }}
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
