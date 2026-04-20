import Link from "next/link";

export type Crumb = { label: string; href?: string };

export default function Breadcrumb({
  items,
}: {
  items?: Crumb[];
}) {
  // Drop the current page (last item); only show ancestor links.
  const crumbs = (items ?? []).slice(0, -1);

  return (
    <nav
      aria-label="Breadcrumb"
      style={{ fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }}
      className="flex w-full items-center gap-0 bg-white px-4 py-3 text-sm text-black sm:px-6"
    >
      <span aria-hidden="true" className="shrink-0">
        /
      </span>
      {crumbs.map((item, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex shrink-0 items-center">
            {item.href ? (
              <Link
                href={item.href}
                className="inline-block px-1 font-bold underline underline-offset-2 transition-transform hover:scale-[1.1] active:scale-[0.99]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="px-1">{item.label}</span>
            )}
            {!isLast && (
              <span aria-hidden="true" className="shrink-0">
                /
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
