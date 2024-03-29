import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  gpap paga
  aap ggpaa
  py aypagy
  y gypygya
   gyaayyg
  gyppgap p
  pagayp ga
  ggpyg ypy
  pygy gaag
  `,
  jellies: `
  3333 ....
  333 .....
  33 ......
  3 .......
   .......
  ....... 3
  ...... 33
  ..... 333
  .... 3333
  `,
  fallFrom: `
  .... ....
  ... l....
  .. l.....
  . l......
   l......
  ....... .
  ...... l.
  ..... l..
  .... l...
  `,
  links: [
    [
      [1, 6],
      [2, 5]
    ],
    [
      [1, 4],
      [1, 3]
    ],
    [
      [1, 3],
      [1, 2]
    ],
    [
      [1, 2],
      [1, 1]
    ],
    [
      [2, 8],
      [2, 7]
    ],
    [
      [2, 7],
      [2, 6]
    ],
    [
      [2, 5],
      [3, 4]
    ],
    [
      [3, 8],
      [3, 7]
    ],
    [
      [3, 5],
      [3, 4]
    ],
    [
      [3, 4],
      [4, 3]
    ],
    [
      [3, 2],
      [4, 1]
    ],
    [
      [4, 8],
      [4, 7]
    ],
    [
      [4, 3],
      [5, 2]
    ],
    [
      [5, 8],
      [5, 7]
    ],
    [
      [5, 3],
      [5, 2]
    ],
    [
      [5, 2],
      [6, 1]
    ],
    [
      [6, 7],
      [6, 6]
    ],
    [
      [6, 4],
      [6, 3]
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
      [8, 4],
      [8, 3]
    ],
    [
      [8, 3],
      [8, 2]
    ],
    [
      [9, 8],
      [9, 7]
    ]
  ]
}

export default config
