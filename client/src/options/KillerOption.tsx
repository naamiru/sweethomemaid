import { useCallback, useMemo, type ChangeEvent, type ReactNode } from 'react'
import { useApp } from '../app/use-app'
import bombImage from '../assets/piece-images/b.png'
import missileImage from '../assets/piece-images/m.png'
import rocketImage from '../assets/piece-images/rh.png'

export default function KillerOptions(): ReactNode {
  const { killers, dispatch } = useApp()

  const changeHandlers = useMemo(() => {
    return [0, 1, 2].map(i => (event: ChangeEvent<HTMLSelectElement>) => {
      const values = [...killers] as [number, number, number]
      values.splice(i, 1, parseInt(event.target.value, 10))
      dispatch({ type: 'setKillers', value: values })
    })
  }, [dispatch, killers])

  const reset = useCallback(() => {
    dispatch({ type: 'setKillers', value: [0, 0, 0] })
  }, [dispatch])

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
            <a className="button is-static is-small">
              <img src={bombImage} className="killer-icon" />
            </a>
          </p>
          <p className="control">
            <span className="select is-small">
              <select value={killers[0]} onChange={changeHandlers[0]}>
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
            <a className="button is-static is-small">
              <img src={rocketImage} className="killer-icon" />
            </a>
          </p>
          <p className="control">
            <span className="select is-small">
              <select value={killers[1]} onChange={changeHandlers[1]}>
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
            <a className="button is-static is-small">
              <img src={missileImage} className="killer-icon" />
            </a>
          </p>
          <p className="control">
            <span className="select is-small">
              <select value={killers[2]} onChange={changeHandlers[2]}>
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
