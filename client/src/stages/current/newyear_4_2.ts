import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  ?? ??? ??
  ?? ??? ??
  brb p apr
   arrabrb
  ..pbabr..
  ..rabrp..
     ppa
   .. b ..
   .. r ..
  `,
  mikans: `
  .. ... ..
  .. ... ..
  ... . ...
   .......
  f......f.
  .........
     ...
   p. . p.
   .. . ..
  `,
  fallFrom: `
  .. ... ..
  .. ... ..
  ..r . r..
   ..l.r..
  .........
  .........
     ...
   .. . ..
   .. . ..
  `,
  links: [
    [
      [1, 2],
      [1, 1]
    ],
    [
      [2, 2],
      [2, 1]
    ],
    [
      [3, 4],
      [3, 3]
    ],
    [
      [4, 4],
      [5, 3]
    ],
    [
      [4, 2],
      [4, 1]
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
      [7, 3]
    ],
    [
      [7, 4],
      [7, 3]
    ],
    [
      [8, 2],
      [8, 1]
    ]
  ]
}

export default config
