"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
    setError(null);
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/recipes/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId, imageUrl: url }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Something went wrong");
        } else {
          closeModal();
          router.refresh();
        }
      } catch {
        setError("Failed to connect to the server");
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

                  <form
                    onSubmit={handleSubmit}
                    className="flex items-stretch gap-2"
                  >
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      required
                      autoFocus
                      className="min-w-0 flex-1 rounded-lg border-2 border-black bg-white px-3 py-2 text-sm text-black placeholder:text-zinc-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="shrink-0 rounded-lg border-2 border-black bg-white px-4 text-sm text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all hover:-translate-y-px hover:shadow-[2px_3px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
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
