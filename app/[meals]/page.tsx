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
      <div className="grid grid-cols-2 gap-4">
        {cat.recipes.map((recipe) => (
          <Link
            key={recipe.slug}
            href={`/${cat.slug}/${recipe.slug}`}
            aria-label={recipe.name}
            className="aspect-square rounded-2xl bg-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.99]"
          />
        ))}
      </div>

      <button
        type="button"
        aria-label="Add recipe"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-foreground shadow-lg"
      />
    </main>
  );
}
