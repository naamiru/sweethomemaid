import { load, type Board, type BoardConfig } from '@sweethomemaid/logic'

export const stages = [
  'masters_7_1',
  'masters_7_2',
  'newyear_1_1',
  'newyear_1_2',
  'newyear_2',
  'newyear_3',
  'newyear_4_1',
  'newyear_4_2',
  'newyear_5_1',
  'newyear_5_2'
] as const

export type StageName = (typeof stages)[number]

export function createBoard(name: StageName): Board {
  return load(configs[name])
}

const configs: Record<StageName, BoardConfig> = {
  masters_7_1: {
    colors: `
    __bgpbp
     agpapgp
    .bpp.ppb.
    .bg.g.bb.
     .a...g.
    .pb.b.pa.
    .bpb.pab.
    .agagbgg.
     .......
    `,
    buttons: `
    __00000
     0000000
    300030003
    300303003
     3033303
    300303003
    300030003
    300000003
     3333333
    `,
    fallFrom: `
    __.....
     .......
    .........
    ....r....
     .......
    .........
    ...l.l...
    ....r....
     .......
    `,
    links: [
      [
        [1, 6],
        [2, 5]
      ],
      [
        [1, 3],
        [2, 2]
      ]
    ]
  },
  masters_7_2: {
    colors: `
    __bbapg
     pgbggpb
    .apg.apa.
    .ab.a.ga.
     .p...g.
    .ab.b.ab.
    .bga.apb.
    .bappbpa.
     .......
    `,
    buttons: `
    __00000
     0000000
    300030003
    300303003
     3033303
    300303003
    300030003
    300000003
     3333333
    `,
    fallFrom: `
    __.....
     .......
    .........
    ....r....
     .......
    .........
    ...l.l...
    ....r....
     .......
    `,
    links: [
      [
        [1, 6],
        [2, 5]
      ],
      [
        [1, 3],
        [2, 2]
      ]
    ]
  },
  newyear_1_1: {
    colors: `
    bra   bpa
    apapararr
    rbprrbapb
     brbpapa
      ..r..
      .. ..
     ... ...
    .........
    .........
    `,
    mikans: `
    ...   ...
    .........
    .........
     .......
      5..5.
      .. ..
     ... ...
    a......a.
    .........
    `,
    fallFrom: `
    ...   ...
    .........
    .........
     .......
      .....
      .. ..
     ... ...
    ....l....
    .........
    `,
    links: []
  },
  newyear_1_2: {
    colors: `
    _rpbbpab
    rbp a rba
    rbrrbpapp
     ..rpp..
     ..   ..
    .... ....
    .........
     .......
     .......
    `,
    mikans: `
    _.......
    ... . ...
    .........
     a....a.
     ..   ..
    k... ..k.
    .........
     a....a.
     .......
    `,
    fallFrom: `
    _.......
    ... . ...
    ...l.r...
     .......
     ..   ..
    .... ....
    ....l....
     .......
     .......
    `,
    links: [
      [
        [2, 3],
        [2, 2]
      ],
      [
        [2, 2],
        [2, 1]
      ],
      [
        [3, 5],
        [3, 4]
      ],
      [
        [3, 3],
        [3, 2]
      ],
      [
        [3, 2],
        [3, 1]
      ],
      [
        [5, 3],
        [5, 2]
      ],
      [
        [7, 2],
        [7, 1]
      ],
      [
        [8, 2],
        [8, 1]
      ]
    ]
  },
  newyear_2: {
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
  },
  newyear_3: {
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
  },
  newyear_4_1: {
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
  },
  newyear_4_2: {
    colors: `
    ?? ??? ??
    ?? ??? ??
    brb p apr
     arrabrb
    ..pbabr..
    ..rabrp..
       ppa
     .. b ..
     .. r ..
    `,
    mikans: `
    .. ... ..
    .. ... ..
    ... . ...
     .......
    f......f.
    .........
       ...
     p. . p.
     .. . ..
    `,
    fallFrom: `
    .. ... ..
    .. ... ..
    ..r . r..
     ..l.r..
    .........
    .........
       ...
     .. . ..
     .. . ..
    `,
    links: [
      [
        [1, 2],
        [1, 1]
      ],
      [
        [2, 2],
        [2, 1]
      ],
      [
        [3, 4],
        [3, 3]
      ],
      [
        [4, 4],
        [5, 3]
      ],
      [
        [4, 2],
        [4, 1]
      ],
      [
        [5, 4],
        [5, 3]
      ],
      [
        [5, 2],
        [5, 1]
      ],
      [
        [6, 4],
        [7, 3]
      ],
      [
        [7, 4],
        [7, 3]
      ],
      [
        [8, 2],
        [8, 1]
      ]
    ]
  },
  newyear_5_1: {
    colors: `
    rbpb babb
    rrar papa
    bprb abrr
    apap brbb
    
    .... ....
    ....r....
    aabprapra
    bprr barb
    `,
    mikans: `
    .... ....
    .... ....
    .... ....
    .... ....

    a.5. 5.a.
    .........
    .........
    .... ....
    `,
    upstream: `
    llll rrrr
    llll rrrr
    llll rrrr
    llll rrrr

    uuuu uuuu
    uuuuuuuuu
    uuuuuuuuu
    uuuu uuuu
    `,
    fallFrom: `
    .... ....
    .... ....
    .... ....
    .... ....

    .... ....
    ....l....
    .........
    .ll. .rr.
    `,
    links: [
      [
        [1, 6],
        [4, 4]
      ],
      [
        [4, 4],
        [3, 4]
      ],
      [
        [3, 4],
        [2, 4]
      ],
      [
        [2, 4],
        [1, 4]
      ],
      [
        [2, 6],
        [4, 3]
      ],
      [
        [4, 3],
        [3, 3]
      ],
      [
        [3, 3],
        [3, 2]
      ],
      [
        [3, 6],
        [4, 2]
      ],
      [
        [4, 2],
        [3, 2]
      ],
      [
        [6, 6],
        [6, 1]
      ],
      [
        [6, 1],
        [7, 1]
      ],
      [
        [7, 1],
        [8, 1]
      ],
      [
        [8, 1],
        [9, 1]
      ],
      [
        [7, 6],
        [6, 2]
      ],
      [
        [6, 2],
        [7, 2]
      ],
      [
        [7, 2],
        [8, 2]
      ],
      [
        [8, 6],
        [6, 3]
      ],
      [
        [6, 3],
        [7, 3]
      ],
      [
        [9, 6],
        [6, 4]
      ]
    ]
  },
  newyear_5_2: {
    colors: `
    ???? ????
    ?????????
    ?????????
    ???? ????
    ar.. ..pp
     p..p..ar
        rp  b
    .... bpra
    .... abrr
    `,
    mikans: `
    .... ....
    .........
    .........
    .... ....
    ..k. k...
     ........
        ..  .
    k.k. ....
    .... ....
    `,
    fallFrom: `
    .... ....
    ....l....
    .........
    .... ....
    .... ....
     ...l....
        ..  .
    .... ....
    .... ....
    `,
    links: [
      [
        [6, 8],
        [6, 7]
      ]
    ]
  }
}

export default configs
