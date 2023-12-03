export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start }, (_, i) => i + start)
}

export class NotImplemented extends Error {
  static {
    this.prototype.name = 'NotImplemented'
  }
}
