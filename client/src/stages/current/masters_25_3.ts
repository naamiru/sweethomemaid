import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  _aagagar_
  gppgpgrgr
  grrpararg
  rgappgrpp
   gr   ap
  ....a....
  ....p....
  rpapragag
   grppagr
  `,
  printers: `
  _......._
  .........
  .........
  .........
   ..   ..
  1.1..1.1.
  .........
  .........
   .......
  `,
  links: [
    [
      [1, 6],
      [1, 4]
    ],
    [
      [4, 6],
      [4, 4]
    ],
    [
      [5, 6],
      [5, 4]
    ],
    [
      [6, 6],
      [6, 4]
    ],
    [
      [9, 6],
      [9, 4]
    ]
  ]
}

export default config
