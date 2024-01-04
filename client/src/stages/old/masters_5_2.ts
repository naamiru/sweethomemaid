import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  ygybgbbgy
  ry.ggrb.g
  bgyrbggrr
  ybggyg
  gyyb.b
  ybyggr
  ggryrbgyr
  ry.ggrr.g
  bbgyrybyb
  `,
  presents: `
  000000000
  005000050
  000000000
  000000
  0000f0
  000000
  000000000
  005000050
  000000000
  `,
  fallFrom: `
  .........
  .........
  ..r....r.
  ......
  ......
  ....r.
  .........
  .........
  ..l....r.
  `,
  links: [
    [
      [1, 8],
      [1, 7]
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
      [2, 5],
      [2, 4]
    ],
    [
      [2, 2],
      [2, 1]
    ],
    [
      [3, 8],
      [3, 7]
    ],
    [
      [3, 2],
      [3, 1]
    ],
    [
      [4, 8],
      [4, 7]
    ],
    [
      [4, 7],
      [4, 6]
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
      [4, 2],
      [4, 1]
    ],
    [
      [5, 8],
      [5, 7]
    ],
    [
      [5, 6],
      [5, 5]
    ],
    [
      [5, 6],
      [6, 5]
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
      [5, 2],
      [5, 1]
    ],
    [
      [6, 8],
      [6, 7]
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
      [6, 3],
      [6, 2]
    ],
    [
      [6, 2],
      [6, 1]
    ],
    [
      [7, 7],
      [7, 3]
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
      [8, 7],
      [8, 3]
    ],
    [
      [8, 3],
      [8, 2]
    ],
    [
      [8, 3],
      [9, 2]
    ],
    [
      [8, 2],
      [8, 1]
    ],
    [
      [9, 7],
      [9, 3]
    ],
    [
      [9, 3],
      [9, 2]
    ],
    [
      [9, 2],
      [9, 1]
    ]
  ]
}

export default config
