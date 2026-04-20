"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { upload } from "@vercel/blob/client";

const EXT_BY_CONTENT_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB pre-resize cap
const RESIZE_MAX_EDGE = 1200;
const RESIZE_QUALITY = 0.8;

function blobPathname(recipeId: string, file: File) {
  const key = (file.type || "").split(";")[0].trim().toLowerCase();
  const ext =
    EXT_BY_CONTENT_TYPE[key] ||
    file.name.split(".").pop()?.toLowerCase() ||
    "jpg";
  const timestamp = new Date()
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z")
    .replace(/:/g, "-");
  return `recipes/${recipeId}_${timestamp}.${ext}`;
}

// Downscale to RESIZE_MAX_EDGE on the long edge and re-encode to WebP.
// Returns the original file if the canvas pipeline isn't available,
// if the format is animated (GIF), or if the result wouldn't be smaller.
async function resizeImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;
  if (typeof createImageBitmap !== "function") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const { width, height } = bitmap;
  const longEdge = Math.max(width, height);
  const scale = longEdge > RESIZE_MAX_EDGE ? RESIZE_MAX_EDGE / longEdge : 1;
  const targetW = Math.max(1, Math.round(width * scale));
  const targetH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", RESIZE_QUALITY),
  );
  if (!blob || blob.size >= file.size) return file;

  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${baseName}.webp`, { type: "image/webp" });
}

export default function RecipeImage({
  recipeId,
  imageUrl,
  alt,
  sizes = "(max-width: 640px) 50vw, 240px",
  priority = false,
}: {
  recipeId: string;
  imageUrl?: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      setFilePreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const f = item.getAsFile();
          if (f) {
            e.preventDefault();
            pickFile(f);
            return;
          }
        }
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("paste", onPaste);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("paste", onPaste);
    };
  }, [open]);

  function closeModal() {
    setOpen(false);
    setUrl("");
    setFile(null);
    setDragOver(false);
    setError(null);
  }

  function pickFile(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("please pick an image file");
      return;
    }
    if (f.size > MAX_UPLOAD_BYTES) {
      setError("image is too large (max 10 MB)");
      return;
    }
    setFile(f);
    setError(null);
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!file && !url) {
      setError("add a file or URL");
      return;
    }
    startTransition(async () => {
      try {
        if (file) {
          const optimized = await resizeImage(file);
          const blob = await upload(
            blobPathname(recipeId, optimized),
            optimized,
            {
              access: "public",
              handleUploadUrl: "/api/blob/upload",
              clientPayload: JSON.stringify({ recipeId }),
              contentType: optimized.type || undefined,
            },
          );
          const patchRes = await fetch("/api/recipes/set-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipeId, imageUrl: blob.url }),
          });
          if (!patchRes.ok) {
            const data = await patchRes.json().catch(() => ({}));
            setError(data.error ?? "uploaded but failed to save");
            return;
          }
        } else {
          const res = await fetch("/api/recipes/upload-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipeId, imageUrl: url }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.error ?? "something went wrong");
            return;
          }
        }
        closeModal();
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "failed to upload the image",
        );
      }
    });
  }

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes={sizes}
        className="object-contain"
        priority={priority}
      />
    );
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-2xl bg-white"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
          style={{ fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }}
          className="rounded-md border-2 border-dashed border-zinc-400 px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:border-black hover:text-black sm:text-sm"
        >
          upload image
        </button>
      </div>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                closeModal();
              }}
              aria-hidden="true"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="upload-image-title"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
              onClick={(e) => {
                e.stopPropagation();
                closeModal();
              }}
            >
              <div
                className="relative w-full max-w-md rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                style={{
                  fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <h2
                      id="upload-image-title"
                      className="text-lg font-semibold text-black"
                    >
                      upload image
                    </h2>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeModal();
                      }}
                      aria-label="Close"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-black"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <label
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const f = e.dataTransfer.files?.[0];
                        if (f) pickFile(f);
                      }}
                      className={`flex min-h-56 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-4 text-center transition-colors ${
                        dragOver
                          ? "border-black bg-zinc-100"
                          : "border-zinc-300 bg-zinc-50 hover:border-black"
                      }`}
                    >
                      {file ? (
                        <>
                          {filePreview && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={filePreview}
                              alt=""
                              className="h-32 w-32 rounded-lg object-contain"
                            />
                          )}
                          <span className="text-xs text-zinc-500">
                            drop, paste, or select to replace
                          </span>
                        </>
                      ) : (
                        <>
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6 text-zinc-500"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <span className="text-xs text-zinc-500">
                            drop, paste, or select
                          </span>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          pickFile(e.target.files?.[0] ?? null)
                        }
                      />
                    </label>

                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      disabled={!!file}
                      className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm text-black placeholder:text-zinc-400 focus:outline-none disabled:cursor-not-allowed disabled:border-zinc-500 disabled:text-zinc-500 disabled:opacity-50 disabled:placeholder:text-zinc-500"
                    />
                    <button
                      type="submit"
                      disabled={isPending || (!file && !url.trim())}
                      className="w-full rounded-lg border-2 border-zinc-500 bg-white px-4 py-2 text-sm text-zinc-500 shadow-[2px_2px_0_0_rgba(113,113,122,1)] transition-all hover:-translate-y-px hover:border-black hover:text-black hover:shadow-[2px_3px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:border-zinc-500 disabled:hover:text-zinc-500 disabled:hover:shadow-[2px_2px_0_0_rgba(113,113,122,1)]"
                    >
                      {isPending ? "…" : "upload"}
                    </button>
                  </form>

                  {error && (
                    <p className="mt-3 text-sm text-red-600">{error}</p>
                  )}
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
