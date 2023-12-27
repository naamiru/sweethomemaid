import { useCallback, type ChangeEvent, type ReactNode } from 'react'
import './StageSelect.css'
import { useApp } from './app/use-app'
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
            <optgroup label="マスターズランキング">
              <option value="masters_6_1">
                マスターズ ゼリー（中央下が緑）
              </option>
              <option value="masters_6_2">
                マスターズ ゼリー（中央下が水色）
              </option>
              <option value="masters_6_3">
                マスターズ ゼリー（中央下が青）
              </option>
            </optgroup>
            <optgroup label="年始">
              <option value="newyear_1_1">年始1 wave1</option>
            </optgroup>
          </select>
        </div>
      </div>
    </div>
  )
}
