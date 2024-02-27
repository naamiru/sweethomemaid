import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  pMaMgMgMg

  ppgapggpa
  pa yag py
  gyapaypya
  aa ppg pa
  apyggapyg

  gVyVgVgVg
  `,
  jellies: `
  333333333

  .........
  .. ... ..
  .........
  .. ... ..
  .........

  222222222
  `,
  fallFrom: `
  .........

  .........
  .. ... ..
  ..l...l..
  .. ... ..
  ..l...r..

  .........
  `,
  links: [
    [
      [2, 6],
      [2, 5]
    ],
    [
      [2, 5],
      [2, 4]
    ],
    [
      [4, 6],
      [4, 5]
    ],
    [
      [5, 6],
      [5, 5]
    ],
    [
      [6, 6],
      [6, 5]
    ],
    [
      [9, 6],
      [9, 5]
    ],
    [
      [9, 5],
      [9, 4]
    ],
    [
      [9, 4],
      [9, 3]
    ]
  ]
}

export default config
