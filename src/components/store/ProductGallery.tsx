"use client";

import { useState } from "react";
import { optimizedImageUrl } from "@/lib/image-url";

type ProductGalleryProps = { images: string[]; label: string; badge?: string };

export default function ProductGallery({
  images,
  label,
  badge,
}: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const current =
    images.length > 0 ? images[Math.min(selected, images.length - 1)] : null;

  return (
    <div>
      <div className="relative aspect-4/5 overflow-hidden border border-ink/10 bg-white">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={optimizedImageUrl(current, 800, 1000)}
            srcSet={`${optimizedImageUrl(current, 600, 750)} 600w, ${optimizedImageUrl(current, 1000, 1250)} 1000w`}
            sizes="(min-width: 768px) 50vw, 100vw"
            alt={label}
            width={800}
            height={1000}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full items-center justify-center p-6 text-center font-serif text-2xl text-ink/40"
          >
            {label}
          </div>
        )}
        {badge && (
          <span className="absolute left-3 top-3 border border-ink/15 bg-white px-3 py-1 text-[0.625rem] uppercase tracking-widest">
            {badge}
          </span>
        )}
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
                className={`block h-16 w-14 overflow-hidden border bg-white ${
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