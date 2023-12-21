import classNames from 'classnames'
import { useCallback, type ReactNode } from 'react'
import { useApp } from '../app/use-app'
import swapImage from '../assets/skills/iroha_bunny.png'

export default function SkillOption(): ReactNode {
  const { useSwapSkill, dispatch } = useApp()
  const handleChange = useCallback(
    (value: boolean) => {
      dispatch({ type: 'setUseSwapSkill', value })
    },
    [dispatch]
  )

  return (
    <div className="option skill-option">
      <div className="head">スキル</div>
      <div className="body">
        <SkillItem value={useSwapSkill} onChange={handleChange} />
      </div>
    </div>
  )
}

function SkillItem({
  value,
  onChange
}: {
  value: boolean
  onChange: (value: boolean) => void
}): ReactNode {
  const handleClick = useCallback(() => {
    onChange(!value)
  }, [value, onChange])
  return (
    <div
      className={classNames('skill-item', { 'is-active': value })}
      onClick={handleClick}
    >
      <img src={swapImage} />
    </div>
  )
}
