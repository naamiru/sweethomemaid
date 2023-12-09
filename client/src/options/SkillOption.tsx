import { useCallback, type ChangeEvent, type ReactNode } from 'react'
import { useApp } from '../app/use-app'

export default function SkillOption(): ReactNode {
  const { useSwapSkill, dispatch } = useApp()
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: 'setUseSwapSkill', value: event.target.checked })
    },
    [dispatch]
  )

  return (
    <div className="option skill-option">
      <div className="head">スキル</div>
      <div className="body">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={useSwapSkill}
            onChange={handleChange}
          />
          入れ替えスキルを使用
        </label>
      </div>
    </div>
  )
}
