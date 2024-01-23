import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  .rbr abr.
  .ryyraya.
  .y ary a.
  .a byb r.
  .yaarbba.
  .by...ay.
  .a.. ..y.
  ... . ...
   .......
  `,
  bubbles: `
  2... ...b
  2.......b
  2. ... .b
  2. ... .b
  2.......b
  2..2bb..b
  2.22 bb.b
  222 2 bbb
   2222bbb
  `,
  fallFrom: `
  .... ....
  ....l....
  .. ... ..
  .. ... ..
  ..r...r..
  .........
  .... ....
  ... r ...
   ..r.r..
  `,
  links: [
    [
      [2, 8],
      [2, 7]
    ],
    [
      [3, 8],
      [3, 7]
    ],
    [
      [3, 5],
      [2, 4]
    ],
    [
      [5, 8],
      [6, 7]
    ],
    [
      [6, 5],
      [6, 4]
    ],
    [
      [7, 8],
      [7, 7]
    ],
    [
      [7, 5],
      [6, 4]
    ]
  ]
}

export default config
