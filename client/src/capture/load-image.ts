export async function loadImage(file: File): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve(img)
    }
    img.onerror = e => {
      reject(e)
    }

    const reader = new FileReader()
    reader.onload = () => {
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
