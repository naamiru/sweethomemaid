import { Suspense, lazy, type ReactNode } from 'react'
import Canvas from './Canvas'
import CaptureButton from './CaptureButton'
import { CaptureProvider } from './provider'
import { useCapture } from './use-capture'
const ImagePlacer = lazy(async () => await import('./ImagePlacer'))

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
      {image !== undefined && (
        <Suspense>
          <ImagePlacer image={image} />
        </Suspense>
      )}
    </>
  )
}
