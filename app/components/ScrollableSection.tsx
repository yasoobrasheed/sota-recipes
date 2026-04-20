"use client";

import { useEffect, useRef, useState } from "react";

const ICON_BUTTON =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-black bg-white text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all hover:-translate-y-px hover:shadow-[2px_3px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";

function PencilIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function DownArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function ScrollableSection({
  children,
  className = "",
  innerClassName = "",
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function update() {
      if (!el) return;
      const canScrollNow = el.scrollHeight > el.clientHeight + 2;
      const atBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
      setCanScroll(canScrollNow);
      setShowArrow(canScrollNow && !atBottom);
    }

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  function scrollDown() {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ top: el.clientHeight * 0.8, behavior: "smooth" });
  }

  return (
    <section className={`relative ${className}`}>
      <div
        ref={ref}
        className={`[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${innerClassName}`}
      >
        {children}
        {!canScroll && (
          <div className="mt-3 flex justify-end">
            <button type="button" aria-label="Edit" className={ICON_BUTTON}>
              <PencilIcon />
            </button>
          </div>
        )}
      </div>

      {canScroll && (
        <button
          type="button"
          aria-label="Edit"
          className={`absolute right-2 z-10 ${ICON_BUTTON} ${
            showArrow ? "bottom-14" : "bottom-2"
          }`}
        >
          <PencilIcon />
        </button>
      )}

      {showArrow && (
        <button
          type="button"
          onClick={scrollDown}
          aria-label="Scroll down"
          className={`absolute bottom-2 right-2 z-10 ${ICON_BUTTON}`}
        >
          <DownArrowIcon />
        </button>
      )}
    </section>
  );
}
