import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  _arr app_
  arpggagpg
  rpaprpaar
  aggrpgrar
  gr ara gg
  gpargaarg
  raaggppgp
  rbbrapgrr
   rar rgp
  `,
  webs: `
  _333 333_
  3.......3
  .........
  .........
  .. ... ..
  .3.3.3.3.
  ..3...3..
  3...3...3
   ..3 3..
  `,
  fallFrom: `
  _... ..._
  ....r....
  .........
  .........
  .. ... ..
  .........
  .........
  .........
   ... ...
  `,
  links: [
    [
      [2, 8],
      [2, 7]
    ],
    [
      [2, 7],
      [2, 6]
    ],
    [
      [2, 6],
      [2, 5]
    ],
    [
      [3, 6],
      [3, 4]
    ],
    [
      [3, 2],
      [3, 1]
    ],
    [
      [5, 6],
      [5, 5]
    ],
    [
      [7, 6],
      [7, 4]
    ]
  ]
}

export default config
