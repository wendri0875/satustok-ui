import { useEffect, useState } from "react";

export default function ProductThumbnail({
  src,
  token,
  version,
  size = 48,
}) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    let objectUrl;

    const loadImage = async () => {
      try {
        const res = await fetch(`${src}?v=${version}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        setPreview(objectUrl);
      } catch (err) {
        console.error("Gagal load thumbnail:", err);
        setPreview(null);
      }
    };

    if (src && token) {
      loadImage();
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, token, version]);

  if (!preview) return null;

  return (
    <img
      src={preview}
      alt=""
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        objectFit: "cover",
      }}
    />
  );
}
