import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  agyg ggag
  ppya payp
  aagp ggag
  apyg gppg
   gg   ..
  payp ....
  ypgg ....
  ayaa ....
  ppag ....
  `,
  jellies: `
  .... 1111
  .... 1111
  .... 1111
  .... 1111
   ..   ..
  1111 ....
  1111 ....
  1111 ....
  1111 ....
  `,
  links: [
    [
      [1, 3],
      [1, 2]
    ],
    [
      [1, 5],
      [1, 4]
    ],
    [
      [1, 4],
      [1, 3]
    ],
    [
      [2, 5],
      [2, 4]
    ],
    [
      [2, 4],
      [2, 3]
    ],
    [
      [6, 8],
      [6, 7]
    ],
    [
      [6, 1],
      [1, 9]
    ],
    [
      [6, 6],
      [7, 5]
    ],
    [
      [7, 1],
      [2, 9]
    ],
    [
      [8, 6],
      [8, 5]
    ],
    [
      [8, 1],
      [3, 9]
    ],
    [
      [9, 1],
      [4, 9]
    ]
  ]
}

export default config
