import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  width: 8,
  height: 9,
  colors: `
  rrapba..
  bprarb..
  arrbpa..
  rrbbrb..
      abaa
  ..pbrr..
  ..rpap..
  ..rbab..
  ..babp..
  `,
  mikans: `
  ......5.
  ........
  ......5.
  ........
      ....
  f.....f.
  ........
  f.....f.
  ........
  `,
  upstream: `
  llllllll
  lllllllu
  lllllluu
  llllluuu
      uuuu
  rrrruuuu
  rrrrruuu
  rrrrrruu
  rrrrrrru
  `,
  links: [
    [
      [5, 3],
      [4, 3]
    ],
    [
      [4, 3],
      [3, 3]
    ],
    [
      [3, 3],
      [2, 3]
    ],
    [
      [2, 3],
      [1, 3]
    ]
  ]
}

export default config
