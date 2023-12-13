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
