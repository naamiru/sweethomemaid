import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  _yr. .aa_
  rrg...ygr
  yar...rry
  yay...gar
  rgg...agg
  aga...yar
  yry...gya
  raa...ryr
   gr. .ag
  `,
  peanuts: `
  _..2 2.._
  ...232...
  ...232...
  ...232...
  ...232...
  ...232...
  ...232...
  ...232...
   ..2 2..
  `,
  fallFrom: `
  _... ..._
  ....l....
  .........
  .........
  .........
  .........
  .........
  .........
   ... ...
  `,
  links: [
    [
      [1, 6],
      [1, 5]
    ],
    [
      [1, 5],
      [1, 4]
    ],
    [
      [1, 4],
      [1, 3]
    ],
    [
      [1, 3],
      [1, 2]
    ],
    [
      [2, 8],
      [2, 7]
    ],
    [
      [2, 4],
      [2, 3]
    ],
    [
      [3, 8],
      [3, 7]
    ],
    [
      [4, 7],
      [4, 6]
    ],
    [
      [4, 4],
      [4, 3]
    ],
    [
      [5, 7],
      [5, 6]
    ],
    [
      [5, 6],
      [5, 5]
    ],
    [
      [6, 7],
      [6, 6]
    ],
    [
      [6, 6],
      [6, 5]
    ],
    [
      [6, 5],
      [6, 4]
    ],
    [
      [6, 4],
      [6, 3]
    ],
    [
      [7, 7],
      [7, 6]
    ],
    [
      [7, 4],
      [7, 3]
    ],
    [
      [8, 7],
      [8, 6]
    ],
    [
      [8, 6],
      [8, 5]
    ],
    [
      [8, 5],
      [8, 4]
    ],
    [
      [9, 6],
      [9, 5]
    ],
    [
      [9, 5],
      [9, 4]
    ]
  ]
}

export default config
