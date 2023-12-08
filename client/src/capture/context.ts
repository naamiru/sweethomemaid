import { createContext, type Dispatch } from 'react'

export type CaptureState = {
  image?: HTMLImageElement
}

export type CaptureAction = {
  type: 'setImage'
  image: HTMLImageElement | undefined
}

export const initialState: CaptureState = {}

export function reduce(
  state: CaptureState,
  action: CaptureAction
): CaptureState {
  switch (action.type) {
    case 'setImage':
      return setImage(state, action.image)
  }
}

function setImage(
  state: CaptureState,
  image: HTMLImageElement | undefined
): CaptureState {
  return {
    ...state,
    image
  }
}

export const CaptureContext = createContext<
  [CaptureState, Dispatch<CaptureAction>]
>([initialState, () => {}])
