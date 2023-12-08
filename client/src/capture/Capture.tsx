import { type ReactNode } from 'react'
import Canvas from './Canvas'
import CaptureButton from './CaptureButton'
import ImagePlacer from './ImagePlacer'
import { CaptureProvider } from './provider'
import { useCapture } from './use-capture'

export default function Capture(): ReactNode {
  return (
    <CaptureProvider>
      <CaptureInner />
    </CaptureProvider>
  )
}

function CaptureInner(): ReactNode {
  const { image } = useCapture()
  return (
    <>
      <CaptureButton />
      <Canvas />
      {image !== undefined && <ImagePlacer image={image} />}
    </>
  )
}
