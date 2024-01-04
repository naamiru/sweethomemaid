import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  ___bpryrr
  __pybpyyr
  _yybrrbpy
  rpryrybpr
  ryypyrpyr
  yrpprbypy
  bbyybybb
  rbbrypb
  rrppbp
  `,
  chains: `
  ___000000
    0000000
   03030300
  000000000
  003030300
  000000000
  00303030
  0000000
  000000
  `,
  fallFrom: `
  ___......
    .......
   ........
  ..l.r.r..
  .........
  ..l.l.l..
  ........
  ..l.l.l
  ......
  `,
  links: [
    [
      [1, 5],
      [1, 4]
    ],
    [
      [1, 6],
      [1, 5]
    ],
    [
      [1, 7],
      [1, 6]
    ],
    [
      [2, 3],
      [3, 2]
    ],
    [
      [2, 4],
      [2, 3]
    ],
    [
      [2, 5],
      [2, 4]
    ],
    [
      [2, 6],
      [2, 5]
    ],
    [
      [2, 7],
      [2, 6]
    ],
    [
      [2, 8],
      [2, 7]
    ],
    [
      [3, 8],
      [2, 7]
    ],
    [
      [3, 5],
      [3, 4]
    ],
    [
      [3, 8],
      [4, 7]
    ],
    [
      [4, 7],
      [4, 6]
    ],
    [
      [5, 7],
      [5, 6]
    ],
    [
      [5, 8],
      [6, 7]
    ],
    [
      [6, 8],
      [6, 7]
    ],
    [
      [7, 2],
      [7, 1]
    ],
    [
      [8, 2],
      [8, 1]
    ],
    [
      [9, 5],
      [9, 4]
    ]
  ]
}

export default config
