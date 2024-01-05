import { type ReactNode } from 'react'
import DropOptions from './DropOption'
import KillerOptions from './KillerOption'
import './Options.css'
import SkillOption from './SkillOption'

export default function Options(): ReactNode {
  return (
    <div className="options">
      <SkillOption />
      <KillerOptions />
      <DropOptions />
    </div>
  )
}
