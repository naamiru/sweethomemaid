import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  ???? gagp
  ???? paya
  ???? yppg
  ???? yyap
   ??   ..
  ???? ....
  ???? ....
  ???? ....
  ???? ....
  `,
  jellies: `
  .... 2222
  .... 2222
  .... 2222
  .... 2222
   ..   ..
  .... ....
  .... ....
  .... ....
  .... ....
  `,
  links: [
    [
      [1, 8],
      [1, 7]
    ],
    [
      [1, 6],
      [2, 5]
    ],
    [
      [3, 6],
      [3, 5]
    ],
    [
      [6, 6],
      [7, 5]
    ],
    [
      [6, 3],
      [6, 2]
    ],
    [
      [7, 6],
      [7, 5]
    ],
    [
      [7, 4],
      [7, 3]
    ],
    [
      [8, 6],
      [8, 5]
    ],
    [
      [8, 4],
      [8, 3]
    ]
  ]
}

export default config
