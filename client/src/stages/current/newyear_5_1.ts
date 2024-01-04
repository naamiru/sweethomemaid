import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  rbpb babb
  rrar papa
  bprb abrr
  apap brbb
  
  .... ....
  ....r....
  aabprapra
  bprr barb
  `,
  mikans: `
  .... ....
  .... ....
  .... ....
  .... ....

  a.5. 5.a.
  .........
  .........
  .... ....
  `,
  upstream: `
  llll rrrr
  llll rrrr
  llll rrrr
  llll rrrr

  uuuu uuuu
  uuuuuuuuu
  uuuuuuuuu
  uuuu uuuu
  `,
  fallFrom: `
  .... ....
  .... ....
  .... ....
  .... ....

  .... ....
  ....l....
  .........
  .ll. .rr.
  `,
  links: [
    [
      [1, 6],
      [4, 4]
    ],
    [
      [4, 4],
      [3, 4]
    ],
    [
      [3, 4],
      [2, 4]
    ],
    [
      [2, 4],
      [1, 4]
    ],
    [
      [2, 6],
      [4, 3]
    ],
    [
      [4, 3],
      [3, 3]
    ],
    [
      [3, 3],
      [3, 2]
    ],
    [
      [3, 6],
      [4, 2]
    ],
    [
      [4, 2],
      [3, 2]
    ],
    [
      [6, 6],
      [6, 1]
    ],
    [
      [6, 1],
      [7, 1]
    ],
    [
      [7, 1],
      [8, 1]
    ],
    [
      [8, 1],
      [9, 1]
    ],
    [
      [7, 6],
      [6, 2]
    ],
    [
      [6, 2],
      [7, 2]
    ],
    [
      [7, 2],
      [8, 2]
    ],
    [
      [8, 6],
      [6, 3]
    ],
    [
      [6, 3],
      [7, 3]
    ],
    [
      [9, 6],
      [6, 4]
    ]
  ]
}

export default config
