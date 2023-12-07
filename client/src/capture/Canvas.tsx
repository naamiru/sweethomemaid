import { type ReactNode } from 'react'

export default function Canvas(): ReactNode {
  return (
    <canvas
      id="capture-canvas"
      width="64"
      height="64"
      style={{ width: '1px', height: '1px', visibility: 'hidden' }}
    />
  )
}
