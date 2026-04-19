import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function UserPage({
  params,
}: {
  params: Promise<{ meals: string }>;
}) {
  const { meals } = await params;

  const convexUsers = await fetchQuery(api.users.list, {});
  const convexUser = convexUsers.find(
    (u) => u.name.split(" ")[0].toLowerCase() === meals,
  );
  if (!convexUser) notFound();

  const recipes = await fetchQuery(api.recipes.listByUser, {
    userId: convexUser._id,
  });

  return (
    <main className="mx-auto grid w-full max-w-md flex-1 grid-cols-2 gap-6 p-6 md:max-w-5xl md:grid-cols-4">
      {recipes.map((recipe) => {
        const label = recipe.name.toLowerCase();
        return (
          <Link
            key={recipe._id}
            href={`/${meals}/${recipe._id}`}
            aria-label={label}
            className="flex flex-col items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.99]"
          >
            <div className="relative aspect-square w-[70%]">
              {recipe.imageUrl && (
                <Image
                  src={recipe.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 240px"
                  className="object-contain"
                />
              )}
            </div>
            <span
              className="text-center text-base sm:text-lg"
              style={{
                fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </main>
  );
}
