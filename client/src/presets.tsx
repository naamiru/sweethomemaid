import { load, type Board, type BoardConfig } from '@sweethomemaid/logic'

export const stages = [
  'xmas_1',
  'xmas_2_1',
  'xmas_2_2',
  'xmas_4_1',
  'xmas_4_2',
  'xmas_5',
  'xmas_7',
  'xmas_8',
  'xmas_9',
  'xmas_10_1',
  'xmas_10_2',
  'masters_3_1',
  'masters_3_2',
  'masters_3_3',
  'masters_4_1',
  'masters_4_2',
  'masters_4_3'
] as const

export type StageName = (typeof stages)[number]

export function createBoard(name: StageName): Board {
  return load(configs[name])
}

const configs: Record<StageName, BoardConfig> = {
  xmas_1: {
    colors: `
    _grb rby
    rbby gyrb
    bggr bbry
    byyg bygb
    rgbr ygby
    ygbg bbyg
    yrgr gyry
    rrgg brgg
     ybb gry
    `,
    ices: `
    _000 000
    0000 0000
    0000 0000
    0000 0000
    0000 0000
    3333 3333
    3333 3333
    5555 5555
     555 555
    `,
    upstreams: `
    _uuu uuu
    3uuu uuu1
    uuuu uuuu
    uuuu uuuu
    uuuu uuuu
    uuuu uuuu
    uuuu uuuu
    uuuu uuuu
     uuu uuu
    `
  },
  xmas_2_1: {
    width: 9,
    height: 8,
    colors: `
    rbybybrrb
    grbybgg r
    y by ryyr
    grggryggy
    ggyyrbgbr
    r rr bybb
    rbggbrr r
    ybbrbyryb
    `,
    ices: `
    000000000
    0000000 0
    0 00 0000
    000000033
    033300000
    0 00 0000
    0000000 0
    000000000
    `,
    upstreams: `
    uuuuuuuuu
    uuuuuuu u
    u uu uu1u
    u1uu1uuuu
    uuuuuuuuu
    u uu uuuu
    u1uu3uu u
    uuuuuuu3u
    `
  },
  xmas_2_2: {
    width: 9,
    height: 8,
    colors: `
    ryb rrbrg
    y r bgrbr
    gyy rr gg
    ryg bb bg
    gby by yb
    gyb rg gb
    r g gyryr
    yyr ryygb
    `,
    ices: `
    000 00000
    0 0 00000
    000 00 00
    030 00 00
    000 00 00
    000 00 00
    0 0 05550
    000 00000
    `,
    upstreams: `
    uuu uuuuu
    u u uuuuu
    u1u uu uu
    uuu uu uu
    uuu uu uu
    uuu uu uu
    u u uu3uu
    u1u uuuuu
    `
  },
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
  xmas_5: {
    colors: `
    _bgbryyb
    gyrgrgyg
    bgyrybbg
    rgbgrgy
       ygr
      gbybbyb
     yyrrygrb
     brggbrgr
     ybbyryb
    `,
    ices: `
    _6630000
    66630000
    66630000
    6663000
       300
      3300000
     33300000
     33300000
     3330000 
    `,
    upstreams: `
    _uuuuuuu
    3uuuuuuu
    uuuuuuuu
    uuuuuuu
       uuu
      3uuuuuu
     3uuuuuuu
     uuuuuuuu
     uuuuuuu
    `,
    warps: `
    _____ABC
    ________
    ________
    def_____
       ___
      ____DEF
     ________
     ________
     abc____
    `
  },
  xmas_7: {
    colors: `
    ygy b yyg
    by bgy rr
      ggrgb
    ygybyrgyr
     rrybygg
    g ggbyr y
    r brrgr b
     ryb gbb
    gy  r  yb
    `,
    ices: `
    222 0 222
    22 000 22
      00000
    000000000
     0000000
    5 00000 5
    5 00000 5
     555 555
    55  6  55
    `,
    upstreams: `
    uuu u uuu
    uu 1u1 uu
      1uuu3
    uuuuuuuuu
     uuuuuuu
    3 uuuuu 1
    u uuuuu u
     3uu uu1
    3u  1  u1
    `
  },
  xmas_8: {
    colors: `
    gy yrr bb
    rb ryg yr
    yr bgy gb
    ry bry gb
    rb gyb yr
    yg rrg gb
    gy gbb br
    yr bgy ry
     g r g b
    `,
    ices: `
    00 050 00
    02 050 20
    00 050 00
    20 050 02
    00 050 00
    02 050 20
    00 050 00
    20 050 02
     0 0 0 0 
    `,
    upstreams: `
    uu ddd uu
    uu ddd uu
    uu ddd uu
    uu ddd uu
    uu ddd uu
    uu ddd uu
    uu ddd uu
    uu d7d uu
     u d d u
    `,
    warps: `
    __ ___ __
    __ ___ __
    __ ___ __
    __ ___ __
    __ ___ __
    __ ___ __
    __ ___ __
    __ ___ __
     a A_B b
    `
  },
  xmas_9: {
    colors: `
    _yg   rr
    rgbr rgyg
    grybrbryr
     bggygbg
    g gyryg g
    br bbr bg
    ybg r gyb
    grby brry
    bgygyrgyy
    `,
    ices: `
    _22   22 
    2532 2352
    425323524
     4253524
    0 42524 0
    00 424 00
    000 4 000
    0000 0000
    000000000
    `,
    upstreams: `
    _uu   uu
    3uu1 3uu1
    uuuu3uuuu
     uuuuuuu
    3 uuuuu 1
    u3 uuu 1u
    uu3 u 1uu
    uuu3 1uuu
    uuuu1uuuu
    `
  },
  xmas_10_1: {
    colors: `
    bry r rgy
    rg yyg br
    g yygrg r
     rbg yyb
    brb   grr
     gyb ybg
    g rggyy y
    bg brb by
    grr r gbg
    `,
    ices: `
    222 0 222
    22 000 22
    2 00000 2
     000 000
    000   000
     000 000
    2 00000 2
    22 000 22
    222 0 222
    `,
    upstreams: `
    uuu u uuu
    uu 1u3 uu
    u 1uuu3 u
     1uu uu3
    3uu   uu1
     uu1 3uu
    3 uu1uu 1
    u3 uuu 1u
    uu3 u 1uu
    `
  },
  xmas_10_2: {
    colors: `
    bg yrr yy
    gry g gbg
     rggrgbr
    r rbryy b
    ybbr gryg
    r ybgbr y
     rgbgryg
    ybr r byb
    yg ygy gy
    `,
    ices: `
    33 333 33
    330 0 033
     0000000
    3 00000 3
    3300 0033
    3 00000 3
     0000000
    330 0 033
    33 333 33
    `,
    upstreams: `
    uu uuu uu
    u3u u 1uu
     uu3u1uu
    3 uuuuu 1
    u1uu uu3u
    u uu1uu u
     1uuuuu3
    3uu u uu1
    uu 1u3 uu
    `
  },
  masters_3_1: {
    colors: `
    ayrrbybyr
    ryyayraba
    r.rayaa.a
    ybayab.by
      abbyb
    yrryrarbb
    baab.rray
    byababary
    aa.rbrabb
    `,
    woods: `
    000000000
    000000000
    030000030
    000000300
      00000
    000000000
    000030000
    000000000
    003000000
    `,
    upstreams: `
    uuuuuuuuu
    uuuuuuuuu
    uuuuuuuuu
    uuuuuuuuu
      uuuuu
    u3uuuuu1u
    uuuuuuuuu
    uuuuuuuuu
    uuuuuuuuu
    `
  },
  masters_3_2: {
    colors: `
    yyrrbbrby
    abb.raary
    bbyyba.yb
    ry yrbyby
    ab bby ab
    a.braa r.
    brba.ayrb
    ryyrrbraa
    rbybyabrr
    `,
    woods: `
    000000000
    000300000
    000000300
    00 000000
    00 000 00
    030000 03
    000030000
    000000000
    000000000
    `,
    upstreams: `
    uuuuuuuuu
    uuuuuuuuu
    uuuuuuuuu
    uu uuuuuu
    uu uuu uu
    uuuuuu uu
    uuuuuuuuu
    uuuuuuuuu
    uuuuuuuuu
    `,
    warps: `
    _________
    _________
    __a______
    __ ___b__
    __ ___ __
    __A___ __
    ______B__
    _________
    _________
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
  },
  masters_4_1: {
    colors: `
    __rbryr
     byrbrby
    ybbypypyb
    rppbpybpr
    ypybybbyy
    yyrrpprbb
    rrybrpryr
     bprprbr
      ybbpb
    `,
    upstreams: `
    __uuuuu
     3uuuuu1
    3uuuuuuu1
    uuuuuuuuu
    uuuuuuuuu
    uuuuuuuuu
    uuuuuuuuu
     uuuuuuu
      uuuuu
    `,
    chains: `
    __00000
     0000000
    003030300
    000000000
    003030300
    000000000
    003030300
     0000000
      00000
    `,
    links: [
      [
        [2, 2],
        [3, 1]
      ],
      [
        [1, 3],
        [2, 2]
      ],
      [
        [1, 4],
        [1, 3]
      ]
    ]
  },
  masters_4_2: {
    colors: `
    ryr   byp
    bpybyrppy
    rprprryrb
     yrbryry
     rpbypbr
     pbybrrp
    byprypbyb
    yrybrybpb
    brp   ybp
    `,
    upstreams: `
    uuu   uuu
    uuu1u3uuu
    uuuuuuuuu
     uuuuuuu
     uuuuuuu
     uuuuuuu
    3uuuuuuu1
    uuuuuuuuu
    uuu   uuu
    `
  },
  masters_4_3: {
    colors: `
    ___bpryrr
    __pybpyyr
    _yybrrbpy
    rpryrybpr
    ryypyrpyr
    yrpprbypy
    bbyybybb
    rbbrypb
    rrppbp
    `,
    upstreams: `
    ___uuuuuu
      uuuuuuu
     uuuuuuuu
    uuuuuuuuu
    uuuuuuuuu
    uuuuuuuuu
    uuuuuuuu
    uuuuuuu
    uuuuuu
    `
  }
}

export default configs
