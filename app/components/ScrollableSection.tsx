"use client";

import { useEffect, useRef, useState } from "react";
import EditButton from "./EditButton";

export default function ScrollableSection({
  heading,
  editLabel,
  children,
  className = "",
  innerClassName = "",
}: {
  heading: React.ReactNode;
  editLabel?: string;
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function update() {
      if (!el) return;
      const canScroll = el.scrollHeight > el.clientHeight + 2;
      const atBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
      setShowArrow(canScroll && !atBottom);
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
    <section className={`relative md:flex md:flex-col ${className}`}>
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-lg font-semibold">{heading}</h2>
        <EditButton label={editLabel ?? `Edit ${typeof heading === "string" ? heading.toLowerCase() : "section"}`} />
      </div>

      <div
        ref={ref}
        className={`[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${innerClassName}`}
      >
        {children}
      </div>

      {showArrow && (
        <button
          type="button"
          onClick={scrollDown}
          aria-label="Scroll down"
          className="absolute bottom-2 right-2 z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-black bg-white text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all hover:-translate-y-px hover:shadow-[2px_3px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
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
        </button>
      )}
    </section>
  );
}
