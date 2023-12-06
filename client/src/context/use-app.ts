import { useContext, type Dispatch } from 'react'
import { AppContext, type AppAction, type AppState } from './app'

export function useApp(): AppState & { dispatch: Dispatch<AppAction> } {
  const [state, dispatch] = useContext(AppContext)
  return { ...state, dispatch }
}
