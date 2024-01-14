import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  .. raa ..
  .. bpr ..
    rabrb
  bpbbapabp
  araparapb
  prpb rppr
  bp     rr
  pa.. ..ap
  rp.. ..pr
  `,
  mikans: `
  f. ... f.
  .. ... ..
    .....
  .........
  .........
  .... ....
  ..     ..
  ..k. k...
  .... ....
  `,
  fallFrom: `
  .. ... ..
  .. ... ..
    l...r
  .........
  .........
  .... ....
  ..     ..
  .... ....
  .... ....
  `,
  links: [
    [
      [1, 8],
      [1, 7]
    ],
    [
      [2, 2],
      [2, 1]
    ],
    [
      [3, 3],
      [4, 2]
    ],
    [
      [4, 4],
      [4, 3]
    ],
    [
      [5, 4],
      [5, 3]
    ],
    [
      [8, 8],
      [8, 7]
    ],
    [
      [8, 7],
      [8, 6]
    ],
    [
      [8, 2],
      [8, 1]
    ]
  ]
}

export default config
