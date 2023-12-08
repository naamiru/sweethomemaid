import { load, type Board, type BoardConfig } from '@sweethomemaid/logic'

export const stages = ['xmas_4_1', 'xmas_4_2', 'masters_3_3'] as const

export type StageName = (typeof stages)[number]

export function createBoard(name: StageName): Board {
  return load(configs[name])
}

const configs: Record<StageName, BoardConfig> = {
  xmas_4_1: {
    colors: `
    yygy yrgy
    bgyb ryrr
    rbbr rryb
    rbyr bbgy
    ggrg yryg
    ybrgygbrg
    yygbyrryb
    ggrbrbrbg
    grbyggygy
    `,
    ices: `
    3333 0000
    3333 0000
    3333 0000
    3333 0000
    0000 0000
    000000000
    000000000
    000000000
    000000000
    `,
    upstreams: `
    uuuu dddd
    uuuu dddd
    uuuu dddd
    uuuu dddd
    uuuu dddd
    uuuullddd
    uuulllldd
    uulllllld
    ullllllll
    `
  },
  xmas_4_2: {
    colors: `
    grggbbyyr
    rgbyyrygb
    gbybyrbrr
    rggyrgbyg
    yrbb brgg
    gryr bbgb
    bggy grbr
    byrr yggr
         grbg
    `,
    ices: `
    600060006
    060060060
    006060600
    000666000
    0000 0000
    0000 0000
    6666 0000
    6666 0000
         0000
    `,
    upstreams: `
    rrrrrrrrd
    urrrrrrdd
    uurrrrddd
    uuurrdddd
    uuuu dddd
    uuuu dddd
    uuuu dddd
    uuuu dddd
         dddd
    `
  },
  masters_3_3: {
    colors: `
    byarayyra
    ra.aayayb
    ayayyaayb
    byb   b.y
    baa   ary
    y.y
    abryrab.y
    abbrbyrra
    byy.abryr
    `,
    woods: `
    000000000
    003000000
    000000000
    000   030
    000   000
    030
    000000030
    000000000
    000300000
    `,
    upstreams: `
    rrrrrrrrd
    urrrrrrdd
    uurrrrddd
    uuu   ddd
    uuu   ddd
    uuu
    uuullllll
    uulllllll
    ullllllll
    `
  }
}

export default configs
