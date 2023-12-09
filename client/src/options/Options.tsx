import { type ReactNode } from 'react'
import KillerOptions from './KillerOption'
import './Options.css'
import SkillOption from './SkillOption'

export default function Options(): ReactNode {
  return (
    <div className="options">
      <SkillOption />
      <KillerOptions />
    </div>
  )
}
