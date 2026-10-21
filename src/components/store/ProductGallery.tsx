"use client";

import { useState } from "react";
import { optimizedImageUrl } from "@/lib/image-url";

type ProductGalleryProps = { images: string[]; label: string };

export default function ProductGallery({ images, label }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-4/5 items-center justify-center rounded-lg bg-ink/5 p-4 text-center font-serif text-ink/40">
        {label}
      </div>
    );
  }

  const current = images[Math.min(selected, images.length - 1)];

  return (
    <div>
      <div className="aspect-4/5 overflow-hidden rounded-lg bg-ink/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={optimizedImageUrl(current, 800, 1000)}
          srcSet={`${optimizedImageUrl(current, 600, 750)} 600w, ${optimizedImageUrl(current, 1000, 1250)} 1000w`}
          sizes="(min-width: 768px) 50vw, 100vw"
          alt={label}
          width={800}
          height={1000}
          className="h-full w-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <ul className="mt-3 flex gap-2">
          {images.map((url, index) => (
            <li key={url}>
              <button
                type="button"
                onClick={() => setSelected(index)}
                aria-label={`Show photo ${index + 1} of ${images.length}`}
                aria-current={index === selected}
                className={`block h-16 w-14 overflow-hidden rounded border ${
                  index === selected ? "border-ink" : "border-ink/20"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={optimizedImageUrl(url, 120, 150)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}