import {
  Board,
  GeneralSet,
  positionToInt,
  suggest,
  type Cell,
  type Killers,
  type Piece,
  type Position,
  type Skill
} from '@sweethomemaid/logic'
import { createContext, type Dispatch } from 'react'
import * as cache from '../cache'
import {
  currentStages,
  stages,
  type CurrentStageName,
  type StageName
} from '../stages'

const STAGE_CACHE_KEY = 'AppContext.stage'
const INITIAL_STAGE: CurrentStageName = currentStages[0]

type Pieces = Piece[][]
type Cells = Cell[][]
type SimpleKillers = [number, number, number]
type History = [Pieces, Cells]

export type AppState = {
  stage: StageName
  board: Board
  pieces: Pieces
  cells: Cells
  suppliedPieces: Piece[]

  suggestedPositions: GeneralSet<Position>

  activeSkill: Skill | undefined
  killers: SimpleKillers
  isPieceSupplied: boolean

  histories: History[]
  historyIndex: number

  isHandlingPiece: boolean
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
      board: Board
      suppliedPieces: Piece[]
    }
  | {
      type: 'setIsHandlingPiece'
      value: boolean
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
      type: 'setActiveSkill'
      value: Skill | undefined
    }
  | {
      type: 'setKillers'
      value: SimpleKillers
    }
  | {
      type: 'setIsPieceSupplied'
      value: boolean
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

const cachedStage = cache.get<StageName>(STAGE_CACHE_KEY)
const initialStage =
  cachedStage !== undefined && stages.includes(cachedStage)
    ? cachedStage
    : INITIAL_STAGE
const initialBoard = Board.create(9, 9)
export const initialState: AppState = {
  stage: initialStage,
  board: initialBoard,
  pieces: initialBoard.pieces,
  cells: initialBoard.cells,
  suppliedPieces: [],
  suggestedPositions: new GeneralSet(positionToInt, suggest(initialBoard)),
  activeSkill: undefined,
  killers: [0, 0, 0],
  isPieceSupplied: false,
  histories: [[initialBoard.pieces, initialBoard.cells]],
  historyIndex: 0,
  isHandlingPiece: false,
  isPlaying: false
}

export function reduce(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'setStage':
      return setStage(state, action.stage, action.board, action.suppliedPieces)
    case 'setIsHandlingPiece':
      return {
        ...state,
        isHandlingPiece: action.value
      }
    case 'setSwap':
      return setSwap(state, action.position, action.triggerPosition)
    case 'moved':
      return moved(state, action.complete)
    case 'setActiveSkill':
      return {
        ...state,
        activeSkill: action.value
      }
    case 'setKillers':
      return setKillers(state, action.value)
    case 'setIsPieceSupplied':
      return {
        ...state,
        isPieceSupplied: action.value
      }
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

function setStage(
  state: AppState,
  stage: StageName,
  board: Board,
  suppliedPieces: Piece[]
): AppState {
  board.killers = simpleKillersToKillers(state.killers)
  cache.set(STAGE_CACHE_KEY, stage)
  return {
    stage,
    board,
    pieces: board.pieces,
    cells: board.cells,
    suppliedPieces,
    suggestedPositions: new GeneralSet(positionToInt, suggest(board)),
    activeSkill: state.activeSkill,
    killers: state.killers,
    isPieceSupplied: state.isPieceSupplied,
    histories: [[board.pieces, board.cells]],
    historyIndex: 0,
    isHandlingPiece: false,
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
          .concat([[state.board.pieces, state.board.cells]]),
        historyIndex: state.historyIndex + 1
      }
    : {}
  return {
    ...state,
    ...historyProps,
    pieces: state.board.pieces,
    cells: state.board.cells,
    suggestedPositions: new GeneralSet(
      positionToInt,
      complete ? suggest(state.board) : []
    ),
    swap: undefined,
    isHandlingPiece: false,
    isPlaying: !complete,
    activeSkill: complete ? undefined : state.activeSkill
  }
}

function setKillers(state: AppState, killers: SimpleKillers): AppState {
  const { board } = state
  board.killers = simpleKillersToKillers(killers)
  return {
    ...state,
    killers
  }
}

function simpleKillersToKillers(killers: SimpleKillers): Killers {
  const killer = { bomb: killers[0], rocket: killers[1], missile: killers[2] }
  return {
    ice: killer,
    chain: killer,
    mouse: killer,
    wood: killer,
    present: killer,
    jelly: killer,
    mikan: killer,
    button: killer,
    web: killer
  }
}

function historyTo(state: AppState, historyIndex: number): AppState {
  if (historyIndex < 0 || historyIndex >= state.histories.length) return state
  const history = state.histories[historyIndex]
  state.board.pieces = history[0]
  state.board.cells = history[1]
  return {
    ...state,
    pieces: state.board.pieces,
    cells: state.board.cells,
    suggestedPositions: new GeneralSet(positionToInt, suggest(state.board)),
    historyIndex
  }
}

function reset(state: AppState): AppState {
  return {
    ...state,
    pieces: state.board.pieces,
    cells: state.board.cells,
    suggestedPositions: new GeneralSet(positionToInt, suggest(state.board)),
    histories: [[state.board.pieces, state.board.cells]],
    historyIndex: 0,
    isHandlingPiece: false,
    isPlaying: false,
    swap: undefined
  }
}

export const AppContext = createContext<[AppState, Dispatch<AppAction>]>([
  initialState,
  () => {}
])
