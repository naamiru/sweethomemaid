import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  _bbp.ara_
  .rrbrbar.
  braprrbbr
  pbp..bbpb
  ppr..barp
  bbrbaprab
  papbrpaba
  .brarrap.
   rpa.bpp
  `,
  mikans: `
  _......._
  .........
  .........
  ...z.....
  .........
  .........
  .........
  .........
   .......
  `,
  presents: `
  _...3..._
  3.......3
  .........
  .........
  .........
  .........
  .........
  3.......3
   ...3...
  `,
  fallFrom: `
  _......._
  ....l....
  .........
  .........
  .........
  .........
  .........
  .........
   .......
  `,
  links: [
    [
      [2, 4],
      [2, 3]
    ],
    [
      [3, 7],
      [3, 6]
    ],
    [
      [3, 2],
      [3, 1]
    ],
    [
      [4, 7],
      [4, 6]
    ],
    [
      [4, 5],
      [4, 4]
    ],
    [
      [4, 2],
      [4, 1]
    ],
    [
      [5, 7],
      [5, 6]
    ],
    [
      [5, 4],
      [5, 3]
    ],
    [
      [6, 7],
      [6, 6]
    ]
  ]
}

export default config
