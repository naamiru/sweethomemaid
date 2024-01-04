import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  width: 10,
  height: 10,
  colors: `
  __rygyyr
  ybgrgybryr
  gyb rb ggb
  rbybrggrbr
  y yygrrb y
  y        g
  r grgrgy g
  gbgyggbrby
  gbrybbyyrb
   rgrybybr
  `,
  ices: `
  __000000
  0000000000
  000 00 000
  0000000000
  0 000000 0
  0        0
  0 222222 0
  0222222220
  0000000000
   00000000
  `,
  fallFrom: `
  __......
  ..........
  ... .. ...
  ...r..r...
  . ...... .
  .        .
  . ...... .
  .r......l.
  ..........
   ........
  `,
  links: [
    [
      [1, 8],
      [1, 7]
    ],
    [
      [3, 7],
      [3, 5]
    ],
    [
      [3, 2],
      [3, 1]
    ],
    [
      [4, 7],
      [4, 5]
    ],
    [
      [5, 7],
      [5, 5]
    ],
    [
      [5, 2],
      [5, 1]
    ],
    [
      [6, 7],
      [6, 5]
    ],
    [
      [6, 2],
      [6, 1]
    ],
    [
      [7, 7],
      [7, 5]
    ],
    [
      [8, 7],
      [8, 5]
    ],
    [
      [8, 2],
      [8, 1]
    ],
    [
      [10, 8],
      [10, 7]
    ]
  ]
}

export default config
