import { useReducer, type FC, type ReactNode } from 'react'
import { CaptureContext, initialState, reduce } from './context'

export const CaptureProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reduce, initialState)
  return (
    <CaptureContext.Provider value={[state, dispatch]}>
      {children}
    </CaptureContext.Provider>
  )
}
