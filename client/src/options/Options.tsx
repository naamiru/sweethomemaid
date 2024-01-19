import classNames from 'classnames'
import { useCallback, useState, type ReactNode } from 'react'
import DropOptions from './DropOption'
import KillerOptions from './KillerOption'
import './Options.css'

export default function Options(): ReactNode {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => {
    setIsOpen(true)
  }, [])
  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <>
      <button className="button is-white" onClick={open}>
        <span className="icon is-small">
          <i className="fas fa-gear" />
        </span>
      </button>
      <div
        className={classNames('modal options-modal', { 'is-active': isOpen })}
      >
        <div className="modal-background" onClick={close} />
        <div className="modal-content">
          <div className="box">
            <div className="options">
              <div className="head">設定</div>
              <KillerOptions />
              <DropOptions />
            </div>
          </div>
        </div>
        <button className="modal-close is-large" onClick={close} />
      </div>
    </>
  )
}
