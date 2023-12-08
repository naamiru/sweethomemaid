import { useEffect, useState } from 'react'

export function useBodySize(): [number, number] {
  const [size, setSize] = useState<[number, number]>(() => [
    document.body.scrollWidth,
    document.body.scrollHeight
  ])
  useEffect(() => {
    const onResize: () => void = () => {
      setSize([document.body.scrollWidth, document.body.scrollHeight])
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])
  return size
}
