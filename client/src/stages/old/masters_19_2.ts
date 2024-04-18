import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  bgpgbgpgp
  abgbabbpa
  gbppgapbg
  bpgbMbgga
  pabMSMppa
  bggbMgpgg
  pgagppbpp
  pagpapagg
  bapbgapbp
  `,
  jellies: `
  .........
  .........
  ....6....
  ...696...
  336999633
  ...696...
  ....6....
  .........
  .........
  `,
  fallFrom: `
  .........
  .........
  .........
  .........
  .........
  .........
  .........
  ....l....
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
      [2, 4],
      [2, 3]
    ],
    [
      [3, 8],
      [3, 7]
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
      [4, 8],
      [4, 7]
    ],
    [
      [4, 4],
      [4, 3]
    ],
    [
      [4, 3],
      [4, 2]
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
      [6, 3],
      [6, 2]
    ],
    [
      [6, 2],
      [6, 1]
    ],
    [
      [7, 8],
      [7, 7]
    ],
    [
      [7, 7],
      [7, 6]
    ],
    [
      [7, 5],
      [7, 4]
    ],
    [
      [7, 4],
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