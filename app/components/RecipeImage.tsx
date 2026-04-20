"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";

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
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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
        let res: Response;
        if (file) {
          const fd = new FormData();
          fd.append("recipeId", recipeId);
          fd.append("file", file);
          res = await fetch("/api/recipes/upload-image", {
            method: "POST",
            body: fd,
          });
        } else {
          res = await fetch("/api/recipes/upload-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipeId, imageUrl: url }),
          });
        }
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "something went wrong");
        } else {
          closeModal();
          router.refresh();
        }
      } catch {
        setError("failed to connect to the server");
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
                      className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
                        dragOver
                          ? "border-black bg-zinc-100"
                          : "border-zinc-300 bg-zinc-50 hover:border-black"
                      }`}
                    >
                      {file ? (
                        <>
                          <span className="text-sm text-black">
                            {file.name}
                          </span>
                          <span className="text-xs text-zinc-500">
                            tap to choose a different photo
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-black">
                            drag &amp; drop an image
                          </span>
                          <span className="text-xs text-zinc-500">
                            or tap to choose from your device
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

                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="h-px flex-1 bg-zinc-200" />
                      <span>or paste a URL</span>
                      <span className="h-px flex-1 bg-zinc-200" />
                    </div>

                    <div className="flex items-stretch gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        disabled={!!file}
                        className="min-w-0 flex-1 rounded-lg border-2 border-black bg-white px-3 py-2 text-sm text-black placeholder:text-zinc-400 focus:outline-none disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={isPending || (!file && !url)}
                        className="shrink-0 rounded-lg border-2 border-zinc-500 bg-white px-4 text-sm text-zinc-500 shadow-[2px_2px_0_0_rgba(113,113,122,1)] transition-all hover:-translate-y-px hover:border-black hover:text-black hover:shadow-[2px_3px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:border-zinc-500 disabled:hover:text-zinc-500 disabled:hover:shadow-[2px_2px_0_0_rgba(113,113,122,1)]"
                      >
                        {isPending ? "…" : "upload"}
                      </button>
                    </div>
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
