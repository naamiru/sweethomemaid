import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  ??????___
  pprprb ..
     bppr..
  rbpabp
  bprrpr ..
  babbraa..
  rpr
  baaprp ..
  pprbbra..
  `,
  mikans: `
  ......
  ...... o.
     ......
  ......
  ...... o.
  .........
  ...
  ...... o.
  .........
  `,
  fallFrom: `
  ......
  ...... ..
     ...l..
  ......
  ...... ..
  ......l..
  ...
  ...... ..
  ......l..
  `,
  links: [
    [
      [1, 7],
      [1, 6]
    ],
    [
      [1, 6],
      [1, 5]
    ],
    [
      [1, 5],
      [1, 4]
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
      [3, 8],
      [3, 7]
    ],
    [
      [3, 7],
      [3, 6]
    ]
  ]
}

export default config
