export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start }, (_, i) => i + start)
}

export class NotImplemented extends Error {
  static {
    this.prototype.name = 'NotImplemented'
  }
}

export class GeneralSet<T, K = any> implements Iterable<T> {
  map: Map<K, T>

  constructor(
    private readonly keyFn: (value: T) => K,
    values: Iterable<T> | undefined = undefined
  ) {
    this.map = new Map()
    if (values !== undefined) {
      for (const value of values) {
        this.add(value)
      }
    }
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.map.values()
  }

  get size(): number {
    return this.map.size
  }

  add(value: T): GeneralSet<T, K> {
    this.map.set(this.keyFn(value), value)
    return this
  }

  delete(value: T): boolean {
    return this.map.delete(this.keyFn(value))
  }

  has(value: T): boolean {
    return this.map.has(this.keyFn(value))
  }
}

export class GeneralMap<TK, TV, K = any> implements Iterable<[TK, TV]> {
  keyMap: Map<K, TK>
  valueMap: Map<K, TV>

  constructor(
    private readonly keyFn: (value: TK) => K,
    values: Iterable<[TK, TV]> | undefined = undefined
  ) {
    this.keyMap = new Map()
    this.valueMap = new Map()
    if (values !== undefined) {
      for (const [key, value] of values) {
        this.set(key, value)
      }
    }
  }

  [Symbol.iterator](): IterableIterator<[TK, TV]> {
    return this.entries()
  }

  get size(): number {
    return this.keyMap.size
  }

  set(key: TK, value: TV): GeneralMap<TK, TV, K> {
    const k = this.keyFn(key)
    this.keyMap.set(k, key)
    this.valueMap.set(k, value)
    return this
  }

  get(key: TK): TV | undefined {
    return this.valueMap.get(this.keyFn(key))
  }

  has(key: TK): boolean {
    return this.valueMap.has(this.keyFn(key))
  }

  keys(): IterableIterator<TK> {
    return this.keyMap.values()
  }

  values(): IterableIterator<TV> {
    return this.valueMap.values()
  }

  *entries(): IterableIterator<[TK, TV]> {
    for (const [k, key] of this.keyMap.entries()) {
      const value = this.valueMap.get(k)
      if (value !== undefined) {
        yield [key, value]
      }
    }
  }
}

export function partition<T>(
  values: Iterable<T>,
  condition: (value: T) => boolean
): [T[], T[]] {
  const positives: T[] = []
  const negatives: T[] = []
  for (const value of values) {
    ;(condition(value) ? positives : negatives).push(value)
  }
  return [positives, negatives]
}
