"use client";

import { useState } from "react";
import { getUploadSignatureAction } from "@/app/admin/(dashboard)/products/upload-actions";

const MAX_IMAGES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

type ImageUploaderProps = {
  images: string[];
  onChange: (images: string[]) => void;
  error?: string;
};

// A small version of a Cloudinary photo, for previews
function thumbnailUrl(url: string): string {
  return url.replace("/upload/", "/upload/c_fill,w_200,h_250,q_auto,f_auto/");
}

async function uploadFile(file: File): Promise<string> {
  const pass = await getUploadSignatureAction();
  if (!pass.ok) throw new Error(pass.message);

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", pass.apiKey);
  body.append("timestamp", String(pass.timestamp));
  body.append("folder", pass.folder);
  body.append("signature", pass.signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${pass.cloudName}/image/upload`,
    { method: "POST", body },
  );
  if (!response.ok) {
    throw new Error("Upload failed. Check your connection and try again.");
  }

  const data: unknown = await response.json();
  if (
    typeof data === "object" &&
    data !== null &&
    "secure_url" in data &&
    typeof data.secure_url === "string"
  ) {
    return data.secure_url;
  }
  throw new Error("Upload failed. Try again.");
}

export default function ImageUploader({
  images,
  onChange,
  error,
}: ImageUploaderProps) {
  const [status, setStatus] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const files = Array.from(input.files ?? []);
    input.value = ""; // lets the same file be chosen again
    if (files.length === 0) return;

    setUploadError("");

    const room = MAX_IMAGES - images.length;
    if (files.length > room) {
      setUploadError(
        `You can add ${room} more photo${room === 1 ? "" : "s"} (max ${MAX_IMAGES}).`,
      );
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setUploadError(`"${file.name}" is not an image.`);
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setUploadError(`"${file.name}" is bigger than 10 MB.`);
        return;
      }
    }

    setIsUploading(true);
    const next = [...images];
    try {
      for (const [index, file] of files.entries()) {
        setStatus(`Uploading ${index + 1} of ${files.length}…`);
        next.push(await uploadFile(file));
        onChange([...next]);
      }
    } catch (caught) {
      setUploadError(
        caught instanceof Error ? caught.message : "Upload failed. Try again.",
      );
    }
    setStatus("");
    setIsUploading(false);
  }

  function removeImage(index: number) {
    onChange(images.filter((_, position) => position !== index));
  }

  function makeMain(index: number) {
    onChange([
      images[index],
      ...images.filter((_, position) => position !== index),
    ]);
  }

  return (
    <fieldset>
      <legend className="text-sm font-medium">
        Photos{" "}
        <span className="font-normal text-ink/70">
          (first one is the main photo)
        </span>
      </legend>

      {images.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-3">
          {images.map((url, index) => (
            <li key={url} className="w-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl(url)}
                alt={`Product photo ${index + 1}`}
                className="aspect-4/5 w-full rounded object-cover"
              />
              {index === 0 ? (
                <p className="mt-1 text-xs font-medium">Main photo</p>
              ) : (
                <button
                  type="button"
                  onClick={() => makeMain(index)}
                  disabled={isUploading}
                  className="mt-1 block h-8 text-xs underline disabled:opacity-40"
                >
                  Make main
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={isUploading}
                className="block h-8 text-xs underline disabled:opacity-40"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {images.length < MAX_IMAGES && (
        <div className="mt-3">
          <label
            htmlFor="photo-input"
            className="inline-flex h-11 cursor-pointer items-center rounded border border-ink/30 px-5 text-sm"
          >
            {isUploading ? "Uploading…" : "Add photos"}
          </label>
          <input
            id="photo-input"
            type="file"
            accept="image/*"
            multiple
            disabled={isUploading}
            onChange={handleFiles}
            className="sr-only"
          />
        </div>
      )}

      <p role="status" className="mt-2 text-sm">
        {status}
      </p>
      {(uploadError || error) && (
        <p id="images-error" role="alert" className="mt-1 text-sm text-red-700">
          {uploadError || error}
        </p>
      )}
    </fieldset>
  );
}