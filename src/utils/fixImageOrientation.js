export async function fixImageOrientation(file) {
  if (!file) return null

  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image"
  })

  const canvas = document.createElement("canvas")
  canvas.width = bitmap.width
  canvas.height = bitmap.height

  const ctx = canvas.getContext("2d")
  ctx.drawImage(bitmap, 0, 0)

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(
          new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          })
        )
      },
      file.type,
      0.95
    )
  })
}
