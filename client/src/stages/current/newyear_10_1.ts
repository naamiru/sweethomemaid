import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  .. rrbapb
  ..pararpp
     par
  .. abraar
  ..bppapra
        arb
  .. pbappr
  ..prbbaab
     barpbr
  `,
  mikans: `
  c. ......
  .........
     ...
  c. ......
  .........
        ...
  c. ......
  .........
     ......
  `,
  fallFrom: `
  .. ......
  ..l......
     ...
  .. ......
  ..l......
        ...
  .. ......
  ..l......
     ......
  `,
  links: [
    [
      [4, 5],
      [4, 4]
    ],
    [
      [5, 5],
      [5, 4]
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
      [7, 5],
      [7, 4]
    ],
    [
      [7, 4],
      [7, 2]
    ],
    [
      [8, 5],
      [8, 4]
    ],
    [
      [8, 4],
      [8, 2]
    ],
    [
      [9, 4],
      [9, 2]
    ]
  ]
}

export default config
