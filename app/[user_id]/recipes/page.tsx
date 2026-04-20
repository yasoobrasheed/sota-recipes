import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import AddRecipeModal from "@/app/components/AddRecipeModal";
import RecipeImage from "@/app/components/RecipeImage";

export default async function UserRecipesPage({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  const { user_id } = await params;

  const convexUser = await fetchQuery(api.users.get, {
    id: user_id as Id<"users">,
  }).catch(() => null);
  if (!convexUser) notFound();

  const recipes = await fetchQuery(api.recipes.listByUser, {
    userId: convexUser._id,
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6 md:max-w-5xl">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {recipes.map((recipe) => {
          const label = recipe.name.toLowerCase();
          return (
            <Link
              key={recipe._id}
              href={`/${user_id}/recipes/${recipe._id}`}
              aria-label={label}
              className="flex flex-col items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.99]"
            >
              <div className="relative aspect-square w-[70%]">
                <RecipeImage
                  recipeId={recipe._id}
                  imageUrl={recipe.imageUrl}
                  alt={recipe.name}
                />
              </div>
              <span
                className="line-clamp-2 text-center text-base sm:text-lg"
                style={{
                  fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
      <AddRecipeModal userId={convexUser._id} />
    </main>
  );
}
