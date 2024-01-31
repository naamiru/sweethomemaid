import { type BoardConfig } from '@sweethomemaid/logic'

const config: BoardConfig = {
  colors: `
  ___gpy___
    paaya
   ypy gyp
  apa   pag
  pgg p aga
  ypa   pyy
   gga gpa
    pygaa
     gap
  `,
  jellies: `
  ___...___
    .....
   ... ...
  ...   ...
  ... 3 ...
  ...   ...
   ... ...
    .....
     ...
  `,
  fallFrom: `
  ___...___
    .....
   ... ...
  ...   ...
  ... . ...
  ...   ...
   ... ...
    ..l..
     ...
  `,
  links: [
    [
      [3, 2],
      [4, 1]
    ],
    [
      [4, 2],
      [4, 1]
    ],
    [
      [6, 2],
      [6, 1]
    ],
    [
      [7, 2],
      [6, 1]
    ]
  ]
}

export default config
