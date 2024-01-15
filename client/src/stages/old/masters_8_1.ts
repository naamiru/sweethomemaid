import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  width: 8,
  height: 9,
  colors: `
  ggb..yyg
  byy..abb
  aya..yyg
  yab..aay
  gab  ybb
  agg..gag
  ybg..gyb
  ggb..agb
  bab..aga
  `,
  mikans: `
  ...f....
  ........
  ...5....
  ........
  ...  ...
  ...5....
  ........
  ...f....
  ........
  `,
  links: [
    [
      [1, 2],
      [1, 1]
    ],
    [
      [2, 6],
      [2, 5]
    ],
    [
      [2, 2],
      [2, 1]
    ],
    [
      [3, 2],
      [3, 1]
    ],
    [
      [4, 6],
      [3, 5]
    ],
    [
      [7, 2],
      [7, 1]
    ],
    [
      [8, 2],
      [8, 1]
    ]
  ]
}

export default config
