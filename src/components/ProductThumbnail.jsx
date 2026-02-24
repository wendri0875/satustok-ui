import { useMemo } from "react";

export default function ProductThumbnail({
  src,
  version,
  size = 48,
}) {
  const finalUrl = useMemo(() => {
    if (!src) return null;

    return `${src}?tr=w-${size},h-${size},c-maintain_ratio,q-70&v=${version}`;
  }, [src, size, version]);

  if (!finalUrl) return null;

  return (
    <img
      src={finalUrl}
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
