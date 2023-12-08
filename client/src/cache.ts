export function set<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function get<T>(key: string): T | undefined {
  const json = localStorage.getItem(key)
  if (json === null) return undefined
  return JSON.parse(json) as T
}
