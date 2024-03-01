import { Skill } from '@sweethomemaid/logic'
import classNames from 'classnames'
import { useCallback, type ReactNode } from 'react'
import './SkillSelect.css'
import { useApp } from './app/use-app'
import crossRocketsImage from './assets/skills/himariko_bath.png'
import hRocketImage from './assets/skills/himariko_newyear.png'
import swapImage from './assets/skills/iroha_bunny.png'
import pieceBreakImage from './assets/skills/iroha_choco.png'
import vRocketImage from './assets/skills/kanon_easter.png'
import mixMissileImage from './assets/skills/nagi_bunny.png'
import h3RocketsImage from './assets/skills/nia_bath.png'
import bombImage from './assets/skills/scarlet_bunny.png'
import delColorImage from './assets/skills/tsumugi_bunny.png'

const SKILL_IMAGES = {
  [Skill.Swap]: swapImage,
  [Skill.CrossRockets]: crossRocketsImage,
  [Skill.H3Rockets]: h3RocketsImage,
  [Skill.HRocket]: hRocketImage,
  [Skill.VRocket]: vRocketImage,
  [Skill.DelColor]: delColorImage,
  [Skill.PieceBreak]: pieceBreakImage,
  [Skill.Bomb]: bombImage,
  [Skill.MixMissile]: mixMissileImage
}

const SKILL_NAME = {
  [Skill.Swap]: 'ピースチェンジ',
  [Skill.CrossRockets]: 'ファストクロスロケット',
  [Skill.H3Rockets]: 'ファスト3WAYロケット（横）',
  [Skill.HRocket]: 'ファストロケット（横）',
  [Skill.VRocket]: 'ファストロケット（縦）',
  [Skill.DelColor]: 'ファストスペシャル',
  [Skill.PieceBreak]: 'ピースブレイク',
  [Skill.Bomb]: 'ファストボム',
  [Skill.MixMissile]: 'ファストミックスミサイル'
}

export default function SkillSelect(): ReactNode {
  return (
    <div className="skill-select">
      <div className="head">スキル</div>
      <div className="body">
        <SkillItem skill={Skill.Swap} />
        <SkillItem skill={Skill.DelColor} />
        <SkillItem skill={Skill.Bomb} />
        <SkillItem skill={Skill.MixMissile} />
        <SkillItem skill={Skill.PieceBreak} />
        <SkillItem skill={Skill.H3Rockets} />
        <SkillItem skill={Skill.CrossRockets} />
        <SkillItem skill={Skill.HRocket} />
        <SkillItem skill={Skill.VRocket} />
        <div className="skill-item is-stub" />
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
      aria-label={SKILL_NAME[skill]}
      data-microtip-position="top"
      role="tooltip"
    >
      <img src={SKILL_IMAGES[skill]} />
    </div>
  )
}
