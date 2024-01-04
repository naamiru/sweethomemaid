import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  .....ppba
  .....aprp
  .....pbar
  .....rrbp

  .........
  .........
  .........
  .........
  `,
  mikans: `
  a..5.....
  .........
  a..5.....
  .........

  ...k...k.
  .........
  ...k...k.
  .........
  `,
  upstream: `
  rrrrrrrrr
  rrrrrrrrr
  rrrrrrrrr
  rrrrrrrrr

  lllllllll
  lllllllll
  lllllllll
  lllllllll
  `,
  links: [
    [
      [1, 6],
      [1, 1]
    ],
    [
      [1, 7],
      [1, 2]
    ],
    [
      [1, 8],
      [1, 3]
    ],
    [
      [1, 9],
      [1, 4]
    ]
  ]
}

export default config
