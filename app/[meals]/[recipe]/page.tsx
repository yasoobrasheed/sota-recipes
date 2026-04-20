import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import RecipeImage from "@/app/components/RecipeImage";
import ScrollableSection from "@/app/components/ScrollableSection";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ meals: string; recipe: string }>;
}) {
  const { recipe } = await params;

  const data = await fetchQuery(api.recipes.get, {
    id: recipe as Id<"recipes">,
  }).catch(() => null);
  if (!data) notFound();

  return (
    <main
      className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6 md:h-screen md:max-w-4xl md:flex-none md:grid md:grid-cols-2 md:grid-rows-[auto_auto_minmax(0,1fr)] md:gap-x-8 md:gap-y-6 md:overflow-hidden"
      style={{ fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }}
    >
      <h1 className="text-2xl font-semibold md:col-span-2">{data.name}</h1>

      <div className="relative mx-auto aspect-square w-[42%] md:col-start-1 md:row-start-2 md:w-[60%]">
        <RecipeImage
          recipeId={data._id}
          imageUrl={data.imageUrl}
          alt={data.name}
          sizes="(max-width: 768px) 70vw, 400px"
          priority
        />
      </div>

      <ScrollableSection
        className="md:col-start-1 md:row-start-3 md:min-h-0"
        innerClassName="md:h-full md:overflow-y-auto md:pr-2"
      >
        <h2 className="text-lg font-semibold">Ingredients</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {data.ingredients.map((ing, i) => (
            <li key={`${i}-${ing}`}>{ing}</li>
          ))}
        </ul>
      </ScrollableSection>

      <ScrollableSection
        className="md:col-start-2 md:row-start-2 md:row-span-2 md:min-h-0"
        innerClassName="md:h-full md:overflow-y-auto md:pr-2"
      >
        <h2 className="text-lg font-semibold">Method</h2>
        <ol className="mt-2 list-decimal space-y-2 pl-8 text-sm">
          {data.instructions.map((step, i) => (
            <li key={`${i}-${step}`}>{step}</li>
          ))}
        </ol>
      </ScrollableSection>
    </main>
  );
}
