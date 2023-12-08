import { type Board, type Piece, type Position } from '@sweethomemaid/logic'
import { createContext, type Dispatch } from 'react'
import { createBoard, type StageName } from '../presets'

type Pieces = Piece[][]

export type AppState = {
  stage: StageName
  board: Board
  pieces: Pieces

  histories: Pieces[]
  historyIndex: number

  isPlaying: boolean
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
      type: 'moved'
      complete: boolean
    }
  | {
      type: 'historyBack'
    }
  | {
      type: 'historyBackFirst'
    }
  | {
      type: 'historyForward'
    }
  | {
      type: 'historyForwardLast'
    }
  | {
      type: 'reset'
    }

const initialStage = 'xmas_4_1'
const initialBoard = createBoard(initialStage)
export const initialState: AppState = {
  stage: initialStage,
  board: initialBoard,
  pieces: initialBoard.pieces,
  histories: [initialBoard.pieces],
  historyIndex: 0,
  isPlaying: false
}

export function reduce(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'setStage':
      return setStage(state, action.stage)
    case 'setSwap':
      return setSwap(state, action.position, action.triggerPosition)
    case 'moved':
      return moved(state, action.complete)
    case 'historyBack':
      return historyTo(state, state.historyIndex - 1)
    case 'historyBackFirst':
      return historyTo(state, 0)
    case 'historyForward':
      return historyTo(state, state.historyIndex + 1)
    case 'historyForwardLast':
      return historyTo(state, state.histories.length - 1)
    case 'reset':
      return reset(state)
  }
}

function setStage(state: AppState, stage: StageName): AppState {
  if (state.stage === stage) return state
  const board = createBoard(stage)
  return {
    stage,
    board,
    pieces: board.pieces,
    histories: [board.pieces],
    historyIndex: 0,
    isPlaying: false
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

function moved(state: AppState, complete: boolean): AppState {
  const historyProps: Partial<AppState> = complete
    ? {
        histories: state.histories
          .slice(0, state.historyIndex + 1)
          .concat([state.board.pieces]),
        historyIndex: state.historyIndex + 1
      }
    : {}
  return {
    ...state,
    ...historyProps,
    pieces: state.board.pieces,
    isPlaying: !complete
  }
}

function historyTo(state: AppState, historyIndex: number): AppState {
  if (historyIndex < 0 || historyIndex >= state.histories.length) return state
  state.board.pieces = state.histories[historyIndex]
  return {
    ...state,
    pieces: state.board.pieces,
    historyIndex
  }
}

function reset(state: AppState): AppState {
  return {
    ...state,
    pieces: state.board.pieces,
    histories: [state.board.pieces],
    historyIndex: 0,
    isPlaying: false,
    swap: undefined
  }
}

export const AppContext = createContext<[AppState, Dispatch<AppAction>]>([
  initialState,
  () => {}
])
