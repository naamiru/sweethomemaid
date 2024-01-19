import {
  DEFAULT_CONDITIONS,
  TEAMS_CONDITIONS,
  deserialize,
  searchGoodMoves
} from '@sweethomemaid/logic'

self.addEventListener('message', event => {
  const board = deserialize(event.data.board)
  const goodMoves = searchGoodMoves(
    board,
    event.data.skills,
    event.data.isTeams === true ? TEAMS_CONDITIONS : DEFAULT_CONDITIONS
  )
  self.postMessage(goodMoves)
})

export default {}
