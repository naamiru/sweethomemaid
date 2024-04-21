import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  width: 11,
  height: 11,
  colors: `
  rpara ggrpa
  rarapgagaar
  agapgrppgrg
  rarprgraapr
  prgagrggrrg
   rpga rpgg
  aarappgrrap
  grppgappgpa
  pagargrgrpg
  rggragagaar
  garaa aprpp
  `,
  webs: `
  ..... a.a.a
  .......aaa.
  ......aaaaa
  .......aaa.
  ......a.a.a
   .... ....
  a.a.a......
  .aaa.......
  aaaaa......
  .aaa.......
  a.a.a .....
  `,
  fallFrom: `
  ..... .....
  ...........
  ...........
  ...........
  ...........
   .... ....
  .....r.....
  ...........
  ...........
  ...........
  ..... .....
  `,
  links: [
    [
      [1, 1],
      [7, 11]
    ],
    [
      [2, 1],
      [8, 11]
    ],
    [
      [3, 1],
      [9, 11]
    ],
    [
      [4, 1],
      [10, 11]
    ],
    [
      [5, 1],
      [11, 11]
    ]
  ]
}

export default config
