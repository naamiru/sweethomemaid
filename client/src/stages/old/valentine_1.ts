import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  _gaayapy_
  aypyggypy
  pp gaa ag
  ayapypayp
  gpgppypag
  aaggaaggp
  yy     ag
  ypayappgy
   ypapyga
  `,
  jellies: `
  _......._
  .........
  .. ... ..
  .........
  .........
  111111111
  22     22
  333333333
   5555555
  `,
  fallFrom: `
  _......._
  .........
  .. ... ..
  ..l...r..
  .........
  .........
  ..     ..
  .........
   .......
  `,
  links: [
    [
      [4, 4],
      [4, 3]
    ],
    [
      [5, 4],
      [5, 3]
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
      [7, 4],
      [8, 3]
    ],
    [
      [8, 6],
      [8, 5]
    ],
    [
      [9, 5],
      [9, 4]
    ]
  ]
}

export default config
