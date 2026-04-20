export default function EditButton({ label = "Edit" }: { label?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex shrink-0 items-center justify-center p-1 text-zinc-500 transition-all hover:scale-125 hover:text-black"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    </button>
  );
}
