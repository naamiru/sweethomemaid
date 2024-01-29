import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  ???? ????
  ???? ????
  aar b bpp
  p..brb..p
   ..apa..
  rprabrbrb
   baprpar
  ..bprbp..
  ..r b b..
  `,
  mikans: `
  .... ....
  .... ....
  ... . ...
  .k....k..
   .......
  .........
   .......
  f......f.
  ... . ...
  `,
  fallFrom: `
  .... ....
  .... ....
  ... r ...
  ...l.r...
   .......
  .........
   .......
  .........
  ... . ...
  `,
  links: [
    [
      [2, 7],
      [2, 6]
    ],
    [
      [4, 4],
      [5, 3]
    ],
    [
      [5, 5],
      [5, 4]
    ],
    [
      [6, 4],
      [5, 3]
    ],
    [
      [8, 7],
      [8, 6]
    ]
  ]
}

export default config
