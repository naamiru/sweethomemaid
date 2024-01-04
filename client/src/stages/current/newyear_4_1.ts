import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  _bpapapb
  babprrppb
  rbabrpabp
   .. b ..
   .. p ..
  pbprapbpr
  rabbaraap
  .. rbp ..
  .. bpr ..
  `,
  mikans: `
  _.......
  .........
  .........
   a. . a.
   .. . ..
  .........
  .........
  f. ... f.
  .. ... ..
  `,
  fallFrom: `
  _.......
  .........
  .........
   .. . ..
   .. . ..
  .....r...
  .........
  .. ... ..
  .. ... ..
  `,
  links: [
    [
      [2, 6],
      [2, 5]
    ],
    [
      [2, 4],
      [2, 3]
    ],
    [
      [3, 6],
      [3, 5]
    ],
    [
      [4, 8],
      [4, 7]
    ],
    [
      [4, 7],
      [4, 6]
    ],
    [
      [4, 6],
      [5, 5]
    ],
    [
      [5, 8],
      [5, 7]
    ],
    [
      [5, 7],
      [5, 6]
    ],
    [
      [5, 6],
      [5, 5]
    ],
    [
      [6, 8],
      [6, 7]
    ],
    [
      [6, 7],
      [6, 6]
    ],
    [
      [6, 6],
      [7, 5]
    ],
    [
      [6, 6],
      [5, 5]
    ],
    [
      [7, 6],
      [7, 5]
    ],
    [
      [9, 6],
      [8, 5]
    ]
  ]
}

export default config
