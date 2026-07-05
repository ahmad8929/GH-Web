"use client";

import { useState } from "react";

type GalleryProps = {
  images: string[];
  title: string;
  /** shown when there are no images */
  placeholderEmoji?: string;
};

export function Gallery({ images, title, placeholderEmoji = "🎒" }: GalleryProps) {
  const [index, setIndex] = useState(0);
  const current = images[index];

  return (
    <div className="listing-gallery">
      <div className="listing-gallery__main">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary/user images
          <img src={current} alt={`${title} — photo ${index + 1}`} />
        ) : (
          <span aria-hidden>{placeholderEmoji}</span>
        )}
      </div>
      {images.length > 1 ? (
        <div className="listing-gallery__thumbs">
          {images.map((image, i) => (
            <button
              key={image}
              type="button"
              data-active={i === index}
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
