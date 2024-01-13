import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  _brpabpp_
  aparparbp
  brpa papr
  rbra rpap
  rbappbbrp
   apbrrab
  
  .... ....
  .... ....
  `,
  mikans: `
  _......._
  .........
  .... ....
  .... ....
  .........
   .......
  
  9.9. 9.9.
  .... ....
  `,
  fallFrom: `
  _......._
  .........
  .... ....
  .... ....
  ....l....
   .......
  
  .... ....
  .... ....
  `,
  links: [
    [
      [2, 5],
      [2, 4]
    ],
    [
      [2, 4],
      [2, 3]
    ],
    [
      [2, 3],
      [2, 2]
    ],
    [
      [2, 2],
      [2, 1]
    ],
    [
      [7, 4],
      [7, 3]
    ],
    [
      [8, 5],
      [8, 4]
    ],
    [
      [8, 4],
      [8, 3]
    ],
    [
      [8, 3],
      [8, 2]
    ]
  ]
}

export default config
