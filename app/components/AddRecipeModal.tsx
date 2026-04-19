'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'

export default function AddRecipeModal({ userId, meals }: { userId: string; meals: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  function closeModal() {
    setOpen(false)
    setUrl('')
    setError(null)
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const res = await fetch('/api/parse-recipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, userId }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? 'Something went wrong')
        } else {
          router.push(`/${meals}/${data.id}`)
        }
      } catch {
        setError('Failed to connect to the server')
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 w-full items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 text-sm font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-300"
      >
        + Add new recipe
      </button>

      {open && document.body && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-recipe-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={closeModal}
          >
            <div
              className="relative w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-zinc-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2
                    id="add-recipe-title"
                    className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
                  >
                    Add new recipe
                  </h2>
                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/recipe"
                    required
                    autoFocus
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:py-2.5 sm:text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isPending}
                    className="h-11 rounded-lg bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 sm:h-10"
                  >
                    {isPending ? 'Importing…' : 'Add custom recipe'}
                  </button>
                </form>

                {error && (
                  <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
              </div>
            </div>
          </div>
        </>,
        document.body,
      )}
    </>
  )
}
