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
  `
}

export default config
