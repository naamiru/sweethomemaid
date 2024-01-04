import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  _rpbbpab
  rbp a rba
  rbrrbpapp
   ..rpp..
   ..   ..
  .... ....
  .........
   .......
   .......
  `,
  mikans: `
  _.......
  ... . ...
  .........
   a....a.
   ..   ..
  k... ..k.
  .........
   a....a.
   .......
  `,
  fallFrom: `
  _.......
  ... . ...
  ...l.r...
   .......
   ..   ..
  .... ....
  ....l....
   .......
   .......
  `,
  links: [
    [
      [2, 3],
      [2, 2]
    ],
    [
      [2, 2],
      [2, 1]
    ],
    [
      [3, 5],
      [3, 4]
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
      [5, 3],
      [5, 2]
    ],
    [
      [7, 2],
      [7, 1]
    ],
    [
      [8, 2],
      [8, 1]
    ]
  ]
}

export default config
