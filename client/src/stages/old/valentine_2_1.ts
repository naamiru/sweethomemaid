import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  aayp pygp
  gagag apg
  yypagy pa
  ypggpyg y
   paappgy
  a yygapay
  pa apygMg
  pgp gaMpM
  yyap gaMp
  `,
  jellies: `
  .... ...2
  ..... ...
  ...... ..
  ....... .
   .......
  . .....22
  .. ...222
  ... .2222
  2... 2222
  `,
  fallFrom: `
  .... ....
  ....l ...
  .....l ..
  ......l .
   ......l
  . .......
  .r ......
  ..r .....
  ...r ....
  `,
  links: [
    [
      [1, 7],
      [1, 6]
    ],
    [
      [2, 8],
      [2, 7]
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
      [3, 6],
      [3, 5]
    ],
    [
      [3, 4],
      [3, 3]
    ],
    [
      [3, 3],
      [3, 2]
    ],
    [
      [4, 7],
      [4, 6]
    ],
    [
      [5, 2],
      [6, 1]
    ],
    [
      [6, 3],
      [7, 2]
    ],
    [
      [7, 8],
      [7, 7]
    ],
    [
      [7, 7],
      [7, 6]
    ],
    [
      [7, 6],
      [7, 5]
    ],
    [
      [7, 4],
      [8, 3]
    ],
    [
      [8, 5],
      [9, 4]
    ],
    [
      [8, 3],
      [8, 2]
    ],
    [
      [9, 4],
      [9, 3]
    ],
    [
      [9, 3],
      [9, 2]
    ],
    [
      [9, 2],
      [9, 1]
    ]
  ]
}

export default config
