import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  .... prpy
  ryrb pbpy
  pypr bybp
  ybyb bryy
  rbpr rbpr
  rrpy.ypbr
  brbp.ryry
  ybrp.rppr
  yyrr.bpyy
  `,
  eggs: `
  3333 ....
  .... ....
  .... ....
  .... ....
  .... ....
  ....3....
  ....3....
  ....3....
  ....3....
  `,
  upstream: `
  uuuu dddd
  uuuu dddd
  uuuu dddd
  uuuu dddd
  uuuu dddd
  uuuullddd
  uuulllldd
  uulllllld
  ullllllll
  `,
  links: [
    [
      [1, 6],
      [1, 5]
    ],
    [
      [1, 4],
      [1, 3]
    ],
    [
      [1, 2],
      [1, 1]
    ],
    [
      [2, 4],
      [2, 3]
    ],
    [
      [3, 4],
      [3, 3]
    ],
    [
      [4, 4],
      [4, 3]
    ],
    [
      [7, 6],
      [7, 7]
    ],
    [
      [9, 2],
      [9, 3]
    ],
    [
      [9, 3],
      [9, 4]
    ],
    [
      [9, 4],
      [9, 5]
    ],
    [
      [9, 5],
      [9, 6]
    ],
    [
      [9, 6],
      [9, 7]
    ],
    [
      [9, 7],
      [9, 8]
    ],
    [
      [9, 8],
      [9, 9]
    ]
  ]
}

export default config
