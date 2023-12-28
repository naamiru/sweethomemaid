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
            <optgroup label="ズボラ姫たちの年はじめ">
              <option value="newyear_1_1">年はじめ1 wave1</option>
              <option value="newyear_1_2">年はじめ1 wave2</option>
              <option value="newyear_3">年はじめ3</option>
              <option value="newyear_4_1">年はじめ4 wave1</option>
              <option value="newyear_4_2">年はじめ4 wave2</option>
            </optgroup>
          </select>
        </div>
      </div>
    </div>
  )
}
