import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  .. bbp ..
  .. raa ..
     pbp
  parpraaba
  aabb rbpp
  ppbrpbarr
     paa
  .. pbp ..
  .. brb ..
  `,
  mikans: `
  k. ... k.
  .. ... ..
     ...
  .........
  .... ....
  .........
     ...
  u. ... u.
  .. ... ..
  `,
  fallFrom: `
  .. ... ..
  .. ... ..
     ...
  .........
  .... ....
  ....l....
     ...
  .. ... ..
  .. ... ..
  `,
  links: [
    [
      [8, 5],
      [8, 4]
    ]
  ]
}

export default config
