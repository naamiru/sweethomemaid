import { deserialize, searchGoodMoves } from '@sweethomemaid/logic'

self.addEventListener('message', event => {
  const board = deserialize(event.data.board)
  const goodMoves = searchGoodMoves(board, event.data.skills)
  self.postMessage(goodMoves)
})

export default {}
