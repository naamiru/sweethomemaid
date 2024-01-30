import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  width: 11,
  height: 11,
  colors: `
  _raba rbba_
  rprapbprrbp
  pb brpab ab
  aaprparprbb
  pbpa b arra
  abbpbbrraar
  praba apabb
  p a bpa r r
  barrpbrbpbp
  r....p....b
   .... ....
  `,
  mikans: `
  _.... ...._
  ...........
  .. ..... ..
  ...........
  .... . ....
  ...........
  ..... .....
  . . ... . .
  ...........
  .k.k..k.k..
   .........
  `,
  fallFrom: `
  _.... ...._
  .....r.....
  .. ..... ..
  ..l.....r..
  .... . ....
  ....r.l....
  ..... .....
  . . .r. . .
  .l.l...l.r.
  ...........
   .........
  `,
  links: [
    [
      [1, 8],
      [1, 7]
    ],
    [
      [1, 7],
      [1, 6]
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
      [2, 6],
      [2, 5]
    ],
    [
      [2, 4],
      [2, 3]
    ],
    [
      [3, 5],
      [3, 4]
    ],
    [
      [4, 6],
      [4, 5]
    ],
    [
      [5, 7],
      [5, 6]
    ],
    [
      [6, 9],
      [6, 8]
    ],
    [
      [6, 4],
      [6, 3]
    ],
    [
      [6, 2],
      [5, 1]
    ],
    [
      [7, 6],
      [8, 5]
    ],
    [
      [8, 6],
      [8, 5]
    ],
    [
      [8, 4],
      [8, 3]
    ],
    [
      [9, 8],
      [9, 7]
    ],
    [
      [9, 6],
      [9, 5]
    ],
    [
      [9, 4],
      [10, 3]
    ],
    [
      [10, 6],
      [10, 5]
    ],
    [
      [10, 5],
      [10, 4]
    ],
    [
      [10, 4],
      [10, 3]
    ],
    [
      [11, 5],
      [11, 4]
    ],
    [
      [11, 4],
      [11, 3]
    ],
    [
      [11, 3],
      [11, 2]
    ]
  ]
}

export default config