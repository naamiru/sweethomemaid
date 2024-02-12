import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  width: 9,
  height: 8,
  colors: `
  _ypr ryy_
  yppyrbrpy
  ryrrbpbpp
  py.. ..by
  bb.. ..rp
  prrypypby
  ybbrprypb
  rpy   pyb
  `,
  printers: `
  _... ..._
  .........
  .........
  ..1. 1...
  .... ....
  .........
  .........
  ...   ...
  `,
  fallFrom: `
  _... ..._
  ....l....
  .........
  .... ....
  .... ....
  ....l....
  .........
  ...   ...
  `,
  links: [
    [
      [1, 7],
      [1, 6]
    ],
    [
      [1, 6],
      [1, 5]
    ],
    [
      [1, 3],
      [1, 2]
    ],
    [
      [2, 7],
      [2, 6]
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
      [8, 5],
      [8, 4]
    ],
    [
      [8, 2],
      [8, 1]
    ],
    [
      [9, 7],
      [9, 6]
    ],
    [
      [9, 6],
      [9, 5]
    ],
    [
      [9, 3],
      [9, 2]
    ]
  ]
}

export default config
