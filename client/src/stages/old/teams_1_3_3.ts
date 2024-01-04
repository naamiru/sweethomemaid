import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  width: 10,
  height: 10,
  colors: `
  _gbggybyg
  grr rr rbr
  bg bybg gg
   rgybrygy
  gby gb rgr
  ygbgyyrbby
   grbrbygy
   yb ry rb
   rgr  byb
    rygbyb
  `,
  ices: `
  _00000000
  033 22 330
  03 2222 30
   02000020
  000 00 000
  0000000000
   00000000
   00 00 00
   000  000
    000000
  `,
  fallFrom: `
  _........
  ... .. ...
  .. l..l ..
   .l....r.
  ... .. ...
  ...l..l...
   ........
   .. .. ..
   ..l  r..
    ......
  `,
  links: [
    [
      [1, 2],
      [2, 1]
    ],
    [
      [2, 2],
      [2, 1]
    ],
    [
      [3, 9],
      [3, 8]
    ],
    [
      [3, 4],
      [4, 3]
    ],
    [
      [3, 2],
      [3, 1]
    ],
    [
      [4, 9],
      [3, 8]
    ],
    [
      [5, 4],
      [5, 3]
    ],
    [
      [5, 2],
      [5, 1]
    ],
    [
      [6, 4],
      [6, 3]
    ],
    [
      [6, 2],
      [6, 1]
    ],
    [
      [7, 9],
      [8, 8]
    ],
    [
      [8, 9],
      [8, 8]
    ],
    [
      [8, 4],
      [7, 3]
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
      [9, 2],
      [9, 1]
    ],
    [
      [10, 2],
      [9, 1]
    ]
  ]
}

export default config
