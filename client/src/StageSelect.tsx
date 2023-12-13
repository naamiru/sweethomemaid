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
              <option value="masters_4_1">マスターズ 鎖（O型）</option>
              <option value="masters_4_2">
                マスターズ 鎖（X型）鎖は対応中！
              </option>
              <option value="masters_4_3">
                マスターズ 鎖（/型）鎖は対応中！
              </option>
            </optgroup>
            <optgroup label="クリスマスメイキング">
              <option value="xmas_1">クリスマス 1</option>
              <option value="xmas_2_1">クリスマス 2 wave 1</option>
              <option value="xmas_2_2">クリスマス 2 wave 2</option>
              <option value="xmas_4_1">クリスマス 4 wave1</option>
              <option value="xmas_4_2">クリスマス 4 wave2</option>
              <option value="xmas_5">クリスマス 5</option>
              <option value="xmas_7">クリスマス 7</option>
              <option value="xmas_8">クリスマス 8</option>
              <option value="xmas_9">クリスマス 9</option>
              <option value="xmas_10_1">クリスマス 10 wave1</option>
              <option value="xmas_10_2">クリスマス 10 wave2</option>
            </optgroup>
          </select>
        </div>
      </div>
    </div>
  )
}
