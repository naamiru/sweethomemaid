import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  _bp   bb_
  brapbapbr
  rppapbara
   rabrrpa
  aa  b  rb
  b .. .. r
  a .. .. b
  braaprrbr
   rrbpbpb
  `,
  mikans: `
  _..   .._
  .........
  .........
   .......
  ..  .  ..
  . a. a. .
  . .. .. .
  .........
   .......
  `,
  fallFrom: `
  _..   .._
  .........
   .......
  ..  .  ..
  . .. .. .
  . .. .. .
  .r.....l.
   .......
  `,
  links: [
    [
      [3, 6],
      [2, 5]
    ],
    [
      [3, 2],
      [3, 1]
    ],
    [
      [4, 6],
      [5, 5]
    ],
    [
      [4, 2],
      [3, 1]
    ],
    [
      [6, 6],
      [5, 5]
    ],
    [
      [6, 2],
      [7, 1]
    ],
    [
      [7, 6],
      [8, 5]
    ],
    [
      [7, 2],
      [7, 1]
    ],
    [
      [8, 2],
      [8, 1]
    ],
    [
      [9, 2],
      [8, 1]
    ]
  ]
}

export default config
