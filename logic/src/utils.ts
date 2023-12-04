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
    private readonly hashFn: (value: T) => K,
    values: Iterable<T> | undefined = undefined
  ) {
    this.map = new Map<K, T>()
    if (values !== undefined) {
      for (const value of values) {
        this.add(value)
      }
    }
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.map.values()
  }

  add(value: T): GeneralSet<T, K> {
    this.map.set(this.hashFn(value), value)
    return this
  }

  delete(value: T): boolean {
    return this.map.delete(this.hashFn(value))
  }

  has(value: T): boolean {
    return this.map.has(this.hashFn(value))
  }
}
