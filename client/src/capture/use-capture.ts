import { useContext, type Dispatch } from 'react'
import {
  CaptureContext,
  type CaptureAction,
  type CaptureState
} from './context'

export function useCapture(): CaptureState & {
  dispatch: Dispatch<CaptureAction>
} {
  const [state, dispatch] = useContext(CaptureContext)
  return { ...state, dispatch }
}
