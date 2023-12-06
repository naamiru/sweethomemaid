import {
  InvalidMove,
  applyMove,
  type Board,
  type Move,
  type Piece,
  type Position
} from '@sweethomemaid/logic'
import {
  createContext,
  useReducer,
  type Dispatch,
  type FC,
  type ReactNode
} from 'react'
import { createBoard, type StageName } from '../presets'

export type AppState = {
  stage: StageName
  board: Board
  pieces: Piece[][]
  swap?: {
    position: Position
    triggerPosition: Position
  }
}

export type AppAction =
  | {
      type: 'setStage'
      stage: StageName
    }
  | {
      type: 'setSwap'
      position?: Position
      triggerPosition?: Position
    }
  | {
      type: 'move'
      move: Move
    }

const initialStage = 'xmas_4_1'
const initialBoard = createBoard(initialStage)
const initialState: AppState = {
  stage: initialStage,
  board: initialBoard,
  pieces: initialBoard.pieces
}

function reduce(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'setStage':
      return setStage(state, action.stage)
    case 'setSwap':
      return setSwap(state, action.position, action.triggerPosition)
    case 'move':
      return startMoving(state, action.move)
  }
}

function setStage(state: AppState, stage: StageName): AppState {
  if (state.stage === stage) return state
  const board = createBoard(stage)
  return {
    stage,
    board,
    pieces: board.pieces
  }
}

function setSwap(
  state: AppState,
  position: Position | undefined,
  triggerPosition: Position | undefined
): AppState {
  if (position === undefined || triggerPosition === undefined) {
    return {
      ...state,
      swap: undefined
    }
  }
  return {
    ...state,
    swap: {
      position,
      triggerPosition
    }
  }
}

function startMoving(state: AppState, move: Move): AppState {
  try {
    state.board.pieces = state.pieces // reducer 複数回呼ばれる対策
    applyMove(state.board, move)
  } catch (e) {
    if (e instanceof InvalidMove) {
      console.warn('InvalidMove', move)
      return state
    }
    throw e
  }

  return {
    ...state,
    pieces: state.board.pieces
  }
}

export const AppContext = createContext<[AppState, Dispatch<AppAction>]>([
  initialState,
  () => {}
])

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reduce, initialState)
  return (
    <AppContext.Provider value={[state, dispatch]}>
      {children}
    </AppContext.Provider>
  )
}
