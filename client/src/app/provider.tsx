import { useReducer, type FC, type ReactNode } from 'react'
import { AppContext, initialState, reduce } from './context'

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reduce, initialState)
  return (
    <AppContext.Provider value={[state, dispatch]}>
      {children}
    </AppContext.Provider>
  )
}
