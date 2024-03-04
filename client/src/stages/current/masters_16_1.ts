import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  _aybgbab_
  gyaybbygy
  yga a byy
  abg. .yba
  byg . bgy
  yab. .gba
  gyy g ayb
  babgbggby
   baygyyb
  `,
  woods: `
  _......._
  .........
  ... . ...
  ...3 3...
  ... 3 ...
  ...3 3...
  ... . ...
  .........
   .......
  `,
  fallFrom: `
  _......._
  .........
  ... . ...
  ...l r...
  ... l ...
  ...l r...
  ... l ...
  ...l.r...
   .......
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
      [4, 6],
      [5, 5]
    ],
    [
      [4, 4],
      [3, 3]
    ],
    [
      [6, 8],
      [5, 7]
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
      [7, 2],
      [7, 1]
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
    ]
  ]
}

export default config
