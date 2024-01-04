import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  width: 10,
  height: 10,
  colors: `
  __brbygb
   y      r
  ygryrryygy
   bb bg yg
   gyrbgyry
   rrg  bgg
   rbbgbrby
    gybrbg
  yyb rg ryy
  bg  ry  yg
  `,
  ices: `
  __000000
   0      0
  0000000000
   00 00 00
   00222200
   002  200
   00222200
    000000
  000 00 000
  00  00  00
  `,
  fallFrom: `
  __......
   .      .
  ..........
   .. .. ..
   ..l..l..
   ...  ...
   ........
    ......
  ... .. ...
  ..  ..  ..
  `,
  links: [
    [
      [2, 2],
      [3, 1]
    ],
    [
      [4, 3],
      [4, 1]
    ],
    [
      [5, 3],
      [5, 1]
    ],
    [
      [6, 3],
      [6, 1]
    ],
    [
      [7, 3],
      [7, 1]
    ],
    [
      [9, 2],
      [8, 1]
    ]
  ]
}

export default config
