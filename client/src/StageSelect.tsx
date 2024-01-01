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
          <select name="stage" value={stage} onChange={handleChange}>
            <optgroup label="マスターズランキング">
              <option value="masters_7_1">
                マスターズ ボタン（中央上が紫）
              </option>
              <option value="masters_7_2">
                マスターズ ボタン（中央上が水色）
              </option>
            </optgroup>
            <optgroup label="ズボラ姫たちの年はじめ">
              <option value="newyear_1_1">年はじめ1 wave1</option>
              <option value="newyear_1_2">年はじめ1 wave2</option>
              <option value="newyear_2">年はじめ2</option>
              <option value="newyear_3">年はじめ3</option>
              <option value="newyear_4_1">年はじめ4 wave1</option>
              <option value="newyear_4_2">年はじめ4 wave2</option>
              <option value="newyear_5_1">年はじめ5 wave1</option>
              <option value="newyear_5_2">年はじめ5 wave2</option>
            </optgroup>
          </select>
        </div>
      </div>
    </div>
  )
}
