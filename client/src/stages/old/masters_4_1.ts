import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  __rbryr
   byrbrby
  ybbypypyb
  rppbpybpr
  ypybybbyy
  yyrrpprbb
  rrybrpryr
   bprprbr
    ybbpb
  `,
  chains: `
  __00000
   0000000
  003030300
  000000000
  003030300
  000000000
  003030300
   0000000
    00000
  `,
  links: [
    [
      [2, 2],
      [3, 1]
    ],
    [
      [1, 3],
      [2, 2]
    ],
    [
      [1, 4],
      [1, 3]
    ],
    [
      [9, 3],
      [8, 2]
    ]
  ]
}

export default config
