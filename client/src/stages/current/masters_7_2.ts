import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  __bbapg
   pgbggpb
  .apg.apa.
  .ab.a.ga.
   .p...g.
  .ab.b.ab.
  .bga.apb.
  .bappbpa.
   .......
  `,
  buttons: `
  __00000
   0000000
  300030003
  300303003
   3033303
  300303003
  300030003
  300000003
   3333333
  `,
  fallFrom: `
  __.....
   .......
  .........
  ....r....
   .......
  .........
  ...l.l...
  ....r....
   .......
  `,
  links: [
    [
      [1, 6],
      [2, 5]
    ],
    [
      [1, 3],
      [2, 2]
    ]
  ]
}

export default config
