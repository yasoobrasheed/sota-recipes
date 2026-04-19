import { notFound } from "next/navigation";
import { getRecipe } from "@/lib/recipes";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ meals: string; recipe: string }>;
}) {
  const { meals, recipe } = await params;
  const data = getRecipe(meals, recipe);
  if (!data) notFound();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
      <div
        aria-hidden="true"
        className="aspect-square rounded-2xl bg-white shadow-sm"
      />

      <h1 className="text-2xl font-semibold">{data.name}</h1>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ingredients</h2>
          <button
            type="button"
            aria-label="Add ingredient"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xl leading-none text-background"
          >
            +
          </button>
        </div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {data.ingredients.map((ing) => (
            <li key={ing}>{ing}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Recipe</h2>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm">
          {data.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
