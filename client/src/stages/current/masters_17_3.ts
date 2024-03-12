import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  pbaprbrpb
  raapbaabp
  pb bBp ar
  ara p prb
  abHpSaVap
  bra b bbr
  bp aMb aa
  prarbrbrr
  rpbprapbr
  `,
  chains: `
  .........
  .........
  .. .3. ..
  ... . ...
  ..3.3.3..
  ... . ...
  .. .3. ..
  .........
  .........
  `,
  fallFrom: `
  .........
  .........
  .. ... ..
  ..l l r..
  ...l.r...
  ..k r r..
  .. r.r ..
  ..l.r.r..
  .........
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
      [1, 3],
      [1, 2]
    ],
    [
      [1, 2],
      [1, 1]
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
      [3, 4],
      [2, 3]
    ],
    [
      [4, 8],
      [4, 7]
    ],
    [
      [4, 7],
      [3, 6]
    ],
    [
      [4, 5],
      [5, 4]
    ],
    [
      [5, 8],
      [5, 7]
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
      [5, 6],
      [4, 5]
    ],
    [
      [5, 5],
      [5, 4]
    ],
    [
      [6, 8],
      [6, 7]
    ],
    [
      [6, 7],
      [5, 6]
    ],
    [
      [6, 2],
      [6, 1]
    ],
    [
      [7, 5],
      [7, 4]
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
      [8, 2],
      [8, 1]
    ],
    [
      [9, 2],
      [9, 1]
    ]
  ]
}

export default config
