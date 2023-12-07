import { useCallback, type ChangeEvent, type ReactNode } from 'react'
import './StageSelect.css'
import { useApp } from './context/use-app'
import { type StageName } from './presets'

export default function StageSelect(): ReactNode {
  const { stage, dispatch } = useApp()
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      dispatch({ type: 'setStage', stage: event.target.value as StageName })
    },
    [dispatch]
  )
  return (
    <div className="field has-addons stage-select">
      <div className="control">
        <a className="button is-static">ステージ</a>
      </div>
      <div className="control is-expanded">
        <div className="select is-fullwidth">
          <select value={stage} onChange={handleChange}>
            <optgroup label="クリスマス">
              <option value="xmas_4_1">クリスマス4 wave1</option>
              <option value="xmas_4_2">クリスマス4 wave2</option>
            </optgroup>
          </select>
        </div>
      </div>
    </div>
  )
}
