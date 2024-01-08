import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  ryr   byp
  bpybyrppy
  rprprryrb
   yrbryry
   rpbypbr
   pbybrrp
  byprypbyb
  yrybrybpb
  brp   ybp
  `,
  chains: `
  000   000
  000000000
  003000300
   0030300
   0003000
   0030300
  003000300
  000000000
  000   000
  `,
  fallFrom: `
  ...   ...
  .........
  .........
   .r...l.
   ..r.l..
   ...l...
  ...l.l...
  ..r...l..
  ...   ...
  `,
  links: [
    [
      [1, 8],
      [1, 7]
    ],
    [
      [2, 8],
      [2, 7]
    ],
    [
      [2, 7],
      [2, 6]
    ],
    [
      [2, 6],
      [2, 5]
    ],
    [
      [2, 2],
      [2, 1]
    ],
    [
      [3, 6],
      [3, 5]
    ],
    [
      [3, 4],
      [3, 3]
    ],
    [
      [3, 3],
      [3, 2]
    ],
    [
      [3, 2],
      [3, 1]
    ],
    [
      [4, 7],
      [5, 6]
    ],
    [
      [4, 6],
      [4, 5]
    ],
    [
      [4, 5],
      [4, 4]
    ],
    [
      [4, 5],
      [5, 4]
    ],
    [
      [4, 5],
      [3, 4]
    ],
    [
      [4, 3],
      [4, 2]
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
      [5, 4],
      [5, 3]
    ],
    [
      [5, 3],
      [5, 2]
    ],
    [
      [6, 7],
      [6, 6]
    ],
    [
      [6, 7],
      [5, 6]
    ],
    [
      [6, 6],
      [6, 5]
    ],
    [
      [6, 5],
      [7, 4]
    ],
    [
      [6, 3],
      [6, 2]
    ],
    [
      [6, 2],
      [7, 1]
    ],
    [
      [7, 6],
      [7, 5]
    ],
    [
      [7, 4],
      [8, 3]
    ],
    [
      [7, 3],
      [7, 2]
    ],
    [
      [7, 2],
      [7, 1]
    ],
    [
      [8, 8],
      [8, 7]
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
      [9, 8],
      [9, 7]
    ]
  ]
}

export default config