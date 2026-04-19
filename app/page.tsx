import Link from "next/link";
import { categories } from "@/lib/recipes";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/${category.slug}`}
          className="relative flex aspect-[4/3] items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-300 text-2xl font-semibold shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.99] dark:from-zinc-800 dark:to-zinc-900"
        >
          {category.name}
        </Link>
      ))}
    </main>
  );
}
