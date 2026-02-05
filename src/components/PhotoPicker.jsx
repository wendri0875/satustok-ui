import { useEffect, useState } from "react"
import { fixImageOrientation } from "../utils/fixImageOrientation"

export default function PhotoPicker({
  value,
  imageUrl,
  loading,
  onChange,
  token,
}) {
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    let objectUrl

    const loadRemoteImage = async () => {
      try {
        const res = await fetch(imageUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        })

        const blob = await res.blob()
        objectUrl = URL.createObjectURL(blob)
        setPreview(objectUrl)
      } catch (err) {
        console.error("Gagal load image:", err)
        setPreview(null)
      }
    }

    if (value instanceof File) {
      objectUrl = URL.createObjectURL(value)
      setPreview(objectUrl)
    } else if (imageUrl) {
      loadRemoteImage()
    } else {
      setPreview(null)
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [value, imageUrl, token])

  const handleChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fixed = await fixImageOrientation(file)
    const objectUrl = URL.createObjectURL(fixed)

    setPreview(objectUrl)
    onChange?.(fixed)
  }

  return (
    <label className="relative w-20 aspect-[9/16] border-2 border-dashed rounded-xl flex items-center justify-center text-xs text-gray-500 cursor-pointer overflow-hidden bg-gray-50 shrink-0">
      {preview ? (
        <img
          src={preview}
          alt=""
          className="absolute inset-0 w-full h-full object-contain bg-gray-100"
          style={{ opacity: loading ? 0.4 : 1 }}
        />
      ) : (
        !loading && "+ Foto"
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        hidden
        onChange={handleChange}
      />
    </label>
  )
}
