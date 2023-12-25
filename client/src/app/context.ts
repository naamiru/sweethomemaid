import {
  GeneralSet,
  positionToInt,
  suggest,
  type Board,
  type Killers,
  type Piece,
  type Position,
  type Skill
} from '@sweethomemaid/logic'
import { createContext, type Dispatch } from 'react'
import * as cache from '../cache'
import { createBoard, stages, type StageName } from '../presets'

const STAGE_CACHE_KEY = 'AppContext.stage'
const INITIAL_STAGE = 'teams_3_1'

type Pieces = Piece[][]
type SimpleKillers = [number, number, number]

export type AppState = {
  stage: StageName
  board: Board
  pieces: Pieces

  suggestedPositions: GeneralSet<Position>

  activeSkill: Skill | undefined
  killers: SimpleKillers

  histories: Pieces[]
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
const initialBoard = createBoard(initialStage)
export const initialState: AppState = {
  stage: initialStage,
  board: initialBoard,
  pieces: initialBoard.pieces,
  suggestedPositions: new GeneralSet(positionToInt, suggest(initialBoard)),
  activeSkill: undefined,
  killers: [0, 0, 0],
  histories: [initialBoard.pieces],
  historyIndex: 0,
  isHandlingPiece: false,
  isPlaying: false
}

export function reduce(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'setStage':
      return setStage(state, action.stage)
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

  if (!stages.includes(stage)) stage = INITIAL_STAGE

  const board = createBoard(stage)
  board.killers = simpleKillersToKillers(state.killers)
  cache.set(STAGE_CACHE_KEY, stage)
  return {
    stage,
    board,
    pieces: board.pieces,
    suggestedPositions: new GeneralSet(positionToInt, suggest(board)),
    activeSkill: state.activeSkill,
    killers: state.killers,
    histories: [board.pieces],
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
          .concat([state.board.pieces]),
        historyIndex: state.historyIndex + 1
      }
    : {}
  return {
    ...state,
    ...historyProps,
    pieces: state.board.pieces,
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
    jelly: killer
  }
}

function historyTo(state: AppState, historyIndex: number): AppState {
  if (historyIndex < 0 || historyIndex >= state.histories.length) return state
  state.board.pieces = state.histories[historyIndex]
  return {
    ...state,
    pieces: state.board.pieces,
    suggestedPositions: new GeneralSet(positionToInt, suggest(state.board)),
    historyIndex
  }
}

function reset(state: AppState): AppState {
  return {
    ...state,
    pieces: state.board.pieces,
    suggestedPositions: new GeneralSet(positionToInt, suggest(state.board)),
    histories: [state.board.pieces],
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
