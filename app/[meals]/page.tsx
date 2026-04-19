import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory } from "@/lib/recipes";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ meals: string }>;
}) {
  const { meals } = await params;
  const cat = getCategory(meals);
  if (!cat) notFound();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-4 pb-24">
      <h1 className="text-xl font-semibold">{cat.name}</h1>

      <div className="grid grid-cols-2 gap-4">
        {cat.recipes.map((recipe) => (
          <Link
            key={recipe.slug}
            href={`/${cat.slug}/${recipe.slug}`}
            className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-300 p-3 text-center text-sm font-medium shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.99] dark:from-zinc-800 dark:to-zinc-900"
          >
            {recipe.name}
          </Link>
        ))}
      </div>

      <button
        type="button"
        aria-label="Add recipe"
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-3xl leading-none text-background shadow-lg"
      >
        +
      </button>
    </main>
  );
}
