'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'

export default function AddRecipeModal({ userId }: { userId: string }) {
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
          router.push(`/${userId}/recipes/${data.id}`)
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
        aria-label="Add new recipe"
        style={{ fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full border-2 border-zinc-500 bg-white text-2xl leading-none text-zinc-500 shadow-[2px_2px_0_0_rgba(113,113,122,1)] transition-all hover:-translate-y-px hover:border-black hover:text-black hover:shadow-[2px_3px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        <span aria-hidden="true" className="block leading-none">+</span>
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
              className="relative w-full max-w-md rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
              style={{ fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2
                    id="add-recipe-title"
                    className="text-lg font-semibold text-black"
                  >
                    new recipe
                  </h2>
                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-black"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex items-stretch gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/recipe"
                    required
                    autoFocus
                    className="min-w-0 flex-1 rounded-lg border-2 border-black bg-white px-3 py-2 text-sm text-black placeholder:text-zinc-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isPending || !url.trim()}
                    className="shrink-0 rounded-lg border-2 border-zinc-500 bg-white px-4 text-sm text-zinc-500 shadow-[2px_2px_0_0_rgba(113,113,122,1)] transition-all hover:-translate-y-px hover:border-black hover:text-black hover:shadow-[2px_3px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:border-zinc-500 disabled:hover:text-zinc-500 disabled:hover:shadow-[2px_2px_0_0_rgba(113,113,122,1)]"
                  >
                    {isPending ? '…' : 'import'}
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
  )
}
