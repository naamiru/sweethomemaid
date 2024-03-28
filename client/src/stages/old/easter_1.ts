import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  rbpbrybry
  pbrpbyryp
  brprprbrr
  .bby.yyr.
   rry rpb
  ybppypbpb
  brbrybrrp
  ypybrypyy
  p.......r
  `,
  eggs: `
  .........
  .........
  .........
  3...3...3
   ... ...
  .........
  .........
  .........
  .3333333.
  `,
  fallFrom: `
  .........
  .........
  .........
  .........
   ... ...
  ....l....
  .........
  .........
  .........
  `,
  links: [
    [
      [1, 2],
      [1, 1]
    ],
    [
      [3, 8],
      [3, 7]
    ],
    [
      [3, 4],
      [3, 3]
    ],
    [
      [4, 8],
      [4, 7]
    ],
    [
      [4, 6],
      [4, 5]
    ],
    [
      [4, 4],
      [4, 3]
    ],
    [
      [5, 8],
      [5, 7]
    ],
    [
      [6, 8],
      [6, 7]
    ],
    [
      [6, 5],
      [6, 4]
    ],
    [
      [6, 4],
      [6, 3]
    ],
    [
      [7, 8],
      [7, 7]
    ],
    [
      [7, 4],
      [7, 3]
    ],
    [
      [8, 8],
      [8, 7]
    ],
    [
      [8, 6],
      [8, 5]
    ]
  ]
}

export default config
