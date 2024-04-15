import { Skill } from '@sweethomemaid/logic'
import classNames from 'classnames'
import { useCallback, type ReactNode } from 'react'
import './SkillSelect.css'
import { useApp } from './app/use-app'
import crossRocketsImage from './assets/skills/himariko_bath.png'
import mixBombImage from './assets/skills/himariko_ekiben.png'
import hRocketImage from './assets/skills/himariko_newyear.png'
import swapImage from './assets/skills/iroha_bunny.png'
import pieceBreakImage from './assets/skills/iroha_choco.png'
import missileImage from './assets/skills/iroha_ekiben.png'
import v3RocketsImage from './assets/skills/kanon_bunny.png'
import vRocketImage from './assets/skills/kanon_easter.png'
import mixMissileImage from './assets/skills/nagi_bunny.png'
import h3RocketsImage from './assets/skills/nia_bath.png'
import bombImage from './assets/skills/scarlet_bunny.png'
import delColorImage from './assets/skills/tsumugi_bunny.png'

const SKILL_IMAGES = {
  [Skill.Swap]: swapImage,
  [Skill.CrossRockets]: crossRocketsImage,
  [Skill.H3Rockets]: h3RocketsImage,
  [Skill.V3Rockets]: v3RocketsImage,
  [Skill.HRocket]: hRocketImage,
  [Skill.VRocket]: vRocketImage,
  [Skill.DelColor]: delColorImage,
  [Skill.PieceBreak]: pieceBreakImage,
  [Skill.Bomb]: bombImage,
  [Skill.MixMissile]: mixMissileImage,
  [Skill.Missile]: missileImage,
  [Skill.MixBomb]: mixBombImage
}

const SKILL_NAME = {
  [Skill.Swap]: 'ピースチェンジ',
  [Skill.CrossRockets]: 'ファストクロスロケット',
  [Skill.H3Rockets]: 'ファスト3WAYロケット（横）',
  [Skill.V3Rockets]: 'ファスト3WAYロケット（縦）',
  [Skill.HRocket]: 'ファストロケット（横）',
  [Skill.VRocket]: 'ファストロケット（縦）',
  [Skill.DelColor]: 'ファストスペシャル',
  [Skill.PieceBreak]: 'ピースブレイク',
  [Skill.Bomb]: 'ファストボム',
  [Skill.MixMissile]: 'ファストミックスミサイル',
  [Skill.Missile]: 'ファストミサイル',
  [Skill.MixBomb]: 'ファストミックスボム'
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
        <SkillItem skill={Skill.V3Rockets} />
        <SkillItem skill={Skill.H3Rockets} />
        <SkillItem skill={Skill.CrossRockets} />
        <SkillItem skill={Skill.HRocket} />
        <SkillItem skill={Skill.VRocket} />
        <SkillItem skill={Skill.MixBomb} />
        <SkillItem skill={Skill.Missile} />
        <SkillItem skill={Skill.PieceBreak} />
        <div className="skill-item is-stub" />
        <div className="skill-item is-stub" />
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
