import { Skill } from '@sweethomemaid/logic'
import classNames from 'classnames'
import { useCallback, type ReactNode } from 'react'
import { useApp } from '../app/use-app'
import crossRocketsImage from '../assets/skills/himariko_bath.png'
import hRocketImage from '../assets/skills/himariko_newyear.png'
import swapImage from '../assets/skills/iroha_bunny.png'
import h3RocketsImage from '../assets/skills/nia_bath.png'

const SKILL_IMAGES = {
  [Skill.Swap]: swapImage,
  [Skill.CrossRockets]: crossRocketsImage,
  [Skill.H3Rockets]: h3RocketsImage,
  [Skill.HRocket]: hRocketImage
}

export default function SkillOption(): ReactNode {
  return (
    <div className="option skill-option">
      <div className="head">スキル</div>
      <div className="body">
        <SkillItem skill={Skill.Swap} />
        <SkillItem skill={Skill.H3Rockets} />
        <SkillItem skill={Skill.CrossRockets} />
        <SkillItem skill={Skill.HRocket} />
      </div>
    </div>
  )
}

function SkillItem({ skill }: { skill: Skill }): ReactNode {
  const { activeSkill, dispatch } = useApp()
  const handleClick = useCallback(() => {
    if (activeSkill === skill) {
      dispatch({ type: 'setActiveSkill', value: undefined })
    } else {
      dispatch({ type: 'setActiveSkill', value: skill })
    }
  }, [skill, activeSkill, dispatch])
  return (
    <div
      className={classNames('skill-item', {
        'is-active': skill === activeSkill
      })}
      onClick={handleClick}
    >
      <img src={SKILL_IMAGES[skill]} />
    </div>
  )
}
